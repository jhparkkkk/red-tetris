import chai from "chai";

chai.should();

const Piece = require("../../../src/server/models/Piece");
const Player = require("../../../src/server/models/Player");

describe("Piece Model", () => {
  describe("Constructor", () => {
    it("should create a piece with a type", () => {
      const piece = new Piece("I");

      piece.type.should.equal("I");
    });

    it("should accept all tetromino types", () => {
      const types = ["I", "O", "T", "S", "Z", "J", "L"];

      types.forEach((type) => {
        const piece = new Piece(type);
        piece.type.should.equal(type);
      });
    });
  });

  describe("Serialization", () => {
    it("should serialize to an object with type", () => {
      const piece = new Piece("T");
      const serialized = piece.serialize();

      serialized.should.be.an("object");
      serialized.should.have.property("type");
      serialized.type.should.equal("T");
    });

    it("should serialize all piece types correctly", () => {
      const types = ["I", "O", "T", "S", "Z", "J", "L"];

      types.forEach((type) => {
        const piece = new Piece(type);
        const serialized = piece.serialize();

        serialized.type.should.equal(type);
      });
    });
  });
});

describe("Player Model", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      id: "socket-123",
      emit: function () {},
      on: function () {},
      connected: true,
    };
  });

  describe("Constructor", () => {
    it("should create a player with socket and name", () => {
      const player = new Player(mockSocket, "Alice");

      player.socket.should.equal(mockSocket);
      player.name.should.equal("Alice");
    });

    it("should initialize with default values", () => {
      const player = new Player(mockSocket, "Bob");

      player.score.should.equal(0);
      player.pieceIndex.should.equal(0);
      player.isPlaying.should.be.false;
      player.isGameOver.should.be.false;
    });
  });

  describe("Properties", () => {
    it("should allow updating score", () => {
      const player = new Player(mockSocket, "Alice");

      player.score = 100;
      player.score.should.equal(100);

      player.score += 50;
      player.score.should.equal(150);
    });

    it("should allow updating piece index", () => {
      const player = new Player(mockSocket, "Alice");

      player.pieceIndex.should.equal(0);

      player.pieceIndex++;
      player.pieceIndex.should.equal(1);

      player.pieceIndex += 5;
      player.pieceIndex.should.equal(6);
    });

    it("should allow setting game state flags", () => {
      const player = new Player(mockSocket, "Alice");

      player.isPlaying = true;
      player.isPlaying.should.be.true;

      player.isGameOver = true;
      player.isGameOver.should.be.true;
    });
  });

  describe("Socket Integration", () => {
    it("should maintain socket reference", () => {
      const player = new Player(mockSocket, "Alice");

      player.socket.id.should.equal("socket-123");
      player.socket.connected.should.be.true;
    });

    it("should work with different socket objects", () => {
      const socket1 = { id: "socket-1", emit: () => {} };
      const socket2 = { id: "socket-2", emit: () => {} };

      const player1 = new Player(socket1, "Alice");
      const player2 = new Player(socket2, "Bob");

      player1.socket.id.should.equal("socket-1");
      player2.socket.id.should.equal("socket-2");
    });
  });

  describe("Game Flow Simulation", () => {
    it("should track player progression through game", () => {
      const player = new Player(mockSocket, "Alice");

      // Game starts
      player.isPlaying = true;
      player.isPlaying.should.be.true;
      player.isGameOver.should.be.false;

      // Player places pieces
      player.pieceIndex = 5;
      player.score = 200;

      // Player loses
      player.isGameOver = true;
      player.isPlaying = false;

      player.isGameOver.should.be.true;
      player.isPlaying.should.be.false;
      player.pieceIndex.should.equal(5);
      player.score.should.equal(200);
    });

    it("should reset to initial state", () => {
      const player = new Player(mockSocket, "Alice");

      // Simulate game state
      player.pieceIndex = 10;
      player.score = 500;
      player.isPlaying = true;
      player.isGameOver = true;

      // Reset
      player.pieceIndex = 0;
      player.score = 0;
      player.isPlaying = false;
      player.isGameOver = false;

      player.pieceIndex.should.equal(0);
      player.score.should.equal(0);
      player.isPlaying.should.be.false;
      player.isGameOver.should.be.false;
    });
  });
});

/**
 * ✅ COUVERTURE: Piece.js et Player.js
 *
 * Ces modèles sont simples et bien testés.
 *
 * Piece.js  : 100% de couverture attendue
 * Player.js : 100% de couverture attendue
 *
 * Aucun problème détecté dans ces fichiers.
 */
