import chai from "chai";
import sinon from "sinon";

chai.should();

const Game = require("../../../src/server/models/Game");
const Player = require("../../../src/server/models/Player");
const Piece = require("../../../src/server/models/Piece");

/**
 * Tests pour Game.js - Version avec générateur déterministe
 *
 * ⚠️  PROBLÈME DÉTECTÉ dans votre code uploadé :
 * Vous avez DEUX fonctions generateNextPiece() (ligne 26 et ligne 118)
 * → Supprimez celle de la ligne 118 qui utilise getRandomType()
 */

describe("Game Model", () => {
  describe("Constructor", () => {
    it("should create a game with a room name", () => {
      const game = new Game("test-room");

      game.room.should.equal("test-room");
      game.players.should.be.an("array").that.is.empty;
      chai.expect(game.host).to.be.null;
      game.started.should.be.false;
      game.pieceQueue.should.be.an("array").that.is.empty;
    });
  });

  describe("Player Management", () => {
    let game, socket;

    beforeEach(() => {
      game = new Game("test-room");
      socket = { id: "socket-123", emit: sinon.spy() };
    });

    it("should add a player", () => {
      const player = new Player(socket, "Alice");
      game.addPlayer(player);

      game.players.should.have.lengthOf(1);
      game.players[0].name.should.equal("Alice");
    });

    it("first player should become host", () => {
      const player1 = new Player(socket, "Alice");
      game.addPlayer(player1);

      game.host.should.equal(player1);
      game.host.name.should.equal("Alice");
    });

    it("should add multiple players", () => {
      const player1 = new Player(socket, "Alice");
      const player2 = new Player({ id: "socket-456" }, "Bob");

      game.addPlayer(player1);
      game.addPlayer(player2);

      game.players.should.have.lengthOf(2);
      game.host.should.equal(player1); // First player still host
    });
  });

  describe("Host Transfer (CRITIQUE)", () => {
    let game, socket1, socket2, socket3;

    beforeEach(() => {
      game = new Game("test-room");
      socket1 = { id: "socket-1", emit: sinon.spy() };
      socket2 = { id: "socket-2", emit: sinon.spy() };
      socket3 = { id: "socket-3", emit: sinon.spy() };
    });

    it("should transfer host when host leaves", () => {
      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");
      const player3 = new Player(socket3, "Charlie");

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);

      game.host.name.should.equal("Alice");

      // Alice (host) leaves
      const result = game.removePlayer("Alice");

      result.wasHost.should.be.true;
      result.newHost.should.exist;
      result.newHost.name.should.equal("Bob"); // Next player becomes host
      game.host.name.should.equal("Bob");
    });

    it("should NOT transfer host when non-host leaves", () => {
      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");

      game.addPlayer(player1);
      game.addPlayer(player2);

      // Bob (non-host) leaves
      const result = game.removePlayer("Bob");

      result.wasHost.should.be.false;
      game.host.name.should.equal("Alice"); // Host unchanged
    });

    it("should have no host when last player leaves", () => {
      const player1 = new Player(socket1, "Alice");
      game.addPlayer(player1);

      const result = game.removePlayer("Alice");

      result.wasHost.should.be.true;
      chai.expect(result.newHost).to.be.null;
      chai.expect(game.host).to.be.null;
    });

    it("should return correct player count after removal", () => {
      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");
      const player3 = new Player(socket3, "Charlie");

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);

      const result = game.removePlayer("Bob");

      result.playersRemaining.should.equal(2);
      game.players.should.have.lengthOf(2);
    });
  });

  describe("Constructor with Seed", () => {
    it("should initialize with default seed from room name", () => {
      const game = new Game("test-room");

      game.seed.should.equal("test-room");
      game.rng.should.be.a("function");
      game.currentBag.should.be.an("array").that.is.empty;
    });

    it("should accept a custom seed", () => {
      const game = new Game("test-room", "custom-seed");

      game.seed.should.equal("custom-seed");
    });
  });

  describe("✅ Deterministic Piece Generation", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room", "fixed-seed");
    });

    it("should generate a piece", () => {
      const piece = game.generateNextPiece();

      piece.should.be.instanceof(Piece);
      piece.type.should.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
    });

    it("should add piece to queue", () => {
      game.generateNextPiece();
      game.generateNextPiece();

      game.pieceQueue.should.have.lengthOf(2);
    });

    it("✅ same seed should produce same sequence", () => {
      const game1 = new Game("room1", "test-seed");
      const game2 = new Game("room2", "test-seed");

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 50; i++) {
        sequence1.push(game1.generateNextPiece().type);
        sequence2.push(game2.generateNextPiece().type);
      }

      sequence1.should.deep.equal(sequence2);
    });

    it("✅ different seeds should produce different sequences", () => {
      const game1 = new Game("room1", "seed-A");
      const game2 = new Game("room2", "seed-B");

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 20; i++) {
        sequence1.push(game1.generateNextPiece().type);
        sequence2.push(game2.generateNextPiece().type);
      }

      sequence1.should.not.deep.equal(sequence2);
    });

    it("✅ should use 7-bag system (all pieces in 7 pieces)", () => {
      const game = new Game("test-room", "bag-test");
      const firstBag = [];

      for (let i = 0; i < 7; i++) {
        firstBag.push(game.generateNextPiece().type);
      }

      // Vérifier que tous les 7 types sont présents
      const expectedTypes = ["I", "O", "T", "S", "Z", "J", "L"];
      const sortedBag = [...firstBag].sort();
      const sortedExpected = [...expectedTypes].sort();

      sortedBag.should.deep.equal(sortedExpected);
    });

    it("✅ should have fair distribution over 70 pieces (10 bags)", () => {
      const game = new Game("test-room", "distribution-test");
      const counts = {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      };

      for (let i = 0; i < 70; i++) {
        const type = game.generateNextPiece().type;
        counts[type]++;
      }

      // Chaque pièce devrait apparaître exactement 10 fois
      Object.values(counts).forEach((count) => {
        count.should.equal(10);
      });
    });

    it("should serialize pieces", () => {
      const piece = game.generateNextPiece();
      const serialized = piece.serialize();

      serialized.should.have.property("type");
      serialized.type.should.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
    });
  });

  describe("RNG Determinism", () => {
    it("should initialize RNG from seed string", () => {
      const game = new Game("test-room", "test-seed");

      game.rng.should.be.a("function");
    });

    it("same seed should produce same random sequence", () => {
      const game1 = new Game("room1", "identical-seed");
      const game2 = new Game("room2", "identical-seed");

      const rng1Values = [];
      const rng2Values = [];

      for (let i = 0; i < 100; i++) {
        rng1Values.push(game1.rng());
        rng2Values.push(game2.rng());
      }

      rng1Values.should.deep.equal(rng2Values);
    });

    it("RNG should produce values between 0 and 1", () => {
      const game = new Game("test-room", "range-test");

      for (let i = 0; i < 100; i++) {
        const value = game.rng();
        value.should.be.at.least(0);
        value.should.be.below(1);
      }
    });
  });

  describe("Piece Queue Management", () => {
    let game, socket;

    beforeEach(() => {
      game = new Game("test-room");
      socket = { id: "socket-1", emit: sinon.spy() };
    });

    it("should get piece for player by index", () => {
      const player = new Player(socket, "Alice");
      game.addPlayer(player);

      game.generateNextPiece();
      game.generateNextPiece();
      game.generateNextPiece();

      const piece = game.getNextPieceForPlayer("Alice");
      piece.should.exist;
      piece.should.equal(game.pieceQueue[0]);
    });

    it("should handle player placed piece", () => {
      const player = new Player(socket, "Alice");
      game.addPlayer(player);

      // Generate some pieces
      game.generateNextPiece();
      game.generateNextPiece();
      game.generateNextPiece();

      player.pieceIndex.should.equal(0);

      // Player places piece
      const nextPiece = game.onPlayerPlacedPiece("Alice");

      player.pieceIndex.should.equal(1);
      nextPiece.should.exist;
    });

    it("should generate new piece when queue is exhausted", () => {
      const player = new Player(socket, "Alice");
      game.addPlayer(player);

      game.generateNextPiece(); // Index 0

      player.pieceIndex = 0;
      const initialQueueLength = game.pieceQueue.length;

      // Place piece, should trigger new generation
      game.onPlayerPlacedPiece("Alice");

      game.pieceQueue.length.should.be.greaterThan(initialQueueLength);
    });
  });

  describe("Game Reset", () => {
    let game, socket1, socket2;

    beforeEach(() => {
      game = new Game("test-room");
      socket1 = { id: "socket-1", emit: sinon.spy() };
      socket2 = { id: "socket-2", emit: sinon.spy() };
    });

    it("should reset game state", () => {
      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");

      game.addPlayer(player1);
      game.addPlayer(player2);

      // Simulate some game state
      player1.pieceIndex = 5;
      player1.isGameOver = true;
      player2.isPlaying = true;

      game.reset();

      game.started.should.be.true;
      game.pieceQueue.should.be.empty;
      player1.pieceIndex.should.equal(0);
      player1.isGameOver.should.be.false;
      player1.isPlaying.should.be.true;
      player2.pieceIndex.should.equal(0);
    });
  });

  describe("Helper Methods", () => {
    let game, socket1, socket2;

    beforeEach(() => {
      game = new Game("test-room");
      socket1 = { id: "socket-1", emit: sinon.spy() };
      socket2 = { id: "socket-2", emit: sinon.spy() };
    });

    it("should get host name", () => {
      const player = new Player(socket1, "Alice");
      game.addPlayer(player);

      game.getHostName().should.equal("Alice");
    });

    it("should return null when no host", () => {
      chai.expect(game.getHostName()).to.be.null;
    });

    it("should get all player names", () => {
      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");

      game.addPlayer(player1);
      game.addPlayer(player2);

      const names = game.getPlayerNames();
      names.should.deep.equal(["Alice", "Bob"]);
    });

    it("should get piece queue as serialized array", () => {
      game.generateNextPiece();
      game.generateNextPiece();

      const queue = game.getPieceQueue();
      queue.should.have.lengthOf(2);
      queue[0].should.have.property("type");
    });

    it("should get last piece", () => {
      game.generateNextPiece();
      const secondPiece = game.generateNextPiece();

      const last = game.getLastPiece();
      last.should.equal(secondPiece);
    });
  });
});

