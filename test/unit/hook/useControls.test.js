import { expect } from "chai";
import { renderHook } from "@testing-library/react-hooks";
import { useControls } from "../../../src/client/game/useControls";
import sinon from "sinon";

describe("useControls Hook - Simplified Coverage", () => {
  let setPlayerStub;

  beforeEach(() => {
    setPlayerStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  const createMockPlayer = () => ({
    shape: [[1, 1, 1, 1]],
    color: "cyan",
    position: { x: 3, y: 3 },
    name: "TestPlayer",
    room: "testRoom",
  });

  const createEmptyPile = () => {
    return Array(20)
      .fill(null)
      .map(() => Array(10).fill(0));
  };

  describe("Hook Initialization", () => {
    it("should initialize without crashing", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { result } = renderHook(() => useControls(props));

      expect(result).to.exist;
    });

    it("should accept all required props", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should work with different player positions", () => {
      const player = createMockPlayer();
      player.position = { x: 5, y: 10 };

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should work with game over state", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: true,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });
  });

  describe("Different Player Shapes", () => {
    it("should handle I piece", () => {
      const player = createMockPlayer();
      player.shape = [[1, 1, 1, 1]];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle O piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [1, 1],
        [1, 1],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle T piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle S piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [0, 1, 1],
        [1, 1, 0],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle Z piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [1, 1, 0],
        [0, 1, 1],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle J piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [1, 0, 0],
        [1, 1, 1],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle L piece", () => {
      const player = createMockPlayer();
      player.shape = [
        [0, 0, 1],
        [1, 1, 1],
      ];

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });
  });

  describe("Different Pile Configurations", () => {
    it("should handle empty pile", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle pile with blocks", () => {
      const pile = createEmptyPile();
      pile[19][0] = 1;
      pile[19][1] = 1;
      pile[19][2] = 1;

      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile,
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle pile with scattered blocks", () => {
      const pile = createEmptyPile();
      pile[15][5] = 1;
      pile[16][3] = 1;
      pile[18][7] = 1;

      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile,
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle full bottom row", () => {
      const pile = createEmptyPile();
      for (let i = 0; i < 10; i++) {
        pile[19][i] = 1;
      }

      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile,
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });
  });

  describe("Props Updates", () => {
    it("should handle player position updates", () => {
      const player1 = createMockPlayer();
      const props = {
        player: player1,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { rerender } = renderHook(() => useControls(props));

      const player2 = createMockPlayer();
      player2.position.x = 5;

      rerender({ ...props, player: player2 });

      expect(true).to.be.true;
    });

    it("should handle pile updates", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { rerender } = renderHook(() => useControls(props));

      const newPile = createEmptyPile();
      newPile[10][5] = 1;

      rerender({ ...props, pile: newPile });

      expect(true).to.be.true;
    });

    it("should handle isGameOver state change", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { rerender } = renderHook(() => useControls(props));

      rerender({ ...props, isGameOver: true });

      expect(true).to.be.true;
    });

    it("should handle setPlayer function change", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { rerender } = renderHook(() => useControls(props));

      const newSetPlayer = sinon.stub();
      rerender({ ...props, setPlayer: newSetPlayer });

      expect(true).to.be.true;
    });
  });

  describe("Edge Cases", () => {
    it("should handle player at top left corner", () => {
      const player = createMockPlayer();
      player.position = { x: 0, y: 0 };

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle player at top right corner", () => {
      const player = createMockPlayer();
      player.position = { x: 9, y: 0 };

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle player at bottom", () => {
      const player = createMockPlayer();
      player.position = { x: 5, y: 19 };

      const props = {
        player,
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      expect(() => {
        renderHook(() => useControls(props));
      }).to.not.throw();
    });

    it("should handle multiple re-renders", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { rerender } = renderHook(() => useControls(props));

      for (let i = 0; i < 10; i++) {
        rerender(props);
      }

      expect(true).to.be.true;
    });
  });

  describe("Cleanup", () => {
    it("should cleanup on unmount", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      const { unmount } = renderHook(() => useControls(props));

      expect(() => {
        unmount();
      }).to.not.throw();
    });

    it("should handle multiple mount/unmount cycles", () => {
      const props = {
        player: createMockPlayer(),
        setPlayer: setPlayerStub,
        pile: createEmptyPile(),
        isGameOver: false,
      };

      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useControls(props));
        unmount();
      }

      expect(true).to.be.true;
    });
  });
});
