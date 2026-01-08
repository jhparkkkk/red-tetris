import { expect } from "chai";
import { renderHook, act } from "@testing-library/react-hooks";
import { usePlayer } from "../../../src/client/game/usePlayer";

describe("usePlayer Hook - Full Coverage", () => {
  describe("Initialization", () => {
    it("should initialize with empty shape", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player.shape).to.be.an("array");
      expect(result.current.player.shape).to.have.lengthOf(0);
    });

    it("should initialize with null color", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player.color).to.be.null;
    });

    it("should initialize with default position", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player.position).to.deep.equal({ x: 3, y: 3 });
    });

    it("should initialize with null name", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player.name).to.be.null;
    });

    it("should initialize with null room", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player.room).to.be.null;
    });

    it("should initialize nextPiece as null", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.nextPiece).to.be.null;
    });
  });

  describe("setPlayer Functionality", () => {
    it("should update player shape", () => {
      const { result } = renderHook(() => usePlayer());

      const newShape = [[1, 1, 1, 1]];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: newShape,
        });
      });

      expect(result.current.player.shape).to.deep.equal(newShape);
    });

    it("should update player color", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          color: "cyan",
        });
      });

      expect(result.current.player.color).to.equal("cyan");
    });

    it("should update player position", () => {
      const { result } = renderHook(() => usePlayer());

      const newPosition = { x: 5, y: 10 };

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: newPosition,
        });
      });

      expect(result.current.player.position).to.deep.equal(newPosition);
    });

    it("should update player name", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          name: "Alice",
        });
      });

      expect(result.current.player.name).to.equal("Alice");
    });

    it("should update player room", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          room: "room123",
        });
      });

      expect(result.current.player.room).to.equal("room123");
    });

    it("should update all player properties at once", () => {
      const { result } = renderHook(() => usePlayer());

      const newPlayer = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "yellow",
        position: { x: 4, y: 2 },
        name: "Bob",
        room: "room456",
      };

      act(() => {
        result.current.setPlayer(newPlayer);
      });

      expect(result.current.player).to.deep.equal(newPlayer);
    });
  });

  describe("resetPlayer Functionality", () => {
    it("should reset player to new player data", () => {
      const { result } = renderHook(() => usePlayer());

      // Set initial player
      act(() => {
        result.current.setPlayer({
          shape: [[1, 1]],
          color: "red",
          position: { x: 5, y: 5 },
          name: "OldPlayer",
          room: "oldRoom",
        });
      });

      // Reset with new player
      const newPlayer = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        position: { x: 3, y: 3 },
        name: "NewPlayer",
        room: "newRoom",
      };

      act(() => {
        result.current.resetPlayer(newPlayer);
      });

      expect(result.current.player).to.deep.equal(newPlayer);
    });

    it("should reset shape", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: [[1, 1]],
        });
      });

      const resetShape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      act(() => {
        result.current.resetPlayer({
          ...result.current.player,
          shape: resetShape,
        });
      });

      expect(result.current.player.shape).to.deep.equal(resetShape);
    });

    it("should reset position to spawn point", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: 8, y: 18 },
        });
      });

      const spawnPosition = { x: 3, y: 3 };

      act(() => {
        result.current.resetPlayer({
          ...result.current.player,
          position: spawnPosition,
        });
      });

      expect(result.current.player.position).to.deep.equal(spawnPosition);
    });
  });

  describe("setNextPiece Functionality", () => {
    it("should set next piece", () => {
      const { result } = renderHook(() => usePlayer());

      const nextPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      act(() => {
        result.current.setNextPiece(nextPiece);
      });

      expect(result.current.nextPiece).to.deep.equal(nextPiece);
    });

    it("should update next piece multiple times", () => {
      const { result } = renderHook(() => usePlayer());

      const piece1 = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "yellow",
        type: "O",
      };

      const piece2 = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "purple",
        type: "T",
      };

      act(() => {
        result.current.setNextPiece(piece1);
      });

      expect(result.current.nextPiece).to.deep.equal(piece1);

      act(() => {
        result.current.setNextPiece(piece2);
      });

      expect(result.current.nextPiece).to.deep.equal(piece2);
    });

    it("should set next piece to null", () => {
      const { result } = renderHook(() => usePlayer());

      const nextPiece = {
        shape: [[1, 1]],
        color: "red",
        type: "Z",
      };

      act(() => {
        result.current.setNextPiece(nextPiece);
      });

      expect(result.current.nextPiece).to.not.be.null;

      act(() => {
        result.current.setNextPiece(null);
      });

      expect(result.current.nextPiece).to.be.null;
    });
  });

  describe("Player Position Updates", () => {
    it("should move player right", () => {
      const { result } = renderHook(() => usePlayer());

      const initialPosition = result.current.player.position;

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: initialPosition.x + 1, y: initialPosition.y },
        });
      });

      expect(result.current.player.position.x).to.equal(initialPosition.x + 1);
    });

    it("should move player left", () => {
      const { result } = renderHook(() => usePlayer());

      const initialPosition = result.current.player.position;

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: initialPosition.x - 1, y: initialPosition.y },
        });
      });

      expect(result.current.player.position.x).to.equal(initialPosition.x - 1);
    });

    it("should move player down", () => {
      const { result } = renderHook(() => usePlayer());

      const initialPosition = result.current.player.position;

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: initialPosition.x, y: initialPosition.y + 1 },
        });
      });

      expect(result.current.player.position.y).to.equal(initialPosition.y + 1);
    });

    it("should move player to any position", () => {
      const { result } = renderHook(() => usePlayer());

      const targetPosition = { x: 7, y: 15 };

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: targetPosition,
        });
      });

      expect(result.current.player.position).to.deep.equal(targetPosition);
    });
  });

  describe("Different Tetrimino Shapes", () => {
    it("should set I piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const iShape = [[1, 1, 1, 1]];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: iShape,
          color: "cyan",
        });
      });

      expect(result.current.player.shape).to.deep.equal(iShape);
      expect(result.current.player.color).to.equal("cyan");
    });

    it("should set O piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const oShape = [
        [1, 1],
        [1, 1],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: oShape,
          color: "yellow",
        });
      });

      expect(result.current.player.shape).to.deep.equal(oShape);
      expect(result.current.player.color).to.equal("yellow");
    });

    it("should set T piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const tShape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: tShape,
          color: "purple",
        });
      });

      expect(result.current.player.shape).to.deep.equal(tShape);
      expect(result.current.player.color).to.equal("purple");
    });

    it("should set S piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const sShape = [
        [0, 1, 1],
        [1, 1, 0],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: sShape,
          color: "green",
        });
      });

      expect(result.current.player.shape).to.deep.equal(sShape);
    });

    it("should set Z piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const zShape = [
        [1, 1, 0],
        [0, 1, 1],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: zShape,
          color: "red",
        });
      });

      expect(result.current.player.shape).to.deep.equal(zShape);
    });

    it("should set J piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const jShape = [
        [1, 0, 0],
        [1, 1, 1],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: jShape,
          color: "blue",
        });
      });

      expect(result.current.player.shape).to.deep.equal(jShape);
    });

    it("should set L piece shape", () => {
      const { result } = renderHook(() => usePlayer());

      const lShape = [
        [0, 0, 1],
        [1, 1, 1],
      ];

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: lShape,
          color: "orange",
        });
      });

      expect(result.current.player.shape).to.deep.equal(lShape);
    });
  });

  describe("Return Values Structure", () => {
    it("should return player object", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.player).to.be.an("object");
      expect(result.current.player).to.have.property("shape");
      expect(result.current.player).to.have.property("color");
      expect(result.current.player).to.have.property("position");
      expect(result.current.player).to.have.property("name");
      expect(result.current.player).to.have.property("room");
    });

    it("should return setPlayer function", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.setPlayer).to.be.a("function");
    });

    it("should return resetPlayer function", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.resetPlayer).to.be.a("function");
    });

    it("should return nextPiece value", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current).to.have.property("nextPiece");
    });

    it("should return setNextPiece function", () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.setNextPiece).to.be.a("function");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle complete game piece lifecycle", () => {
      const { result } = renderHook(() => usePlayer());

      // Set next piece
      const nextPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      act(() => {
        result.current.setNextPiece(nextPiece);
      });

      // Spawn current piece
      act(() => {
        result.current.setPlayer({
          shape: nextPiece.shape,
          color: nextPiece.color,
          position: { x: 3, y: 3 },
          name: "Player1",
          room: "room123",
        });
      });

      // Move piece down
      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: 3, y: 4 },
        });
      });

      expect(result.current.player.position.y).to.equal(4);
      expect(result.current.nextPiece).to.deep.equal(nextPiece);
    });

    it("should handle multiple piece spawns", () => {
      const { result } = renderHook(() => usePlayer());

      const pieces = [
        { shape: [[1, 1, 1, 1]], color: "cyan", type: "I" },
        {
          shape: [
            [1, 1],
            [1, 1],
          ],
          color: "yellow",
          type: "O",
        },
        {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
          ],
          color: "purple",
          type: "T",
        },
      ];

      pieces.forEach((piece, index) => {
        act(() => {
          result.current.setPlayer({
            shape: piece.shape,
            color: piece.color,
            position: { x: 3, y: 3 },
            name: `Player${index}`,
            room: `room${index}`,
          });
        });

        expect(result.current.player.shape).to.deep.equal(piece.shape);
        expect(result.current.player.color).to.equal(piece.color);
      });
    });

    it("should maintain player data across position updates", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          shape: [[1, 1]],
          color: "red",
          position: { x: 3, y: 3 },
          name: "Alice",
          room: "testRoom",
        });
      });

      // Move multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.setPlayer({
            ...result.current.player,
            position: { x: 3, y: 3 + i },
          });
        });
      }

      // Player data should remain except position
      expect(result.current.player.shape).to.deep.equal([[1, 1]]);
      expect(result.current.player.color).to.equal("red");
      expect(result.current.player.name).to.equal("Alice");
      expect(result.current.player.room).to.equal("testRoom");
      expect(result.current.player.position.y).to.equal(7);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty shape array", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          shape: [],
        });
      });

      expect(result.current.player.shape).to.be.an("array");
      expect(result.current.player.shape).to.have.lengthOf(0);
    });

    it("should handle negative position", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: -1, y: -1 },
        });
      });

      expect(result.current.player.position).to.deep.equal({ x: -1, y: -1 });
    });

    it("should handle large position values", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setPlayer({
          ...result.current.player,
          position: { x: 100, y: 200 },
        });
      });

      expect(result.current.player.position).to.deep.equal({ x: 100, y: 200 });
    });

    it("should handle undefined nextPiece", () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setNextPiece(undefined);
      });

      expect(result.current.nextPiece).to.be.undefined;
    });
  });
});
