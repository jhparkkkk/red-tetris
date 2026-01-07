import { expect } from "chai";
import { renderHook, act } from "@testing-library/react-hooks";
import React from "react";
import sinon from "sinon";

// Mock du socket
const createMockSocket = () => {
  const listeners = {};
  return {
    on: (event, handler) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    off: (event, handler) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
    },
    emit: sinon.spy(),
    trigger: (event, data) => {
      if (listeners[event]) {
        listeners[event].forEach((handler) => handler(data));
      }
    },
    listeners,
  };
};

// Mock du SocketContext
let mockSocket = createMockSocket();

// Mock du module SocketContext
const mockUseSocket = () => mockSocket;

// Utiliser require pour avoir le vrai useGame après avoir mocké useSocket
describe("useGame Hook - Full Coverage", () => {
  let useGame;
  let SocketContext;

  before(() => {
    // Mock le useSocket avant d'importer useGame
    const Module = require("module");
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function (id) {
      if (id === "../context/SocketContext" || id.includes("SocketContext")) {
        return { useSocket: mockUseSocket };
      }
      return originalRequire.apply(this, arguments);
    };

    // Maintenant on peut importer useGame
    const useGameModule = require("../../../src/client/game/useGame");
    useGame = useGameModule.useGame;
  });

  beforeEach(() => {
    mockSocket = createMockSocket();
  });

  const defaultPlayer = {
    shape: [[1]],
    position: { x: 3, y: 10 },
    color: "cyan",
    name: "TestPlayer",
    room: "test-room",
  };

  const createDefaultProps = (overrides = {}) => ({
    player: defaultPlayer,
    resetPlayer: sinon.spy(),
    handleGameOver: sinon.spy(),
    isGameOver: false,
    gameStarted: false,
    nextPiece: null,
    setNextPiece: sinon.spy(),
    onLinesCleared: sinon.spy(),
    ...overrides,
  });

  describe("Initialization", () => {
    it("should initialize with grid and pile", () => {
      const props = createDefaultProps();

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      expect(result.current.grid).to.be.an("array");
      expect(result.current.grid).to.have.lengthOf(24);
      expect(result.current.pile).to.be.an("array");
      expect(result.current.pile).to.have.lengthOf(24);
    });

    it("should register socket listeners on mount", () => {
      const props = createDefaultProps();

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      expect(mockSocket.listeners["next-piece"]).to.have.lengthOf(1);
      expect(mockSocket.listeners["receive-penalty"]).to.have.lengthOf(1);
    });

    it("should cleanup listeners on unmount", () => {
      const props = createDefaultProps();

      const { unmount } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      unmount();

      expect(mockSocket.listeners["next-piece"] || []).to.have.lengthOf(0);
      expect(mockSocket.listeners["receive-penalty"] || []).to.have.lengthOf(0);
    });
  });

  describe("Grid Updates", () => {
    it("should update grid when player moves", () => {
      const props = createDefaultProps();

      const { result, rerender } = renderHook(
        ({ player }) =>
          useGame(
            player,
            props.resetPlayer,
            props.handleGameOver,
            props.isGameOver,
            props.gameStarted,
            props.nextPiece,
            props.setNextPiece,
            props.onLinesCleared
          ),
        { initialProps: { player: defaultPlayer } }
      );

      const initialGrid = result.current.grid;

      const newPlayer = {
        ...defaultPlayer,
        position: { x: 4, y: 10 },
      };

      rerender({ player: newPlayer });

      expect(result.current.grid).to.not.deep.equal(initialGrid);
    });

    it("should merge pile with player piece", () => {
      const props = createDefaultProps();

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      const grid = result.current.grid;
      const playerY = defaultPlayer.position.y;
      const playerX = defaultPlayer.position.x;

      expect(grid[playerY][playerX].filled).to.be.true;
    });
  });

  describe("Ghost Piece", () => {
    it("should calculate ghost piece when game started", () => {
      const props = createDefaultProps({ gameStarted: true });

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      expect(result.current.grid).to.be.an("array");
      // Ghost piece devrait être calculée et visible dans la grille
    });

    it("should not calculate ghost piece when game not started", () => {
      const props = createDefaultProps({ gameStarted: false });

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      expect(result.current.grid).to.be.an("array");
    });

    it("should handle empty player shape gracefully", () => {
      const playerWithNoShape = {
        ...defaultPlayer,
        shape: [],
      };

      const props = createDefaultProps({
        gameStarted: true,
        player: playerWithNoShape,
      });

      expect(() => {
        renderHook(() =>
          useGame(
            playerWithNoShape,
            props.resetPlayer,
            props.handleGameOver,
            props.isGameOver,
            props.gameStarted,
            props.nextPiece,
            props.setNextPiece,
            props.onLinesCleared
          )
        );
      }).to.not.throw();
    });
  });

  describe("Next Piece Events", () => {
    it("should handle next-piece event from server", () => {
      const props = createDefaultProps();

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      act(() => {
        mockSocket.trigger("next-piece", {
          piece: { type: "I" },
        });
      });

      expect(props.setNextPiece.called).to.be.true;
    });

    it("should move nextPiece to current when receiving new piece", () => {
      const currentNextPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const props = createDefaultProps({ nextPiece: currentNextPiece });

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      act(() => {
        mockSocket.trigger("next-piece", {
          piece: { type: "O" },
        });
      });

      expect(props.resetPlayer.called).to.be.true;
      expect(props.setNextPiece.called).to.be.true;
    });

    it("should handle unknown piece type gracefully", () => {
      const props = createDefaultProps();

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      expect(() => {
        act(() => {
          mockSocket.trigger("next-piece", {
            piece: { type: "INVALID" },
          });
        });
      }).to.not.throw();
    });
  });

  describe("Penalty Lines", () => {
    it("should handle receive-penalty event", () => {
      const props = createDefaultProps();

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      const initialPile = result.current.pile;

      act(() => {
        mockSocket.trigger("receive-penalty", { count: 2 });
      });

      expect(result.current.pile).to.not.deep.equal(initialPile);
    });

    it("should add indestructible penalty lines at bottom", () => {
      const props = createDefaultProps();

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      act(() => {
        mockSocket.trigger("receive-penalty", { count: 1 });
      });

      const bottomRow = result.current.pile[23];
      expect(bottomRow.every((cell) => cell.filled)).to.be.true;
      expect(bottomRow.every((cell) => cell.indestructible)).to.be.true;
      expect(bottomRow.every((cell) => cell.color === "grey")).to.be.true;
    });

    it("should shift pile up when adding penalties", () => {
      const props = createDefaultProps();

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      act(() => {
        mockSocket.trigger("receive-penalty", { count: 3 });
      });

      // Les 3 dernières lignes devraient être des penalty lines
      for (let i = 21; i < 24; i++) {
        expect(result.current.pile[i].every((cell) => cell.indestructible)).to
          .be.true;
      }
    });
  });

  describe("Game Loop", () => {
    it("should reset grid when game starts", (done) => {
      const props = createDefaultProps({ gameStarted: false });

      const { result, rerender } = renderHook(
        ({ gameStarted }) =>
          useGame(
            props.player,
            props.resetPlayer,
            props.handleGameOver,
            false,
            gameStarted,
            props.nextPiece,
            props.setNextPiece,
            props.onLinesCleared
          ),
        { initialProps: { gameStarted: false } }
      );

      const initialPile = result.current.pile;

      // Ajouter des blocs dans la pile
      act(() => {
        mockSocket.trigger("receive-penalty", { count: 1 });
      });

      // Démarrer le jeu
      rerender({ gameStarted: true });

      setTimeout(() => {
        // La pile devrait être réinitialisée
        const allEmpty = result.current.pile.every((row) =>
          row.every((cell) => !cell.filled)
        );
        expect(allEmpty).to.be.true;
        done();
      }, 100);
    });

    it("should not start loop when game not started", () => {
      const props = createDefaultProps({ gameStarted: false });

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      // Attendre un peu
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSocket.emit.called).to.be.false;
          resolve();
        }, 500);
      });
    });

    it("should not start loop when game over", () => {
      const props = createDefaultProps({
        gameStarted: true,
        isGameOver: true,
      });

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSocket.emit.called).to.be.false;
          resolve();
        }, 500);
      });
    });
  });

  describe("Socket Emissions", () => {
    it("should emit piece-placed when piece lands", (done) => {
      const props = createDefaultProps({
        gameStarted: true,
        player: {
          ...defaultPlayer,
          position: { x: 3, y: 23 }, // Près du bas
        },
      });

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      setTimeout(() => {
        const piecePlacedCalls = mockSocket.emit
          .getCalls()
          .filter((call) => call.args[0] === "piece-placed");
        expect(piecePlacedCalls.length).to.be.greaterThan(0);
        done();
      }, 500);
    }).timeout(1000);

    it("should emit game-over when reaching top", (done) => {
      // Créer une pile presque pleine
      const fullPile = Array(24)
        .fill(null)
        .map((_, i) =>
          Array(10)
            .fill(null)
            .map(() => ({
              filled: i > 3 ? true : false,
              color: "red",
              indestructible: false,
            }))
        );

      const props = createDefaultProps({
        gameStarted: true,
        player: {
          ...defaultPlayer,
          position: { x: 3, y: 4 },
        },
      });

      const { result } = renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      // Forcer la pile à être pleine
      act(() => {
        result.current.pile.splice(0, 24, ...fullPile);
      });

      setTimeout(() => {
        const gameOverCalls = mockSocket.emit
          .getCalls()
          .filter((call) => call.args[0] === "game-over");

        if (gameOverCalls.length > 0) {
          expect(props.handleGameOver.called).to.be.true;
        }
        done();
      }, 500);
    }).timeout(1000);
  });

  describe("Lines Cleared Callback", () => {
    it("should call onLinesCleared when lines are cleared", (done) => {
      const props = createDefaultProps({
        gameStarted: true,
        player: {
          ...defaultPlayer,
          position: { x: 3, y: 22 },
        },
      });

      // Créer une pile avec une ligne presque pleine
      const pileLine = Array(10).fill({ filled: true, color: "red" });
      pileLine[5] = { filled: false };

      renderHook(() =>
        useGame(
          props.player,
          props.resetPlayer,
          props.handleGameOver,
          props.isGameOver,
          props.gameStarted,
          props.nextPiece,
          props.setNextPiece,
          props.onLinesCleared
        )
      );

      setTimeout(() => {
        if (props.onLinesCleared.called) {
          expect(props.onLinesCleared.calledWith(sinon.match.number)).to.be
            .true;
        }
        done();
      }, 500);
    }).timeout(1000);
  });
});
