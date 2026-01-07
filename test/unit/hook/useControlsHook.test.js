import { expect } from "chai";
import { renderHook, act } from "@testing-library/react-hooks";
import sinon from "sinon";
import { useControls } from "../../../src/client/game/useControls";

describe("useControls Hook - Full Coverage", () => {
  let setPlayerSpy;

  const createEmptyPile = () =>
    Array(24)
      .fill(null)
      .map(() =>
        Array(10)
          .fill(null)
          .map(() => ({ filled: false }))
      );

  const defaultPlayer = {
    shape: [
      [1, 1],
      [1, 1],
    ], // O piece
    position: { x: 4, y: 10 },
    color: "yellow",
    name: "TestPlayer",
    room: "test-room",
  };

  const createDefaultProps = (overrides = {}) => {
    setPlayerSpy = sinon.spy();
    return {
      player: defaultPlayer,
      setPlayer: setPlayerSpy,
      pile: createEmptyPile(),
      isGameOver: false,
      ...overrides,
    };
  };

  describe("Initialization", () => {
    it("should register keydown listener on mount", () => {
      const props = createDefaultProps();
      const addEventListenerSpy = sinon.spy(window, "addEventListener");

      renderHook(() => useControls(props));

      expect(addEventListenerSpy.calledWith("keydown")).to.be.true;
      addEventListenerSpy.restore();
    });

    it("should remove keydown listener on unmount", () => {
      const props = createDefaultProps();
      const removeEventListenerSpy = sinon.spy(window, "removeEventListener");

      const { unmount } = renderHook(() => useControls(props));
      unmount();

      expect(removeEventListenerSpy.calledWith("keydown")).to.be.true;
      removeEventListenerSpy.restore();
    });
  });

  describe("Arrow Left - Move Left", () => {
    it("should move piece left when no collision", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.x).to.equal(3);
      expect(newPlayer.position.y).to.equal(10);
    });

    it("should not move left when collision with wall", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 0, y: 10 }, // At left wall
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not move left when collision with pile", () => {
      const pile = createEmptyPile();
      pile[10][3].filled = true; // Block on the left

      const props = createDefaultProps({ pile });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Arrow Right - Move Right", () => {
    it("should move piece right when no collision", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.x).to.equal(5);
      expect(newPlayer.position.y).to.equal(10);
    });

    it("should not move right when collision with wall", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 8, y: 10 }, // Near right wall (8 + 2-width = 10)
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not move right when collision with pile", () => {
      const pile = createEmptyPile();
      pile[10][6].filled = true; // Block on the right

      const props = createDefaultProps({ pile });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Arrow Down - Move Down", () => {
    it("should move piece down when no collision", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.x).to.equal(4);
      expect(newPlayer.position.y).to.equal(11);
    });

    it("should not move down when collision with bottom", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 4, y: 22 }, // Near bottom (22 + 2-height = 24)
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not move down when collision with pile", () => {
      const pile = createEmptyPile();
      pile[12][4].filled = true; // Block below
      pile[12][5].filled = true;

      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 4, y: 10 },
        },
        pile,
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Arrow Up - Rotate", () => {
    it("should rotate I piece", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]], // Horizontal I
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      const props = createDefaultProps({ player: iPiece });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      // Rotated I should be [[1], [1], [1], [1]]
      expect(newPlayer.shape).to.deep.equal([[1], [1], [1], [1]]);
    });

    it("should rotate T piece", () => {
      const tPiece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ], // T piece
        position: { x: 3, y: 10 },
        color: "purple",
      };

      const props = createDefaultProps({ player: tPiece });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.shape).to.be.an("array");
      expect(newPlayer.shape.length).to.equal(3);
    });

    it("should not rotate O piece (it's symmetric)", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      // O piece rotated is still O piece
      expect(newPlayer.shape).to.deep.equal([
        [1, 1],
        [1, 1],
      ]);
    });

    it("should try wall kicks when rotation blocked", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]], // Horizontal I
        position: { x: 0, y: 10 }, // At left wall
        color: "cyan",
      };

      const props = createDefaultProps({ player: iPiece });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      // Should try offsets: 0, -1, 1, -2, 2
      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      // Position should be adjusted
      expect(newPlayer.position.x).to.be.greaterThan(-1);
    });

    it("should not rotate when all wall kicks fail", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]], // Horizontal I
        position: { x: 0, y: 10 },
        color: "cyan",
      };

      // Create pile that blocks all rotation attempts
      const pile = createEmptyPile();
      for (let y = 9; y < 14; y++) {
        for (let x = 0; x < 3; x++) {
          pile[y][x].filled = true;
        }
      }

      const props = createDefaultProps({ player: iPiece, pile });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      // Rotation should fail
      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Space - Hard Drop", () => {
    it("should drop piece to bottom", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 4, y: 5 },
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.y).to.equal(22); // Bottom (24 - 2)
    });

    it("should drop piece to pile", () => {
      const pile = createEmptyPile();
      pile[15][4].filled = true;
      pile[15][5].filled = true;

      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 4, y: 5 },
        },
        pile,
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.y).to.equal(13); // Just above the pile
    });

    it("should not drop if already at bottom", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 4, y: 22 }, // Already at bottom
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(setPlayerSpy.called).to.be.true;
      const newPlayer = setPlayerSpy.firstCall.args[0];
      expect(newPlayer.position.y).to.equal(22); // Same position
    });
  });

  describe("Game Over State", () => {
    it("should not respond to any key when game over", () => {
      const props = createDefaultProps({ isGameOver: true });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not respond to arrow right when game over", () => {
      const props = createDefaultProps({ isGameOver: true });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not respond to arrow down when game over", () => {
      const props = createDefaultProps({ isGameOver: true });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not respond to rotation when game over", () => {
      const props = createDefaultProps({ isGameOver: true });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not respond to hard drop when game over", () => {
      const props = createDefaultProps({ isGameOver: true });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Unknown Keys", () => {
    it("should not respond to unknown keys", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      });

      expect(setPlayerSpy.called).to.be.false;
    });

    it("should not respond to Enter key", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });

  describe("Event Prevention", () => {
    it("should prevent default behavior for arrow keys", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const preventDefaultSpy = sinon.spy(event, "preventDefault");

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy.called).to.be.true;
    });

    it("should prevent default behavior for space", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      const event = new KeyboardEvent("keydown", { key: " " });
      const preventDefaultSpy = sinon.spy(event, "preventDefault");

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy.called).to.be.true;
    });
  });

  describe("Rotation Matrix Logic", () => {
    it("should correctly rotate 2x2 matrix", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const rotate = (m) =>
        m[0].map((_, i) => m.map((row) => row[i])).reverse();

      const rotated = rotate(matrix);

      expect(rotated).to.deep.equal([
        [3, 1],
        [4, 2],
      ]);
    });

    it("should correctly rotate 3x3 matrix", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const rotate = (m) =>
        m[0].map((_, i) => m.map((row) => row[i])).reverse();

      const rotated = rotate(matrix);

      expect(rotated).to.deep.equal([
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ]);
    });

    it("should correctly rotate 1x4 matrix (I piece)", () => {
      const matrix = [[1, 1, 1, 1]];
      const rotate = (m) =>
        m[0].map((_, i) => m.map((row) => row[i])).reverse();

      const rotated = rotate(matrix);

      expect(rotated).to.deep.equal([[1], [1], [1], [1]]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid key presses", () => {
      const props = createDefaultProps();

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(setPlayerSpy.callCount).to.be.greaterThan(0);
    });

    it("should handle piece at exact corner", () => {
      const props = createDefaultProps({
        player: {
          ...defaultPlayer,
          position: { x: 0, y: 0 },
        },
      });

      renderHook(() => useControls(props));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(setPlayerSpy.called).to.be.false;
    });
  });
});
