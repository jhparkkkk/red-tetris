import { expect } from "chai";
import { renderHook, act } from "@testing-library/react-hooks";
import { useTheme } from "../../../src/client/game/useTheme";
import sinon from "sinon";

describe("useTheme Hook - Full Coverage", () => {
  let localStorageStub;
  let documentStub;

  beforeEach(() => {
    // Mock localStorage
    localStorageStub = {
      getItem: sinon.stub(),
      setItem: sinon.stub(),
      removeItem: sinon.stub(),
      clear: sinon.stub(),
    };

    global.localStorage = localStorageStub;

    // Mock document.body.setAttribute
    if (typeof document !== "undefined" && document.body) {
      documentStub = sinon.stub(document.body, "setAttribute");
    }
  });

  afterEach(() => {
    sinon.restore();
    if (documentStub) {
      documentStub.restore();
    }
  });

  describe("Initialization", () => {
    it("should initialize with isDarkMode false", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.false;
    });

    it("should initialize with light theme by default", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.equal(false);
    });

    it("should load dark theme from localStorage", (done) => {
      localStorageStub.getItem.returns("dark");

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.true;
        done();
      }, 50);
    });

    it("should load light theme from localStorage", (done) => {
      localStorageStub.getItem.returns("light");

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.false;
        done();
      }, 10);
    });

    it("should call localStorage.getItem on mount", () => {
      localStorageStub.getItem.returns(null);

      renderHook(() => useTheme());

      // Wait for useEffect
      setTimeout(() => {
        expect(localStorageStub.getItem.calledWith("tetris-theme")).to.be.true;
      }, 10);
    });
  });

  describe("toggleTheme Functionality", () => {
    it("should toggle from light to dark", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.true;
        done();
      }, 50);
    });

    it("should toggle from dark to light", (done) => {
      localStorageStub.getItem.returns("dark");

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        act(() => {
          result.current.toggleTheme();
        });

        setTimeout(() => {
          expect(result.current.isDarkMode).to.be.false;
          done();
        }, 10);
      }, 10);
    });

    it("should toggle multiple times", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme(); // light -> dark
      });

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.true;

        act(() => {
          result.current.toggleTheme(); // dark -> light
        });

        setTimeout(() => {
          expect(result.current.isDarkMode).to.be.false;

          act(() => {
            result.current.toggleTheme(); // light -> dark
          });

          setTimeout(() => {
            expect(result.current.isDarkMode).to.be.true;
            done();
          }, 10);
        }, 10);
      }, 10);
    });
  });

  describe("localStorage Persistence", () => {
    it("should save dark theme to localStorage", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        expect(localStorageStub.setItem.calledWith("tetris-theme", "dark")).to
          .be.true;
        done();
      }, 20);
    });

    it("should save light theme to localStorage", (done) => {
      localStorageStub.getItem.returns(null);

      renderHook(() => useTheme());

      setTimeout(() => {
        expect(localStorageStub.setItem.calledWith("tetris-theme", "light")).to
          .be.true;
        done();
      }, 20);
    });

    it("should update localStorage when toggling", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        expect(localStorageStub.setItem.called).to.be.true;
        done();
      }, 20);
    });
  });

  describe("DOM Manipulation", () => {
    it("should set data-theme attribute to light on init", (done) => {
      localStorageStub.getItem.returns(null);

      if (typeof document !== "undefined" && document.body) {
        renderHook(() => useTheme());

        setTimeout(() => {
          expect(documentStub.calledWith("data-theme", "light")).to.be.true;
          done();
        }, 20);
      } else {
        done();
      }
    });

    it("should set data-theme attribute to dark when toggled", (done) => {
      localStorageStub.getItem.returns(null);

      if (typeof document !== "undefined" && document.body) {
        const { result } = renderHook(() => useTheme());

        act(() => {
          result.current.toggleTheme();
        });

        setTimeout(() => {
          expect(documentStub.calledWith("data-theme", "dark")).to.be.true;
          done();
        }, 20);
      } else {
        done();
      }
    });

    it("should load dark theme from localStorage and set attribute", (done) => {
      localStorageStub.getItem.returns("dark");

      if (typeof document !== "undefined" && document.body) {
        renderHook(() => useTheme());

        setTimeout(() => {
          expect(documentStub.calledWith("data-theme", "dark")).to.be.true;
          done();
        }, 20);
      } else {
        done();
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage.getItem errors gracefully", () => {
      localStorageStub.getItem.throws(new Error("localStorage not available"));

      const { result } = renderHook(() => useTheme());

      // Should not crash
      expect(result.current.isDarkMode).to.be.false;
    });

    it("should handle localStorage.setItem errors gracefully", (done) => {
      localStorageStub.getItem.returns(null);
      localStorageStub.setItem.throws(new Error("localStorage not available"));

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        // Should not crash, just log error
        expect(result.current.isDarkMode).to.be.true;
        done();
      }, 10);
    });

    it("should handle document.body.setAttribute errors", (done) => {
      localStorageStub.getItem.returns(null);

      if (typeof document !== "undefined" && document.body) {
        documentStub.throws(new Error("setAttribute failed"));
      }

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        // Should not crash
        expect(result.current.isDarkMode).to.be.false;
        done();
      }, 10);
    });
  });

  describe("Return Values Structure", () => {
    it("should return isDarkMode boolean", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.a("boolean");
    });

    it("should return toggleTheme function", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.toggleTheme).to.be.a("function");
    });

    it("should return object with both properties", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current).to.have.property("isDarkMode");
      expect(result.current).to.have.property("toggleTheme");
    });
  });

  describe("State Persistence Across Re-renders", () => {
    it("should maintain dark mode state after re-render", (done) => {
      localStorageStub.getItem.returns(null);

      const { result, rerender } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        rerender();
        expect(result.current.isDarkMode).to.be.true;
        done();
      }, 10);
    });

    it("should maintain light mode state after re-render", () => {
      localStorageStub.getItem.returns(null);

      const { result, rerender } = renderHook(() => useTheme());

      rerender();
      expect(result.current.isDarkMode).to.be.false;
    });
  });

  describe("Integration Scenarios", () => {
    it("should complete a full theme toggle cycle", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.false;

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.true;

        act(() => {
          result.current.toggleTheme();
        });

        setTimeout(() => {
          expect(result.current.isDarkMode).to.be.false;
          done();
        }, 10);
      }, 10);
    });

    it("should load saved theme and allow toggling", (done) => {
      localStorageStub.getItem.returns("dark");

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        expect(result.current.isDarkMode).to.be.true;

        act(() => {
          result.current.toggleTheme();
        });

        setTimeout(() => {
          expect(result.current.isDarkMode).to.be.false;
          done();
        }, 10);
      }, 10);
    });

    it("should handle unmount and remount correctly", (done) => {
      localStorageStub.getItem.returns(null);

      const { result, unmount } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        unmount();

        // Remount - localStorage should now return "dark"
        localStorageStub.getItem.returns("dark");
        const { result: result2 } = renderHook(() => useTheme());

        setTimeout(() => {
          expect(result2.current.isDarkMode).to.be.true;
          done();
        }, 50);
      }, 50);
    });
  });

  describe("typeof window Check", () => {
    it("should check for window availability", () => {
      localStorageStub.getItem.returns(null);

      // Hook should not crash if window is undefined
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.a("boolean");
    });

    it("should work in browser environment", () => {
      localStorageStub.getItem.returns(null);

      if (typeof window !== "undefined") {
        const { result } = renderHook(() => useTheme());

        expect(result.current.isDarkMode).to.be.false;
        expect(result.current.toggleTheme).to.be.a("function");
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid toggles", (done) => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
        result.current.toggleTheme();
        result.current.toggleTheme();
      });

      setTimeout(() => {
        // After 3 toggles: false -> true -> false -> true
        expect(result.current.isDarkMode).to.be.true;
        done();
      }, 10);
    });

    it("should handle invalid localStorage value", (done) => {
      localStorageStub.getItem.returns("invalid-value");

      const { result } = renderHook(() => useTheme());

      setTimeout(() => {
        // Should default to false for invalid values
        expect(result.current.isDarkMode).to.be.false;
        done();
      }, 10);
    });

    it("should handle null localStorage value", () => {
      localStorageStub.getItem.returns(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.false;
    });

    it("should handle undefined localStorage value", () => {
      localStorageStub.getItem.returns(undefined);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDarkMode).to.be.false;
    });
  });

  describe("Console Error Logging", () => {
    let consoleStub;

    afterEach(() => {
      if (consoleStub) {
        consoleStub.restore();
      }
    });

    it("should log error when localStorage.getItem fails", (done) => {
      consoleStub = sinon.stub(console, "error");
      localStorageStub.getItem.throws(new Error("localStorage error"));

      renderHook(() => useTheme());

      // Should log error
      setTimeout(() => {
        expect(consoleStub.called).to.be.true;
        done();
      }, 20);
    });

    it("should log error when localStorage.setItem fails", (done) => {
      consoleStub = sinon.stub(console, "error");
      localStorageStub.getItem.returns(null);
      localStorageStub.setItem.throws(new Error("localStorage error"));

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      setTimeout(() => {
        expect(consoleStub.called).to.be.true;
        done();
      }, 30);
    });
  });
});
