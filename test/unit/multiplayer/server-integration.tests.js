import chai from "chai";
import io from "socket.io-client";

chai.should();

const { create } = require("../../../src/server/index");

/**
 * Tests d'Intégration - Serveur Red Tetris
 * Adaptés à votre implémentation réelle
 */

describe("Server Integration Tests", () => {
  let server, client1, client2, client3;
  const serverParams = {
    host: "localhost",
    port: 3006, // Port différent pour éviter les conflits
    url: "http://localhost:3006",
  };

  // Démarrer le serveur avant tous les tests
  before(function (done) {
    this.timeout(5000);

    create(serverParams)
      .then((srv) => {
        server = srv;
        done();
      })
      .catch(done);
  });

  // Arrêter le serveur après tous les tests
  after(function (done) {
    if (server) {
      server.stop(done);
    } else {
      done();
    }
  });

  // Déconnecter tous les clients après chaque test
  afterEach(() => {
    if (client1 && client1.connected) client1.disconnect();
    if (client2 && client2.connected) client2.disconnect();
    if (client3 && client3.connected) client3.disconnect();
  });

  describe("Connection", () => {
    it("should allow a client to connect", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);

      client1.on("connect", () => {
        client1.connected.should.be.true;
        done();
      });

      client1.on("connect_error", done);
    });

    it("should send available rooms on connection", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);

      client1.on("rooms", (rooms) => {
        rooms.should.be.an("array");
        done();
      });
    });
  });

  describe("Room Creation", () => {
    it("should create a new room", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);
      const roomName = "test-room-" + Date.now();

      client1.on("connect", () => {
        client1.emit("create-room", roomName);
      });

      client1.on("new-room", (room) => {
        room.should.equal(roomName);
        done();
      });
    });

    it("should not create duplicate rooms", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);
      const roomName = "duplicate-room-" + Date.now();

      client1.on("connect", () => {
        client1.emit("create-room", roomName);

        setTimeout(() => {
          client1.emit("create-room", roomName); // Try to create again
        }, 500);
      });

      client1.on("error", (error) => {
        error.message.should.equal("Room already exists");
        done();
      });
    });
  });

  describe("Joining Rooms", () => {
    it("should allow player to join a room", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);
      const roomName = "join-room-" + Date.now();

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        data.players.should.include("Alice");
        data.host.should.equal("Alice"); // First player is host
        done();
      });
    });

    it("should allow multiple players to join", function (done) {
      this.timeout(5000);

      const roomName = "multi-join-" + Date.now();
      let joinCount = 0;

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      const checkBothJoined = () => {
        joinCount++;
        if (joinCount === 2) {
          done();
        }
      };

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 2) {
          data.players.should.include("Alice");
          data.players.should.include("Bob");
          data.host.should.equal("Alice");
          checkBothJoined();
        }
      });

      setTimeout(() => {
        client2.on("connect", () => {
          client2.emit("join-room", { room: roomName, player: "Bob" });
        });

        client2.on("player-joined", checkBothJoined);
      }, 1000);
    });

    it("should reject duplicate player names in same room", function (done) {
      this.timeout(5000);

      const roomName = "duplicate-player-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", () => {
        client2.on("connect", () => {
          client2.emit("join-room", { room: roomName, player: "Alice" });
        });
      });

      client2.on("error", (error) => {
        error.message.should.equal("Player name already taken in this room");
        done();
      });
    });
  });

  describe("Host Transfer (CRITIQUE)", () => {
    it("should transfer host when host leaves", function (done) {
      this.timeout(5000);

      const roomName = "host-transfer-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          // Alice joined, now add Bob
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        }
      });

      client2.on("player-joined", (data) => {
        if (data.players.length === 2) {
          // Both joined, Alice is host
          data.host.should.equal("Alice");

          // Alice leaves
          setTimeout(() => {
            client1.emit("leave-room", { room: roomName, player: "Alice" });
          }, 500);
        }
      });

      client2.on("host-changed", (data) => {
        data.newHost.should.equal("Bob");
        data.oldHost.should.equal("Alice");
        done();
      });
    });

    it("should transfer host on disconnect", function (done) {
      this.timeout(5000);

      const roomName = "host-disconnect-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        }
      });

      client2.on("player-joined", (data) => {
        if (data.players.length === 2) {
          // Both joined, disconnect Alice
          setTimeout(() => {
            client1.disconnect();
          }, 500);
        }
      });

      client2.on("host-changed", (data) => {
        data.newHost.should.equal("Bob");
        data.oldHost.should.equal("Alice");
        done();
      });
    });
  });

  describe("Starting Game", () => {
    it("only host should be able to start game", function (done) {
      this.timeout(5000);

      const roomName = "start-game-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          // Try to start as non-host (Bob)
          setTimeout(() => {
            client2.emit("start-game", { room: roomName });
          }, 500);
        }
      });

      client2.on("error", (error) => {
        error.message.should.equal("Only the host can start the game");
        done();
      });
    });

    it("should start game and send first piece", function (done) {
      this.timeout(5000);

      const roomName = "game-start-" + Date.now();

      client1 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", () => {
        setTimeout(() => {
          client1.emit("start-game", { room: roomName });
        }, 500);
      });

      client1.on("game-started", (data) => {
        data.should.have.property("piece");
        data.piece.should.have.property("type");
        data.piece.type.should.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
        done();
      });
    });
  });

  describe("Penalty Lines (Règle n-1)", () => {
    it("should send correct penalty for 2 lines cleared", function (done) {
      this.timeout(5000);

      const roomName = "penalty-2-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          setTimeout(() => {
            // Alice clears 2 lines
            client1.emit("lines-cleared", {
              room: roomName,
              player: "Alice",
              lines: 2,
            });
          }, 500);
        }
      });

      client2.on("receive-penalty", (data) => {
        data.count.should.equal(1); // 2 lines - 1 = 1 penalty
        done();
      });
    });

    it("should send correct penalty for 4 lines cleared (Tetris)", function (done) {
      this.timeout(5000);

      const roomName = "penalty-4-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          setTimeout(() => {
            // Alice clears 4 lines (Tetris)
            client1.emit("lines-cleared", {
              room: roomName,
              player: "Alice",
              lines: 4,
            });
          }, 500);
        }
      });

      client2.on("receive-penalty", (data) => {
        data.count.should.equal(3); // 4 lines - 1 = 3 penalty
        done();
      });
    });

    it("should NOT send penalty for 1 line cleared", function (done) {
      this.timeout(3000);

      const roomName = "penalty-1-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          setTimeout(() => {
            // Alice clears 1 line
            client1.emit("lines-cleared", {
              room: roomName,
              player: "Alice",
              lines: 1,
            });
          }, 500);

          // Wait a bit to ensure no penalty is sent
          setTimeout(() => {
            done(); // Success: no penalty received
          }, 1000);
        }
      });

      client2.on("receive-penalty", () => {
        done(new Error("Should NOT receive penalty for 1 line"));
      });
    });
  });

  describe("Spectrum Updates", () => {
    it("should broadcast spectrum to other players", function (done) {
      this.timeout(5000);

      const roomName = "spectrum-" + Date.now();
      const testSpectrum = Array(20)
        .fill(null)
        .map(() => Array(5).fill(0));

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          setTimeout(() => {
            client1.emit("spectrum-update", {
              room: roomName,
              player: "Alice",
              spectrum: testSpectrum,
            });
          }, 500);
        }
      });

      client2.on("opponent-spectrum", (data) => {
        data.player.should.equal("Alice");
        data.spectrum.should.exist;
        done();
      });
    });
  });

  describe("Game Over and Auto-Win", () => {
    it("should detect auto-win when one player left", function (done) {
      this.timeout(8000);

      const roomName = "auto-win-" + Date.now();

      client1 = io(serverParams.url);
      client2 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("join-room", { room: roomName, player: "Alice" });
      });

      client1.on("player-joined", (data) => {
        if (data.players.length === 1) {
          client2.on("connect", () => {
            client2.emit("join-room", { room: roomName, player: "Bob" });
          });
        } else if (data.players.length === 2) {
          // Start game
          setTimeout(() => {
            client1.emit("start-game", { room: roomName });
          }, 500);
        }
      });

      client1.on("game-started", () => {
        // Bob loses
        setTimeout(() => {
          client2.emit("game-over", { room: roomName, player: "Bob" });
        }, 1000);
      });

      client1.on("game-won", (data) => {
        data.winner.should.equal("Alice");
        done();
      });
    });
  });

  describe("Ping/Pong", () => {
    it("should respond to ping with pong", function (done) {
      this.timeout(3000);

      client1 = io(serverParams.url);

      client1.on("connect", () => {
        client1.emit("action", { type: "server/ping" });
      });

      client1.on("action", (action) => {
        if (action.type === "pong") {
          done();
        }
      });
    });
  });
});

/**
 * ✅ TESTS D'INTÉGRATION COUVERTS :
 *
 * - Connexion au serveur
 * - Création de rooms
 * - Jonction de joueurs
 * - Transfert d'hôte (déconnexion et leave)
 * - Démarrage de partie (seul l'hôte peut démarrer)
 * - Règle n-1 des pénalités (1→0, 2→1, 4→3)
 * - Mise à jour du spectre
 * - Auto-win quand un seul joueur reste
 * - Ping/Pong
 *
 * ⚠️  ATTENTION : Ces tests utilisent le port 3006
 * Si ce port est occupé, changez-le dans serverParams
 *
 * 📊 COUVERTURE ATTENDUE :
 * - server/index.js : amélioration significative (3% → 50%+)
 * - server/models/Game.js : couverture des méthodes appelées
 */
