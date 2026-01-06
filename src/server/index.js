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

const getAvailableRooms = () => {
  return Object.keys(games).filter((roomName) => !games[roomName].started);
};

const checkForAutoWin = (game, room, io) => {
  if (!game.started) return;

  const activePlayers = game.players.filter(
    (p) => !p.isGameOver && p.isPlaying
  );

  loginfo(
    `🔍 Checking auto-win in room ${room}: ${activePlayers.length} active player(s)`
  );

  if (activePlayers.length === 1) {
    const winner = activePlayers[0].name;
    activePlayers[0].isPlaying = false;

    loginfo(
      `🏆 AUTO-WIN: ${winner} wins in room ${room} (last player standing)`
    );

    io.to(room).emit("game-won", { winner });
    return true;
  }

  if (activePlayers.length === 0) {
    loginfo(`⚠️ No active players left in room ${room}, game over`);
    return true;
  }

  return false;
};

const initEngine = (io) => {
  io.on("connection", function (socket) {
    loginfo("Socket connected: " + socket.id);

    const availableRooms = getAvailableRooms();
    socket.emit("rooms", availableRooms);
    loginfo(`📋 Sent ${availableRooms.length} available room(s) to new client`);

    // 🆕 Handler pour demander explicitement la liste des rooms
    socket.on("get-rooms", () => {
      const availableRooms = getAvailableRooms();
      socket.emit("rooms", availableRooms);
      loginfo(
        `📋 Client ${socket.id} requested rooms: ${availableRooms.length} available`
      );
    });

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
        games[room] = new Game(room, room);
        loginfo(`Room ${room} created on join by ${player}`);
      }

      const game = games[room];

      const existingPlayer = game.players.find((p) => p.name === player);
      if (existingPlayer) {
        socket.emit("error", {
          message: "Player name already taken in this room",
        });
        loginfo(`⚠️ ${player} tried to join ${room} but name is taken`);
        return;
      }

      if (game.started) {
        socket.emit("error", { message: "Game already started" });
        loginfo(`⚠️ ${player} tried to join started game ${room}`);
        return;
      }

      const p = new Player(socket, player);
      game.addPlayer(p);
      socket.join(room);

      const roomPlayers = game.players.map((p) => p.name);
      const hostName = game.host.name;

      loginfo(
        `✅ ${player} joined room ${room}. Players: [${roomPlayers}], Host: ${hostName}`
      );

      io.to(room).emit("player-joined", {
        players: roomPlayers,
        host: hostName,
      });
    });

    socket.on("leave-room", ({ room, player }) => {
      if (!games[room]) {
        games[room] = new Game(room, room);
      }

      const game = games[room];
      const wasHost = game.host && game.host.name === player;

      game.removePlayer(player);
      socket.leave(room);

      loginfo(`🚪 ${player} left room ${room}. Was host: ${wasHost}`);

      if (game.players.length === 0) {
        delete games[room];
        loginfo(`🗑️ Room ${room} deleted (empty)`);
        return;
      }

      const gameEnded = checkForAutoWin(game, room, io);
      if (gameEnded) {
        loginfo(`🎮 Game ended in room ${room} after player left`);
      }

      let newHost = null;
      if (wasHost && game.players.length > 0) {
        game.host = game.players[0];
        newHost = game.host.name;

        loginfo(
          `👑 Host transferred from ${player} to ${newHost} in room ${room}`
        );

        io.to(room).emit("host-changed", {
          newHost: newHost,
          oldHost: player,
        });
      }

      const roomPlayers = game.players.map((p) => p.name);
      const hostName = game.host ? game.host.name : null;

      io.to(room).emit("player-left", {
        player: player,
        players: roomPlayers,
        host: hostName,
      });

      loginfo(
        `Updated room ${room}: Players: [${roomPlayers}], Host: ${hostName}`
      );
    });

    socket.on("delete-room", ({ room }) => {
      if (games[room]) {
        delete games[room];
        loginfo(`Room ${room} deleted`);
      }
    });

    socket.on("start-game", ({ room }) => {
      loginfo(`🔨 Received start-game for room ${room}`);

      const game = games[room];
      if (!game) {
        loginfo(`❌ Room ${room} not found`);
        return;
      }

      const requester = game.players.find((p) => p.socket.id === socket.id);
      if (!requester) {
        socket.emit("error", { message: "You are not in this room" });
        loginfo(
          `⚠️ Socket ${socket.id} tried to start game but is not in room ${room}`
        );
        return;
      }

      if (game.host.name !== requester.name) {
        socket.emit("error", { message: "Only the host can start the game" });
        loginfo(
          `⚠️ ${requester.name} tried to start game but is not host (host is ${game.host.name})`
        );
        return;
      }

      const someStillPlaying = game.players.some((p) => p.isPlaying);

      if (someStillPlaying) {
        socket.emit("error", {
          message:
            "You cannot restart the game while other players are still playing.",
        });
        loginfo(
          `⛔ Cannot restart game in room ${room}, some players still playing`
        );
        return;
      }

      game.reset();

      const firstPiece = game.generateNextPiece();

      io.to(room).emit("game-started", {
        piece: firstPiece.serialize(),
      });

      const availableRooms = getAvailableRooms();
      io.emit("rooms-update", availableRooms);

      loginfo(
        `🚀 Game started in room ${room} by ${requester.name} (host), first piece: ${firstPiece.type}`
      );
      loginfo(`📋 Updated available rooms: [${availableRooms}]`);
    });

    socket.on("spectrum-update", ({ room, player, spectrum }) => {
      const game = games[room];
      if (!game) return;

      // Envoyer le spectrum à tous les AUTRES joueurs de la room
      socket.to(room).emit("opponent-spectrum", {
        player: player,
        spectrum: spectrum,
      });

      // loginfo(`📊 Spectrum update from ${player} in room ${room}`);
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

    socket.on("lines-cleared", ({ room, player, lines }) => {
      const game = games[room];
      if (!game) return;

      const penaltyLines = lines - 1;

      if (penaltyLines <= 0) {
        loginfo(
          `${player} cleared only 1 line in room ${room}, no penalty (1-1=0)`
        );
        return;
      }

      loginfo(`Player ${player} cleared ${lines} line(s) in room ${room}`);

      game.players.forEach((p) => {
        if (p.name !== player && !p.isGameOver && p.socket.connected) {
          p.socket.emit("receive-penalty", {
            count: penaltyLines,
          });
        }
      });

      loginfo(
        `💣 ${player} cleared ${lines} line(s), sent ${penaltyLines} penalty line(s) to opponents`
      );
    });

    socket.on("game-over", ({ room, player }) => {
      const game = games[room];
      if (!game) return;

      const currentPlayer = game.players.find((p) => p.name === player);
      if (currentPlayer) {
        currentPlayer.isGameOver = true;
        currentPlayer.isPlaying = false;
        loginfo(`Player ${player} is now in Game Over in room ${room}`);
      }

      checkForAutoWin(game, room, io);
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
          const playerName = player.name;
          const wasHost = game.host && game.host.name === playerName;

          game.removePlayer(playerName);
          loginfo(
            `🚪 ${playerName} disconnected from room ${roomName}. Was host: ${wasHost}`
          );

          if (game.players.length === 0) {
            delete games[roomName];
            loginfo(`🗑️ Room ${roomName} deleted (empty after disconnect)`);

            const availableRooms = getAvailableRooms();
            io.emit("rooms-update", availableRooms);
            break;
          }

          const gameEnded = checkForAutoWin(game, roomName, io);
          if (gameEnded) {
            loginfo(`🎮 Game ended in room ${roomName} after disconnect`);
          }

          if (wasHost && game.players.length > 0) {
            game.host = game.players[0];
            const newHost = game.host.name;

            loginfo(
              `👑 Host auto-transferred from ${playerName} to ${newHost} in room ${roomName}`
            );

            io.to(roomName).emit("host-changed", {
              newHost: newHost,
              oldHost: playerName,
            });
          }

          const roomPlayers = game.players.map((p) => p.name);
          const hostName = game.host ? game.host.name : null;

          io.to(roomName).emit("player-left", {
            player: playerName,
            players: roomPlayers,
            host: hostName,
          });

          loginfo(
            `Updated room ${roomName} after disconnect: Players: [${roomPlayers}], Host: ${hostName}`
          );
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
