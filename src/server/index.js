import fs from "fs";
import debug from "debug";
import { log } from "console";

const logerror = debug("tetris:error"),
  loginfo = debug("tetris:info");

const Game = require("./models/Game");
const Player = require("./models/Player");

let games = {};

const initApp = (app, params, cb) => {
  const { host, port } = params;
  const handler = (req, res) => {
    const file =
      req.url === "/bundle.js" ? "/../../build/bundle.js" : "/../../index.html";
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end("Error loading index.html");
      }
      res.writeHead(200);
      res.end(data);
    });
  };

  app.on("request", handler);

  app.listen({ host, port }, () => {
    loginfo(`tetris listen on ${params.url}`);
    cb();
  });
};

const initEngine = (io) => {
  io.on("connection", function (socket) {
    loginfo("Socket connected: " + socket.id);
    socket.emit("rooms", Object.keys(games));

    socket.on("create-room", (room) => {
      if (games[room]) {
        socket.emit("error", { message: "Room already exists" });
        return;
      }
      games[room] = new Game(room);
      io.emit("new-room", room);
      loginfo(`Room ${room} created by socket ${socket.id}`);
    });

    socket.on("join-room", ({ room, player }) => {
      if (!games[room]) {
        games[room] = new Game(room);
        loginfo(`Room ${room} created on join by ${player}`);
      }
      const p = new Player(socket, player);
      games[room].addPlayer(p);
      socket.join(room);
      const roomPlayers = games[room].players.map((p) => p.name);
      const hostName = games[room].host.name;
      loginfo(`Players in room ${room}:`, roomPlayers, "Host:", hostName);
      io.to(room).emit("player-joined", {
        players: roomPlayers,
        host: hostName,
      });
      loginfo(`${player} joined room ${room}`);
    });

    socket.on("leave-room", ({ room, player }) => {
      if (games[room]) {
        games[room].removePlayer(player);
        socket.leave(room);
        let roomPlayers = games[room].players.map((p) => p.name);
        let hostName = games[room].host ? games[room].host.name : null;
        if (games[room].players.length === 0) {
          delete games[room];
          loginfo(`Room ${room} deleted as it is empty`);
        } else {
          if (hostName === player) {
            games[room].host = games[room].players[0];
            hostName = games[room].host.name;
          }
          io.to(room).emit("player-joined", {
            players: roomPlayers,
            host: hostName,
          });
          loginfo(
            `${player} left room ${room}. Updated players: ${roomPlayers}, Host: ${hostName}`
          );
        }
      }
    });

    socket.on("delete-room", ({ room }) => {
      if (games[room]) {
        delete games[room];
        loginfo(`Room ${room} deleted`);
      }
    });

    socket.on("start-game", ({ room }) => {
      loginfo(`📨 Received start-game for room ${room}`);

      const game = games[room];
      if (!game) {
        loginfo(`❌ Room ${room} not found`);
        return;
      }

      game.reset();

      const firstPiece = game.generateNextPiece();

      io.to(room).emit("game-started", {
        piece: firstPiece.serialize(),
      });

      loginfo(
        `🚀 Game started in room ${room}, first piece: ${firstPiece.type}`
      );
    });

    socket.on("piece-placed", ({ room, player }) => {
      const game = games[room];
      if (!game) return;

      const nextPiece = game.onPlayerPlacedPiece(player);
      loginfo(
        `Player ${player} placed a piece in room ${room}. Next piece:`,
        nextPiece
      );
      if (!nextPiece) {
        loginfo(`No next piece for player ${player} in room ${room}`);
        return;
      }

      const foundPlayer = game.players.find((p) => p.name === player);
      const targetSocket = foundPlayer ? foundPlayer.socket : null;
      loginfo(
        `Emitting next-piece to player ${player} in room ${room}:`,
        nextPiece
      );
      if (!targetSocket) {
        logerror(`No socket found for player ${player} in room ${room}`);
        return;
      }
      if (targetSocket) {
        targetSocket.emit("next-piece", { piece: nextPiece });
      }
    });

    socket.on("game-over", ({ room, player }) => {
      const game = games[room];
      if (!game) return;

      const currentPlayer = game.players.find((p) => p.name === player);
      if (currentPlayer) {
        currentPlayer.isGameOver = true;
        loginfo(`Player ${player} is now in Game Over in room ${room}`);
      }

      const activePlayers = game.players.filter(
        (p) => !p.isGameOver && p.socket.connected
      );

      if (activePlayers.length === 1) {
        const winner = activePlayers[0].name;
        loginfo(`🏆 Player ${winner} has won the game in room ${room}`);

        io.to(room).emit("game-won", { winner });
      }
    });

    socket.on("action", (action) => {
      if (action.type === "server/ping") {
        socket.emit("action", { type: "pong" });
      }
    });

    socket.on("disconnect", () => {
      loginfo(`Socket disconnected: ${socket.id}`);
      for (const [roomName, game] of Object.entries(games)) {
        const player = game.players.find((p) => p.socket.id === socket.id);
        if (player) {
          game.removePlayer(player.name);
          loginfo(`Player ${player.name} disconnected from room ${roomName}`);
          break;
        }
      }
    });
  });
};

export function create(params) {
  const promise = new Promise((resolve, reject) => {
    const app = require("http").createServer();
    initApp(app, params, () => {
      const io = require("socket.io")(app, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });
      const stop = (cb) => {
        io.close();
        app.close(() => {
          app.unref();
        });
        loginfo(`Engine stopped.`);
        cb();
      };

      initEngine(io);
      resolve({ stop });
    });
  });
  return promise;
}
