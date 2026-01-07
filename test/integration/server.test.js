import { expect } from "chai";
import ioClient from "socket.io-client";

const params = {
  host: "0.0.0.0",
  port: 3007, // Nouveau port
  url: "http://0.0.0.0:3007",
};

let server;

describe("Server Integration Tests - Maximum Coverage", () => {
  before((done) => {
    const { create } = require("../../src/server/index.js");
    create(params).then((engine) => {
      server = engine;
      done();
    });
  });

  after((done) => {
    if (server) {
      server.stop(done);
    } else {
      done();
    }
  });

  describe("Complete Game Flow - Full Coverage", () => {
    let client1, client2, client3;

    beforeEach((done) => {
      client1 = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });
      client1.on("connect", () => {
        client2 = ioClient(params.url, {
          transports: ["websocket"],
          forceNew: true,
        });
        client2.on("connect", () => {
          client3 = ioClient(params.url, {
            transports: ["websocket"],
            forceNew: true,
          });
          client3.on("connect", done);
        });
      });
    });

    afterEach((done) => {
      if (client1) client1.disconnect();
      if (client2) client2.disconnect();
      if (client3) client3.disconnect();
      setTimeout(done, 150);
    });

    it("should handle full 3-player game with all events", (done) => {
      const roomName = `full-game-${Date.now()}`;

      // Track all events
      let eventsReceived = {
        playerJoined: 0,
        gameStarted: 0,
        spectrumUpdate: 0,
        piecePlaced: 0,
        linesCleared: 0,
        penalty: 0,
        gameOver: 0,
        gameWon: 0,
      };

      // Player 1 joins (becomes host)
      client1.emit("join-room", { room: roomName, player: "Player1" });

      client1.on("player-joined", () => {
        eventsReceived.playerJoined++;

        // Player 2 joins
        client2.emit("join-room", { room: roomName, player: "Player2" });
      });

      client2.on("player-joined", () => {
        eventsReceived.playerJoined++;

        // Player 3 joins
        client3.emit("join-room", { room: roomName, player: "Player3" });
      });

      client3.on("player-joined", () => {
        eventsReceived.playerJoined++;

        // Host starts game
        client1.emit("start-game", { room: roomName });
      });

      // All players receive game-started
      const gameStartedHandler = (data) => {
        eventsReceived.gameStarted++;

        expect(data).to.have.property("piece");
        expect(data).to.have.property("nextPiece");

        if (eventsReceived.gameStarted === 3) {
          // All players started, simulate gameplay

          // Player 1 sends spectrum
          client1.emit("spectrum-update", {
            room: roomName,
            player: "Player1",
            spectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          });

          // Player 1 places piece
          setTimeout(() => {
            client1.emit("piece-placed", { room: roomName, player: "Player1" });
          }, 50);

          // Player 2 clears lines
          setTimeout(() => {
            client2.emit("lines-cleared", {
              room: roomName,
              player: "Player2",
              lines: 3,
            });
          }, 100);

          // Player 3 loses
          setTimeout(() => {
            client3.emit("game-over", { room: roomName, player: "Player3" });
          }, 150);

          // Player 2 loses (Player 1 wins)
          setTimeout(() => {
            client2.emit("game-over", { room: roomName, player: "Player2" });
          }, 200);
        }
      };

      client1.on("game-started", gameStartedHandler);
      client2.on("game-started", gameStartedHandler);
      client3.on("game-started", gameStartedHandler);

      // Track spectrum updates
      client2.on("opponent-spectrum", (data) => {
        eventsReceived.spectrumUpdate++;
        expect(data.player).to.equal("Player1");
      });

      // Track next-piece
      client1.on("next-piece", (data) => {
        eventsReceived.piecePlaced++;
        expect(data.piece.type).to.be.oneOf([
          "I",
          "O",
          "T",
          "S",
          "Z",
          "J",
          "L",
        ]);
      });

      // Track penalties
      const penaltyHandler = (data) => {
        eventsReceived.penalty++;
        expect(data.count).to.equal(2); // 3-1
      };

      client1.on("receive-penalty", penaltyHandler);
      client3.on("receive-penalty", penaltyHandler);

      // Track game-won
      let gameWonReceived = false;
      const gameWonHandler = (data) => {
        if (!gameWonReceived) {
          gameWonReceived = true;
          eventsReceived.gameWon++;
          expect(data.winner).to.equal("Player1");

          // Verify all events were tracked
          expect(eventsReceived.playerJoined).to.be.greaterThan(0);
          expect(eventsReceived.gameStarted).to.equal(3);
          expect(eventsReceived.spectrumUpdate).to.be.greaterThan(0);
          expect(eventsReceived.piecePlaced).to.be.greaterThan(0);
          expect(eventsReceived.penalty).to.equal(2); // P1 and P3
          expect(eventsReceived.gameWon).to.equal(1);

          done();
        }
      };

      client1.on("game-won", gameWonHandler);
      client2.on("game-won", gameWonHandler);
      client3.on("game-won", gameWonHandler);
    }).timeout(10000);
  });

  describe("Edge Cases - Maximum Coverage", () => {
    let client;

    beforeEach((done) => {
      client = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });
      client.on("connect", done);
    });

    afterEach((done) => {
      if (client) client.disconnect();
      setTimeout(done, 100);
    });

    it("should handle piece-placed with no player found", (done) => {
      const roomName = `no-player-${Date.now()}`;

      client.emit("join-room", { room: roomName, player: "ValidPlayer" });

      client.on("player-joined", () => {
        client.emit("start-game", { room: roomName });

        client.on("game-started", () => {
          // Emit piece-placed for non-existent player
          client.emit("piece-placed", {
            room: roomName,
            player: "NonExistentPlayer",
          });

          // Should not crash
          setTimeout(done, 100);
        });
      });
    });

    it("should handle lines-cleared for non-existent room", (done) => {
      client.emit("lines-cleared", {
        room: "non-existent-room",
        player: "Ghost",
        lines: 4,
      });

      // Should not crash
      setTimeout(done, 100);
    });

    it("should handle game-over for non-existent room", (done) => {
      client.emit("game-over", {
        room: "non-existent-room",
        player: "Ghost",
      });

      // Should not crash
      setTimeout(done, 100);
    });

    it("should handle spectrum-update for non-existent room", (done) => {
      client.emit("spectrum-update", {
        room: "non-existent-room",
        player: "Ghost",
        spectrum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });

      // Should not crash
      setTimeout(done, 100);
    });
  });

  describe("Room State Transitions", () => {
    let client1, client2;

    beforeEach((done) => {
      client1 = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });
      client1.on("connect", () => {
        client2 = ioClient(params.url, {
          transports: ["websocket"],
          forceNew: true,
        });
        client2.on("connect", done);
      });
    });

    afterEach((done) => {
      if (client1) client1.disconnect();
      if (client2) client2.disconnect();
      setTimeout(done, 100);
    });

    it("should allow creating room after leaving", (done) => {
      const roomName = `rejoin-${Date.now()}`;

      client1.emit("join-room", { room: roomName, player: "Player1" });

      client1.on("player-joined", () => {
        client1.emit("leave-room", { room: roomName, player: "Player1" });

        setTimeout(() => {
          // Rejoin
          client1.emit("join-room", { room: roomName, player: "Player1" });

          client1.on("player-joined", () => {
            done();
          });
        }, 100);
      });
    });

    it("should handle multiple quick joins/leaves", (done) => {
      const roomName = `quick-${Date.now()}`;

      let joinCount = 0;

      client1.on("player-joined", () => {
        joinCount++;

        if (joinCount === 1) {
          client2.emit("join-room", { room: roomName, player: "P2" });
        } else if (joinCount === 2) {
          client1.emit("leave-room", { room: roomName, player: "P1" });

          setTimeout(() => {
            client1.emit("join-room", { room: roomName, player: "P1" });
          }, 50);
        } else if (joinCount === 3) {
          done();
        }
      });

      client1.emit("join-room", { room: roomName, player: "P1" });
    });
  });

  describe("Penalty Edge Cases", () => {
    let client1, client2;

    beforeEach((done) => {
      client1 = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });
      client1.on("connect", () => {
        client2 = ioClient(params.url, {
          transports: ["websocket"],
          forceNew: true,
        });
        client2.on("connect", done);
      });
    });

    afterEach((done) => {
      if (client1) client1.disconnect();
      if (client2) client2.disconnect();
      setTimeout(done, 100);
    });

    it("should handle zero lines cleared", (done) => {
      const roomName = `zero-lines-${Date.now()}`;

      client1.emit("join-room", { room: roomName, player: "P1" });

      let joinedCount = 0;

      const handleJoined = () => {
        joinedCount++;

        if (joinedCount === 1) {
          client2.emit("join-room", { room: roomName, player: "P2" });
        } else if (joinedCount === 2) {
          client1.emit("start-game", { room: roomName });
        }
      };

      client1.on("player-joined", handleJoined);
      client2.on("player-joined", handleJoined);

      client1.on("game-started", () => {
        let penaltyReceived = false;

        client2.on("receive-penalty", () => {
          penaltyReceived = true;
        });

        client1.emit("lines-cleared", {
          room: roomName,
          player: "P1",
          lines: 0,
        });

        setTimeout(() => {
          expect(penaltyReceived).to.be.false;
          done();
        }, 100);
      });
    });
  });

  describe("Connection Events", () => {
    it("should receive rooms list on connection", (done) => {
      const client = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });

      client.on("rooms", (rooms) => {
        expect(rooms).to.be.an("array");
        client.disconnect();
        done();
      });
    });

    it("should log connection with socket id", (done) => {
      const client = ioClient(params.url, {
        transports: ["websocket"],
        forceNew: true,
      });

      client.on("connect", () => {
        expect(client.id).to.be.a("string");
        client.disconnect();
        done();
      });
    });
  });
});