/**
 * ✅ TESTS POUR GÉNÉRATEUR DÉTERMINISTE
 *
 * Ces tests vérifient que votre implémentation respecte le sujet:
 *
 * 1. ✅ Générateur déterministe avec seed
 * 2. ✅ Système 7-bag
 * 3. ✅ Distribution équitable
 * 4. ✅ Même seed = même séquence
 *
 * ⚠️  PROBLÈME DANS VOTRE CODE UPLOADÉ :
 *
 * Vous avez DEUX fonctions generateNextPiece() :
 * - Ligne 26-45 : Version avec 7-bag (CORRECTE) ✅
 * - Ligne 118-122 : Version avec Math.random() (À SUPPRIMER) ❌
 *
 * La deuxième écrase la première !
 *
 * 🔧 SOLUTION : Dans src/server/models/Game.js
 *
 * 1. SUPPRIMEZ les lignes 7-10 (fonction getRandomType)
 *    ```javascript
 *    // ❌ SUPPRIMER CECI
 *    function getRandomType() {
 *      const index = Math.floor(Math.random() * TETROMINOS.length);
 *      return TETROMINOS[index];
 *    }
 *    ```
 *
 * 2. SUPPRIMEZ les lignes 118-122 (deuxième generateNextPiece)
 *    ```javascript
 *    // ❌ SUPPRIMER CECI
 *    Game.prototype.generateNextPiece = function () {
 *      const type = getRandomType();
 *      const piece = new Piece(type);
 *      this.pieceQueue.push(piece);
 *      return piece;
 *    };
 *    ```
 *
 * 3. METTEZ À JOUR reset() pour réinitialiser le bag
 *    ```javascript
 *    Game.prototype.reset = function () {
 *      this.started = true;
 *      this.pieceQueue = [];
 *      this.currentBag = []; // ✅ AJOUTER CETTE LIGNE
 *      this.players.forEach((p) => {
 *        p.pieceIndex = 0;
 *        p.isGameOver = false;
 *        p.isPlaying = true;
 *      });
 *    };
 *    ```
 *
 * Après ces corrections, tous les tests devraient passer !
 *
 * 📊 COUVERTURE ATTENDUE APRÈS CORRECTION :
 * - Game.js : 90%+
 * - Tous les tests : PASS ✅
 * - Total : 70%+ de couverture globale
 */
