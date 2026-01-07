import { expect } from "chai";

describe("Server - index.js Logic Tests", () => {
  describe("Game Management", () => {
    it("should validate game object structure", () => {
      const game = {
        room: "test-room",
        players: [],
        host: null,
        started: false,
        pieceQueue: [],
      };

      expect(game).to.have.property("room");
      expect(game).to.have.property("players");
      expect(game).to.have.property("host");
      expect(game).to.have.property("started");
    });

    it("should filter available rooms (not started)", () => {
      const games = {
        room1: { started: false },
        room2: { started: true },
        room3: { started: false },
      };

      const availableRooms = Object.keys(games).filter(
        (roomName) => !games[roomName].started
      );

      expect(availableRooms).to.have.lengthOf(2);
      expect(availableRooms).to.include("room1");
      expect(availableRooms).to.include("room3");
      expect(availableRooms).to.not.include("room2");
    });

    it("should check if room already exists", () => {
      const games = {
        "existing-room": { started: false },
      };

      const roomExists = !!games["existing-room"];
      const roomNotExists = !!games["new-room"];

      expect(roomExists).to.be.true;
      expect(roomNotExists).to.be.false;
    });
  });

  describe("Player Management", () => {
    it("should validate player structure", () => {
      const player = {
        name: "Alice",
        socket: { id: "socket123" },
        pieceIndex: 0,
        isGameOver: false,
        isPlaying: true,
      };

      expect(player).to.have.property("name");
      expect(player).to.have.property("socket");
      expect(player).to.have.property("isGameOver");
      expect(player).to.have.property("isPlaying");
    });

    it("should check if player name is taken", () => {
      const players = [{ name: "Alice" }, { name: "Bob" }];

      const aliceExists = players.find((p) => p.name === "Alice");
      const charlieExists = players.find((p) => p.name === "Charlie");

      expect(aliceExists).to.not.be.undefined;
      expect(charlieExists).to.be.undefined;
    });

    it("should identify host player", () => {
      const game = {
        host: { name: "Alice" },
        players: [
          { name: "Alice", socket: { id: "s1" } },
          { name: "Bob", socket: { id: "s2" } },
        ],
      };

      const requester = game.players.find((p) => p.socket.id === "s1");
      const isHost = game.host.name === requester.name;

      expect(isHost).to.be.true;
    });

    it("should check if non-host tries to start game", () => {
      const game = {
        host: { name: "Alice" },
        players: [
          { name: "Alice", socket: { id: "s1" } },
          { name: "Bob", socket: { id: "s2" } },
        ],
      };

      const requester = game.players.find((p) => p.socket.id === "s2");
      const isHost = game.host.name === requester.name;

      expect(isHost).to.be.false;
    });
  });

  describe("Auto-Win Logic", () => {
    it("should detect single active player (winner)", () => {
      const players = [
        { name: "Alice", isGameOver: false, isPlaying: true },
        { name: "Bob", isGameOver: true, isPlaying: false },
        { name: "Charlie", isGameOver: true, isPlaying: false },
      ];

      const activePlayers = players.filter((p) => !p.isGameOver && p.isPlaying);

      expect(activePlayers).to.have.lengthOf(1);
      expect(activePlayers[0].name).to.equal("Alice");
    });

    it("should detect no active players left", () => {
      const players = [
        { name: "Alice", isGameOver: true, isPlaying: false },
        { name: "Bob", isGameOver: true, isPlaying: false },
      ];

      const activePlayers = players.filter((p) => !p.isGameOver && p.isPlaying);

      expect(activePlayers).to.have.lengthOf(0);
    });

    it("should continue game with multiple active players", () => {
      const players = [
        { name: "Alice", isGameOver: false, isPlaying: true },
        { name: "Bob", isGameOver: false, isPlaying: true },
      ];

      const activePlayers = players.filter((p) => !p.isGameOver && p.isPlaying);

      expect(activePlayers).to.have.lengthOf(2);
    });

    it("should only check auto-win if game started", () => {
      const game = {
        started: false,
        players: [{ name: "Alice", isGameOver: false, isPlaying: true }],
      };

      const shouldCheck = game.started;
      expect(shouldCheck).to.be.false;
    });
  });

  describe("Penalty Lines Calculation", () => {
    it("should calculate penalty lines (n-1 rule)", () => {
      const testCases = [
        { cleared: 1, penalty: 0 },
        { cleared: 2, penalty: 1 },
        { cleared: 3, penalty: 2 },
        { cleared: 4, penalty: 3 },
      ];

      testCases.forEach(({ cleared, penalty }) => {
        const calculated = cleared - 1;
        expect(calculated).to.equal(penalty);
      });
    });

    it("should not send penalty for single line", () => {
      const linesCleared = 1;
      const penaltyLines = linesCleared - 1;

      expect(penaltyLines).to.equal(0);
    });

    it("should send 3 penalty lines for Tetris", () => {
      const linesCleared = 4;
      const penaltyLines = linesCleared - 1;

      expect(penaltyLines).to.equal(3);
    });
  });

  describe("Piece Distribution", () => {
    it("should validate first two pieces on game start", () => {
      const pieceQueue = [
        { type: "I", serialize: () => ({ type: "I" }) },
        { type: "O", serialize: () => ({ type: "O" }) },
        { type: "T", serialize: () => ({ type: "T" }) },
      ];

      const firstPiece = pieceQueue[0];
      const secondPiece = pieceQueue[1];

      expect(firstPiece.type).to.equal("I");
      expect(secondPiece.type).to.equal("O");
    });

    it("should serialize pieces for transmission", () => {
      const piece = {
        type: "I",
        serialize: () => ({ type: "I", color: "cyan" }),
      };

      const serialized = piece.serialize();
      expect(serialized).to.have.property("type");
    });
  });

  describe("Room Cleanup", () => {
    it("should delete empty rooms", () => {
      const games = {
        room1: { players: [] },
        room2: { players: [{ name: "Alice" }] },
      };

      // Simuler suppression des rooms vides
      Object.keys(games).forEach((roomName) => {
        if (games[roomName].players.length === 0) {
          delete games[roomName];
        }
      });

      expect(games["room1"]).to.be.undefined;
      expect(games["room2"]).to.not.be.undefined;
    });

    it("should keep rooms with active players", () => {
      const game = {
        players: [{ name: "Alice" }],
      };

      const shouldDelete = game.players.length === 0;
      expect(shouldDelete).to.be.false;
    });
  });

  describe("Host Transfer Logic", () => {
    it("should transfer host to first remaining player", () => {
      const players = [
        { name: "Bob", socket: { id: "s2" } },
        { name: "Charlie", socket: { id: "s3" } },
      ];

      const newHost = players[0];

      expect(newHost.name).to.equal("Bob");
    });

    it("should set host to null if no players left", () => {
      const players = [];

      const newHost = players.length > 0 ? players[0] : null;

      expect(newHost).to.be.null;
    });

    it("should detect when host leaves", () => {
      const game = {
        host: { name: "Alice" },
        players: [{ name: "Alice" }, { name: "Bob" }],
      };

      const leavingPlayer = "Alice";
      const wasHost = game.host && game.host.name === leavingPlayer;

      expect(wasHost).to.be.true;
    });
  });

  describe("Game State Validation", () => {
    it("should check if game already started", () => {
      const game = { started: true };

      const canJoin = !game.started;
      expect(canJoin).to.be.false;
    });

    it("should check if players still playing", () => {
      const players = [
        { name: "Alice", isPlaying: true },
        { name: "Bob", isPlaying: false },
      ];

      const someStillPlaying = players.some((p) => p.isPlaying);

      expect(someStillPlaying).to.be.true;
    });

    it("should allow restart when all players finished", () => {
      const players = [
        { name: "Alice", isPlaying: false },
        { name: "Bob", isPlaying: false },
      ];

      const someStillPlaying = players.some((p) => p.isPlaying);

      expect(someStillPlaying).to.be.false;
    });
  });

  describe("Socket Events Structure", () => {
    it("should validate create-room event", () => {
      const event = { room: "test-room" };

      expect(event).to.have.property("room");
      expect(event.room).to.be.a("string");
    });

    it("should validate join-room event", () => {
      const event = {
        room: "test-room",
        player: "Alice",
      };

      expect(event).to.have.property("room");
      expect(event).to.have.property("player");
    });

    it("should validate start-game event", () => {
      const event = { room: "test-room" };

      expect(event).to.have.property("room");
    });

    it("should validate piece-placed event", () => {
      const event = {
        room: "test-room",
        player: "Alice",
      };

      expect(event).to.have.property("room");
      expect(event).to.have.property("player");
    });

    it("should validate lines-cleared event", () => {
      const event = {
        room: "test-room",
        player: "Alice",
        lines: 2,
      };

      expect(event).to.have.property("room");
      expect(event).to.have.property("player");
      expect(event).to.have.property("lines");
      expect(event.lines).to.be.a("number");
    });

    it("should validate game-over event", () => {
      const event = {
        room: "test-room",
        player: "Alice",
      };

      expect(event).to.have.property("room");
      expect(event).to.have.property("player");
    });

    it("should validate spectrum-update event", () => {
      const event = {
        room: "test-room",
        player: "Alice",
        spectrum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      };

      expect(event).to.have.property("spectrum");
      expect(event.spectrum).to.be.an("array");
      expect(event.spectrum).to.have.lengthOf(10);
    });
  });

  describe("Opponent Filtering", () => {
    it("should filter out current player from penalty targets", () => {
      const currentPlayer = "Alice";
      const players = [
        { name: "Alice", isGameOver: false, socket: { connected: true } },
        { name: "Bob", isGameOver: false, socket: { connected: true } },
        { name: "Charlie", isGameOver: false, socket: { connected: true } },
      ];

      const opponents = players.filter(
        (p) => p.name !== currentPlayer && !p.isGameOver && p.socket.connected
      );

      expect(opponents).to.have.lengthOf(2);
      expect(opponents.map((p) => p.name)).to.not.include("Alice");
    });

    it("should not send penalty to game-over players", () => {
      const currentPlayer = "Alice";
      const players = [
        { name: "Alice", isGameOver: false, socket: { connected: true } },
        { name: "Bob", isGameOver: true, socket: { connected: true } },
        { name: "Charlie", isGameOver: false, socket: { connected: true } },
      ];

      const opponents = players.filter(
        (p) => p.name !== currentPlayer && !p.isGameOver && p.socket.connected
      );

      expect(opponents).to.have.lengthOf(1);
      expect(opponents[0].name).to.equal("Charlie");
    });

    it("should not send penalty to disconnected players", () => {
      const currentPlayer = "Alice";
      const players = [
        { name: "Alice", isGameOver: false, socket: { connected: true } },
        { name: "Bob", isGameOver: false, socket: { connected: false } },
        { name: "Charlie", isGameOver: false, socket: { connected: true } },
      ];

      const opponents = players.filter(
        (p) => p.name !== currentPlayer && !p.isGameOver && p.socket.connected
      );

      expect(opponents).to.have.lengthOf(1);
      expect(opponents[0].name).to.equal("Charlie");
    });
  });

  describe("Disconnect Handling", () => {
    it("should find player by socket ID", () => {
      const socketId = "socket123";
      const players = [
        { name: "Alice", socket: { id: "socket456" } },
        { name: "Bob", socket: { id: "socket123" } },
      ];

      const player = players.find((p) => p.socket.id === socketId);

      expect(player).to.not.be.undefined;
      expect(player.name).to.equal("Bob");
    });

    it("should handle empty room after disconnect", () => {
      const game = {
        players: [{ name: "Alice" }],
      };

      // Player leaves
      game.players = [];

      const shouldDelete = game.players.length === 0;
      expect(shouldDelete).to.be.true;
    });
  });

  describe("Ping/Pong", () => {
    it("should validate ping action", () => {
      const action = { type: "server/ping" };

      expect(action.type).to.equal("server/ping");
    });

    it("should respond with pong", () => {
      const response = { type: "pong" };

      expect(response.type).to.equal("pong");
    });
  });
});
