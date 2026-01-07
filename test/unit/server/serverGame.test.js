import { expect } from "chai";
import Game from "../../../src/server/models/Game";

describe("Server - Game Model", () => {
  describe("Constructor", () => {
    it("should create a game with room name", () => {
      const game = new Game("test-room");
      expect(game.room).to.equal("test-room");
    });

    it("should initialize with empty players array", () => {
      const game = new Game("test-room");
      expect(game.players).to.be.an("array");
      expect(game.players).to.have.lengthOf(0);
    });

    it("should initialize with no host", () => {
      const game = new Game("test-room");
      expect(game.host).to.be.null;
    });

    it("should initialize piece queue", () => {
      const game = new Game("test-room");
      expect(game.pieceQueue).to.be.an("array");
    });

    it("should initialize with seed from room name", () => {
      const game = new Game("test-room");
      expect(game.seed).to.equal("test-room");
    });

    it("should accept custom seed", () => {
      const game = new Game("test-room", "custom-seed");
      expect(game.seed).to.equal("custom-seed");
    });
  });

  describe("Player Management", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room");
    });

    it("should add a player", () => {
      const player = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      game.addPlayer(player);

      expect(game.players).to.have.lengthOf(1);
      expect(game.players[0].name).to.equal("Alice");
    });

    it("should set first player as host", () => {
      const player = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      game.addPlayer(player);

      expect(game.host).to.equal(player);
      expect(game.host.name).to.equal("Alice");
    });

    it("should add multiple players", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      expect(game.players).to.have.lengthOf(2);
      expect(game.host.name).to.equal("Alice");
    });

    it("should remove a player", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      const result = game.removePlayer("Alice");

      expect(game.players).to.have.lengthOf(1);
      expect(game.players[0].name).to.equal("Bob");
      expect(result.wasHost).to.be.true;
    });

    it("should transfer host when host leaves", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      game.removePlayer("Alice");

      expect(game.host.name).to.equal("Bob");
    });

    it("should have no host when last player leaves", () => {
      const player = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      game.addPlayer(player);

      game.removePlayer("Alice");

      expect(game.host).to.be.null;
    });

    it("should not transfer host when non-host leaves", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      const result = game.removePlayer("Bob");

      expect(result.wasHost).to.be.false;
      expect(game.host.name).to.equal("Alice");
    });
  });

  describe("Piece Generation", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room");
    });

    it("should generate a piece", () => {
      const piece = game.generateNextPiece();

      expect(piece).to.have.property("type");
      expect(piece.type).to.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
    });

    it("should add piece to queue", () => {
      const initialLength = game.pieceQueue.length;
      game.generateNextPiece();

      expect(game.pieceQueue.length).to.equal(initialLength + 1);
    });

    it("should use 7-bag system", () => {
      const pieces = [];
      for (let i = 0; i < 7; i++) {
        pieces.push(game.generateNextPiece().type);
      }

      const uniquePieces = [...new Set(pieces)];
      expect(uniquePieces).to.have.lengthOf(7);
    });

    it("should refill bag after 7 pieces", () => {
      // Générer 7 pièces (vide le bag)
      for (let i = 0; i < 7; i++) {
        game.generateNextPiece();
      }

      expect(game.currentBag).to.have.lengthOf(0);

      // La 8ème pièce devrait créer un nouveau bag
      game.generateNextPiece();
      expect(game.currentBag).to.have.lengthOf(6); // 7 - 1
    });
  });

  describe("Deterministic Generation", () => {
    it("should produce same sequence with same seed", () => {
      const game1 = new Game("test", "seed123");
      const game2 = new Game("test", "seed123");

      const pieces1 = [];
      const pieces2 = [];

      for (let i = 0; i < 14; i++) {
        pieces1.push(game1.generateNextPiece().type);
        pieces2.push(game2.generateNextPiece().type);
      }

      expect(pieces1).to.deep.equal(pieces2);
    });

    it("should produce different sequences with different seeds", () => {
      const game1 = new Game("test", "seed123");
      const game2 = new Game("test", "seed456");

      const pieces1 = [];
      const pieces2 = [];

      for (let i = 0; i < 14; i++) {
        pieces1.push(game1.generateNextPiece().type);
        pieces2.push(game2.generateNextPiece().type);
      }

      expect(pieces1).to.not.deep.equal(pieces2);
    });
  });

  describe("RNG (Random Number Generator)", () => {
    it("should initialize RNG from seed", () => {
      const game = new Game("test-room");
      expect(game.rng).to.be.a("function");
    });

    it("should produce deterministic sequence", () => {
      const game1 = new Game("test", "seed123");
      const game2 = new Game("test", "seed123");

      const values1 = [];
      const values2 = [];

      for (let i = 0; i < 10; i++) {
        values1.push(game1.rng());
        values2.push(game2.rng());
      }

      expect(values1).to.deep.equal(values2);
    });

    it("should produce values between 0 and 1", () => {
      const game = new Game("test-room");

      for (let i = 0; i < 20; i++) {
        const value = game.rng();
        expect(value).to.be.at.least(0);
        expect(value).to.be.at.most(1);
      }
    });
  });

  describe("Helper Methods", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room");
    });

    it("should get host name", () => {
      const player = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      game.addPlayer(player);

      expect(game.getHostName()).to.equal("Alice");
    });

    it("should return null when no host", () => {
      expect(game.getHostName()).to.be.null;
    });

    it("should get all player names", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      const names = game.getPlayerNames();
      expect(names).to.deep.equal(["Alice", "Bob"]);
    });

    it("should get player count", () => {
      const player1 = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      const player2 = { name: "Bob", socketId: "socket2", pieceIndex: 0 };

      game.addPlayer(player1);
      game.addPlayer(player2);

      expect(game.players.length).to.equal(2);
    });

    it("should get piece queue as array", () => {
      game.generateNextPiece();
      game.generateNextPiece();

      const queue = game.getPieceQueue();
      expect(queue).to.be.an("array");
      expect(queue).to.have.lengthOf(2);
    });

    it("should get last piece", () => {
      game.generateNextPiece();
      const lastPiece = game.generateNextPiece();

      const retrieved = game.getLastPiece();
      expect(retrieved.type).to.equal(lastPiece.type);
    });
  });

  describe("Piece Queue Management", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room");
      const player = { name: "Alice", socketId: "socket1", pieceIndex: 0 };
      game.addPlayer(player);
    });

    it("should get next piece for player", () => {
      game.generateNextPiece();

      const piece = game.getNextPieceForPlayer("Alice");
      expect(piece).to.not.be.null;
      expect(piece.type).to.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
    });

    it("should handle player placed piece", () => {
      game.generateNextPiece();

      const initialIndex = game.players[0].pieceIndex;
      game.onPlayerPlacedPiece("Alice");

      expect(game.players[0].pieceIndex).to.equal(initialIndex + 1);
    });

    it("should maintain queue ahead of player", () => {
      const initialQueueLength = game.pieceQueue.length;

      game.onPlayerPlacedPiece("Alice");

      // La queue devrait avoir été remplie
      expect(game.pieceQueue.length).to.be.greaterThan(initialQueueLength);
    });

    it("should fill queue with MIN_QUEUE_SIZE pieces", () => {
      game.fillPieceQueue();

      expect(game.pieceQueue.length).to.be.at.least(10);
    });
  });

  describe("Game Reset", () => {
    let game;

    beforeEach(() => {
      game = new Game("test-room");
      const player = {
        name: "Alice",
        socketId: "socket1",
        pieceIndex: 5,
        isGameOver: true,
        isPlaying: false,
      };
      game.addPlayer(player);
    });

    it("should reset game state", () => {
      game.reset();

      expect(game.started).to.be.true;
      expect(game.players[0].pieceIndex).to.equal(0);
      expect(game.players[0].isGameOver).to.be.false;
      expect(game.players[0].isPlaying).to.be.true;
    });

    it("should prefill piece queue", () => {
      game.reset();

      expect(game.pieceQueue.length).to.be.at.least(10);
    });

    it("should reset pieceQueue", () => {
      game.generateNextPiece();
      game.generateNextPiece();

      expect(game.pieceQueue.length).to.be.greaterThan(0);

      game.reset();

      // Après reset, la queue est remplie avec MIN_QUEUE_SIZE pièces
      expect(game.pieceQueue.length).to.be.at.least(10);
    });
  });
});
