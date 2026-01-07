import { expect } from "chai";
import { renderHook, act } from "@testing-library/react-hooks";
import { useScore } from "../../../src/client/game/useScore";

describe("useScore Hook - Full Coverage", () => {
  describe("Initialization", () => {
    it("should initialize with score 0", () => {
      const { result } = renderHook(() => useScore());

      expect(result.current.score).to.equal(0);
    });

    it("should initialize with 0 lines cleared", () => {
      const { result } = renderHook(() => useScore());

      expect(result.current.linesCleared).to.equal(0);
    });

    it("should initialize with level 1", () => {
      const { result } = renderHook(() => useScore());

      expect(result.current.level).to.equal(1);
    });
  });

  describe("Single Line Clear", () => {
    it("should award 100 points for 1 line at level 1", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1);
      });

      expect(result.current.score).to.equal(100);
      expect(result.current.linesCleared).to.equal(1);
    });

    it("should increment lines cleared counter", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1);
      });

      expect(result.current.linesCleared).to.equal(1);
    });
  });

  describe("Double Line Clear", () => {
    it("should award 300 points for 2 lines at level 1", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(2);
      });

      expect(result.current.score).to.equal(300);
      expect(result.current.linesCleared).to.equal(2);
    });
  });

  describe("Triple Line Clear", () => {
    it("should award 500 points for 3 lines at level 1", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(3);
      });

      expect(result.current.score).to.equal(500);
      expect(result.current.linesCleared).to.equal(3);
    });
  });

  describe("Tetris (4 Lines)", () => {
    it("should award 800 points for 4 lines at level 1", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(4);
      });

      expect(result.current.score).to.equal(800);
      expect(result.current.linesCleared).to.equal(4);
    });
  });

  describe("Multiple Clears", () => {
    it("should accumulate score from multiple clears", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1); // 100
        result.current.addLinesCleared(2); // 300
        result.current.addLinesCleared(3); // 500
      });

      expect(result.current.score).to.equal(900);
      expect(result.current.linesCleared).to.equal(6);
    });

    it("should accumulate lines cleared", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1);
        result.current.addLinesCleared(1);
        result.current.addLinesCleared(1);
      });

      expect(result.current.linesCleared).to.equal(3);
    });
  });

  describe("Level Progression", () => {
    it("should increase level to 2 after 10 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(10);
      });

      expect(result.current.level).to.equal(2);
    });

    it("should increase level to 3 after 20 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(20);
      });

      expect(result.current.level).to.equal(3);
    });

    it("should stay at level 1 with 9 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(9);
      });

      expect(result.current.level).to.equal(1);
    });

    it("should calculate level correctly for 15 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(15);
      });

      expect(result.current.level).to.equal(2);
    });
  });

  describe("Score Multiplier by Level", () => {
    it("should multiply score by level 2", (done) => {
      const { result } = renderHook(() => useScore());

      // Add lines one by one to reach level 2
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addLinesCleared(1); // 10 singles at level 1 = 10 * 100 = 1000
        }
      });

      // Wait for useEffect to update level to 2
      setTimeout(() => {
        expect(result.current.level).to.equal(2);

        act(() => {
          result.current.addLinesCleared(1); // 1 single at level 2 = 100 * 2 = 200
        });

        // Total: 1000 + 200 = 1200
        expect(result.current.score).to.equal(1200);
        done();
      }, 10);
    });

    it("should multiply Tetris score by level", (done) => {
      const { result } = renderHook(() => useScore());

      // Add lines one by one to reach level 2
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addLinesCleared(1); // 10 singles = 1000 points
        }
      });

      setTimeout(() => {
        expect(result.current.level).to.equal(2);

        act(() => {
          result.current.addLinesCleared(4); // Tetris at level 2: 800 * 2 = 1600
        });

        // Total: 1000 + 1600 = 2600
        expect(result.current.score).to.equal(2600);
        done();
      }, 10);
    });

    it("should apply correct multiplier at level 5", (done) => {
      const { result } = renderHook(() => useScore());

      // Add 40 lines one by one to reach level 5
      act(() => {
        for (let i = 0; i < 40; i++) {
          result.current.addLinesCleared(1);
        }
      });

      setTimeout(() => {
        expect(result.current.level).to.equal(5);

        const scoreBeforeLast = result.current.score;

        act(() => {
          result.current.addLinesCleared(1); // 100 * 5 = 500
        });

        expect(result.current.score).to.equal(scoreBeforeLast + 500);
        done();
      }, 10);
    });
  });

  describe("Edge Cases", () => {
    it("should handle 0 lines cleared", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(0);
      });

      expect(result.current.score).to.equal(0);
      expect(result.current.linesCleared).to.equal(0);
    });

    it("should handle negative lines (should not add)", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(-1);
      });

      expect(result.current.score).to.equal(0);
      expect(result.current.linesCleared).to.equal(0);
    });

    it("should handle more than 4 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(5);
      });

      // Should give 0 points (not in basePoints)
      expect(result.current.score).to.equal(0);
      expect(result.current.linesCleared).to.equal(5);
    });
  });

  describe("Reset Functionality", () => {
    it("should reset score to 0", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(10);
        result.current.resetScore();
      });

      expect(result.current.score).to.equal(0);
    });

    it("should reset lines cleared to 0", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(10);
        result.current.resetScore();
      });

      expect(result.current.linesCleared).to.equal(0);
    });

    it("should reset level to 1", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(20); // Level 3
        result.current.resetScore();
      });

      expect(result.current.level).to.equal(1);
    });

    it("should allow scoring again after reset", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(10);
        result.current.resetScore();
        result.current.addLinesCleared(1);
      });

      expect(result.current.score).to.equal(100);
      expect(result.current.linesCleared).to.equal(1);
      expect(result.current.level).to.equal(1);
    });
  });

  describe("Scoring Formula Verification", () => {
    it("should use correct base points for single", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1);
      });

      expect(result.current.score).to.equal(100); // 100 * 1
    });

    it("should use correct base points for double", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(2);
      });

      expect(result.current.score).to.equal(300); // 300 * 1
    });

    it("should use correct base points for triple", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(3);
      });

      expect(result.current.score).to.equal(500); // 500 * 1
    });

    it("should use correct base points for tetris", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(4);
      });

      expect(result.current.score).to.equal(800); // 800 * 1
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle game progression correctly", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        // Clear 5 singles to reach halfway to level 2
        for (let i = 0; i < 5; i++) {
          result.current.addLinesCleared(1);
        }
      });

      expect(result.current.level).to.equal(1);
      expect(result.current.linesCleared).to.equal(5);
      expect(result.current.score).to.equal(500);
    });

    it("should handle mix of line clears", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1); // 100
        result.current.addLinesCleared(2); // 300
        result.current.addLinesCleared(3); // 500
        result.current.addLinesCleared(4); // 800
      });

      expect(result.current.score).to.equal(1700);
      expect(result.current.linesCleared).to.equal(10);
      expect(result.current.level).to.equal(2);
    });
  });

  describe("getPointsForLines Internal Logic", () => {
    it("should calculate correct points for 1 line", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(1);
      });

      expect(result.current.score).to.equal(100);
    });

    it("should calculate correct points for 2 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(2);
      });

      expect(result.current.score).to.equal(300);
    });

    it("should calculate correct points for 3 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(3);
      });

      expect(result.current.score).to.equal(500);
    });

    it("should calculate correct points for 4 lines", () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.addLinesCleared(4);
      });

      expect(result.current.score).to.equal(800);
    });
  });

  describe("Level Calculation Formula", () => {
    it("should calculate level as floor(lines/10) + 1", () => {
      const { result } = renderHook(() => useScore());

      const testCases = [
        { lines: 0, expectedLevel: 1 },
        { lines: 9, expectedLevel: 1 },
        { lines: 10, expectedLevel: 2 },
        { lines: 19, expectedLevel: 2 },
        { lines: 20, expectedLevel: 3 },
        { lines: 50, expectedLevel: 6 },
      ];

      testCases.forEach(({ lines, expectedLevel }) => {
        act(() => {
          result.current.resetScore();
          result.current.addLinesCleared(lines);
        });

        expect(result.current.level).to.equal(
          expectedLevel,
          `Failed for ${lines} lines`
        );
      });
    });
  });
});
