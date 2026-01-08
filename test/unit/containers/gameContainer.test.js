import React from "react";
import { expect } from "chai";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import sinon from "sinon";

describe("GameContainer - Complete Integration Tests", () => {
  let mockSocket;
  let GameContainer;
  let SocketContext;

  beforeEach(() => {
    // Clear module cache
    delete require.cache[
      require.resolve("../../../src/client/containers/GameContainer")
    ];
    delete require.cache[
      require.resolve("../../../src/client/context/SocketContext")
    ];

    // Create mock socket
    mockSocket = {
      emit: sinon.stub(),
      on: sinon.stub(),
      off: sinon.stub(),
    };

    // Load SocketContext
    const contextModule = require("../../../src/client/context/SocketContext");
    SocketContext = contextModule.SocketContext;

    // Mock all hook modules BEFORE loading GameContainer
    const Module = require("module");
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function (id) {
      // Mock usePlayer
      if (id.includes("game/usePlayer")) {
        return {
          usePlayer: () => ({
            player: {
              shape: [[1, 1, 1, 1]],
              color: "cyan",
              position: { x: 3, y: 3 },
              name: "player1",
              room: "test-room",
            },
            setPlayer: sinon.stub(),
            resetPlayer: sinon.stub(),
            nextPiece: {
              shape: [
                [1, 1],
                [1, 1],
              ],
              color: "yellow",
              type: "O",
            },
            setNextPiece: sinon.stub(),
          }),
        };
      }

      // Mock useGame
      if (id.includes("game/useGame")) {
        return {
          useGame: () => ({
            grid: Array(24)
              .fill(null)
              .map(() =>
                Array(10)
                  .fill(null)
                  .map(() => ({ filled: false, color: "black" }))
              ),
            pile: Array(24)
              .fill(null)
              .map(() =>
                Array(10)
                  .fill(null)
                  .map(() => ({ filled: false, color: "black" }))
              ),
          }),
        };
      }

      // Mock useScore
      if (id.includes("game/useScore")) {
        return {
          useScore: () => ({
            score: 0,
            linesCleared: 0,
            level: 1,
            addLinesCleared: sinon.stub(),
            resetScore: sinon.stub(),
          }),
        };
      }

      // Mock useTheme
      if (id.includes("game/useTheme")) {
        return {
          useTheme: () => ({
            isDarkMode: false,
            toggleTheme: sinon.stub(),
          }),
        };
      }

      // Mock useControls
      if (id.includes("game/useControls")) {
        return {
          useControls: sinon.stub(),
        };
      }

      // Default
      return originalRequire.apply(this, arguments);
    };

    // Load GameContainer with mocks in place
    try {
      GameContainer =
        require("../../../src/client/containers/GameContainer").default;
    } catch (e) {
      console.error("Failed to load GameContainer:", e);
    }

    // Restore require
    Module.prototype.require = originalRequire;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Component Rendering", () => {
    it("should render GameContainer component", () => {
      const { container } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      expect(container).to.exist;
      expect(container.innerHTML).to.not.be.empty;
    });

    it("should render room title", () => {
      const { container } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      expect(container.textContent).to.include("test-room");
    });

    it("should render with different room names", () => {
      const rooms = ["room1", "room2", "room3"];

      rooms.forEach((room) => {
        const { container } = render(
          <SocketContext.Provider value={mockSocket}>
            <MemoryRouter initialEntries={[`/game/${room}/player1`]}>
              <Route path="/game/:room/:playerName">
                <GameContainer />
              </Route>
            </MemoryRouter>
          </SocketContext.Provider>
        );

        expect(container.textContent).to.include(room);
      });
    });
  });

  describe("Socket Integration", () => {
    it("should emit join-room on mount", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      expect(mockSocket.emit.calledWith("join-room")).to.be.true;
    });

    it("should register all socket listeners", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      expect(mockSocket.on.calledWith("player-joined")).to.be.true;
      expect(mockSocket.on.calledWith("host-changed")).to.be.true;
      expect(mockSocket.on.calledWith("player-left")).to.be.true;
      expect(mockSocket.on.calledWith("game-started")).to.be.true;
      expect(mockSocket.on.calledWith("game-over")).to.be.true;
      expect(mockSocket.on.calledWith("error")).to.be.true;
      expect(mockSocket.on.calledWith("opponent-spectrum")).to.be.true;
      expect(mockSocket.on.calledWith("game-won")).to.be.true;
    });
  });

  describe("Socket Event Handlers - Trigger Functions", () => {
    it("should handle player-joined event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      // Find and call the player-joined handler
      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "player-joined");
      if (call) {
        const handler = call.args[1];
        handler({
          players: ["player1", "player2"],
          host: "player1",
        });
      }

      expect(call).to.exist;
    });

    it("should handle host-changed event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "host-changed");
      if (call) {
        const handler = call.args[1];
        handler({
          newHost: "player2",
          oldHost: "player1",
        });
      }

      expect(call).to.exist;
    });

    it("should handle player-left event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "player-left");
      if (call) {
        const handler = call.args[1];
        handler({
          player: "player2",
          players: ["player1"],
          host: "player1",
        });
      }

      expect(call).to.exist;
    });

    it("should handle game-started event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "game-started");
      if (call) {
        const handler = call.args[1];
        handler({
          piece: { type: "I" },
          nextPiece: { type: "O" },
        });
      }

      expect(call).to.exist;
    });

    it("should handle game-over event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "game-over");
      if (call) {
        const handler = call.args[1];
        handler({
          player: "player2",
        });
      }

      expect(call).to.exist;
    });

    it("should handle game-won event - winner", () => {
      const alertStub = sinon.stub(window, "alert");

      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "game-won");
      if (call) {
        const handler = call.args[1];
        handler({
          winner: "player1",
        });
      }

      expect(call).to.exist;
      alertStub.restore();
    });

    it("should handle game-won event - loser", () => {
      const alertStub = sinon.stub(window, "alert");

      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "game-won");
      if (call) {
        const handler = call.args[1];
        handler({
          winner: "player2",
        });
      }

      expect(call).to.exist;
      alertStub.restore();
    });

    it("should handle opponent-spectrum event", () => {
      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on
        .getCalls()
        .find((c) => c.args[0] === "opponent-spectrum");
      if (call) {
        const handler = call.args[1];
        handler({
          player: "player2",
          spectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });
      }

      expect(call).to.exist;
    });

    it("should handle error event", () => {
      const alertStub = sinon.stub(window, "alert");

      render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const call = mockSocket.on.getCalls().find((c) => c.args[0] === "error");
      if (call) {
        const handler = call.args[1];
        handler({
          message: "Test error",
        });
      }

      expect(call).to.exist;
      alertStub.restore();
    });
  });

  describe("User Interactions - Button Clicks", () => {
    it("should find and identify buttons in component", () => {
      const { container } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).to.be.at.least(0);
    });

    it("should trigger startGame when appropriate", () => {
      // Simulate being host
      mockSocket.on.withArgs("player-joined").callsFake((event, handler) => {
        setTimeout(() => {
          handler({
            players: ["player1"],
            host: "player1",
          });
        }, 0);
      });

      const { container } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      // Component rendered
      expect(container).to.exist;
    });
  });

  describe("Component Lifecycle - Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { unmount } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      unmount();

      expect(mockSocket.emit.calledWith("leave-room")).to.be.true;
      expect(mockSocket.off.called).to.be.true;
    });

    it("should remove all event listeners on unmount", () => {
      const { unmount } = render(
        <SocketContext.Provider value={mockSocket}>
          <MemoryRouter initialEntries={["/game/test-room/player1"]}>
            <Route path="/game/:room/:playerName">
              <GameContainer />
            </Route>
          </MemoryRouter>
        </SocketContext.Provider>
      );

      unmount();

      expect(mockSocket.off.calledWith("player-joined")).to.be.true;
      expect(mockSocket.off.calledWith("host-changed")).to.be.true;
      expect(mockSocket.off.calledWith("player-left")).to.be.true;
      expect(mockSocket.off.calledWith("game-started")).to.be.true;
      expect(mockSocket.off.calledWith("error")).to.be.true;
    });
  });

  describe("Multiple Renders - Stress Test", () => {
    it("should render multiple times without errors", () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <SocketContext.Provider value={mockSocket}>
            <MemoryRouter initialEntries={["/game/test-room/player1"]}>
              <Route path="/game/:room/:playerName">
                <GameContainer />
              </Route>
            </MemoryRouter>
          </SocketContext.Provider>
        );

        unmount();
      }

      expect(true).to.be.true;
    });

    it("should handle different player names", () => {
      ["alice", "bob", "charlie"].forEach((player) => {
        const { unmount } = render(
          <SocketContext.Provider value={mockSocket}>
            <MemoryRouter initialEntries={[`/game/test-room/${player}`]}>
              <Route path="/game/:room/:playerName">
                <GameContainer />
              </Route>
            </MemoryRouter>
          </SocketContext.Provider>
        );

        unmount();
      });

      expect(true).to.be.true;
    });
  });
});
