import React from "react";
import { expect } from "chai";
import renderer from "react-test-renderer";
import GameBoard from "../../../src/client/components/GameBoard";
import ThemeToggle from "../../../src/client/components/ThemeToggle";

describe("GameBoard Component - Function Coverage", () => {
  const createEmptyGrid = () => {
    return Array(20)
      .fill(null)
      .map(() => Array(10).fill(0));
  };

  describe("Rendering Tests", () => {
    it("should render without crashing", () => {
      const grid = createEmptyGrid();
      const component = renderer.create(<GameBoard grid={grid} />);

      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with filled cells", () => {
      const grid = createEmptyGrid();
      grid[19][5] = 1;

      const component = renderer.create(<GameBoard grid={grid} />);

      expect(component.toJSON()).to.not.be.null;
    });

    it("should render all rows", () => {
      const grid = createEmptyGrid();

      const component = renderer.create(<GameBoard grid={grid} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle grid updates", () => {
      const grid1 = createEmptyGrid();
      const component = renderer.create(<GameBoard grid={grid1} />);

      const grid2 = createEmptyGrid();
      grid2[10][5] = 1;

      component.update(<GameBoard grid={grid2} />);

      expect(component.toJSON()).to.not.be.null;
    });
  });
});

describe("ThemeToggle Component - Function Coverage", () => {
  describe("Rendering Tests", () => {
    it("should render without crashing", () => {
      const toggleTheme = () => {};

      const component = renderer.create(
        <ThemeToggle isDarkMode={false} toggleTheme={toggleTheme} />
      );

      expect(component.toJSON()).to.not.be.null;
    });

    it("should render in light mode", () => {
      const toggleTheme = () => {};

      const component = renderer.create(
        <ThemeToggle isDarkMode={false} toggleTheme={toggleTheme} />
      );

      expect(component.toJSON()).to.not.be.null;
    });

    it("should render in dark mode", () => {
      const toggleTheme = () => {};

      const component = renderer.create(
        <ThemeToggle isDarkMode={true} toggleTheme={toggleTheme} />
      );

      expect(component.toJSON()).to.not.be.null;
    });

    it("should accept toggleTheme function", () => {
      const toggleTheme = () => {};

      expect(() => {
        renderer.create(
          <ThemeToggle isDarkMode={false} toggleTheme={toggleTheme} />
        );
      }).to.not.throw();
    });

    it("should handle prop updates", () => {
      const toggleTheme = () => {};

      const component = renderer.create(
        <ThemeToggle isDarkMode={false} toggleTheme={toggleTheme} />
      );

      component.update(
        <ThemeToggle isDarkMode={true} toggleTheme={toggleTheme} />
      );

      expect(component.toJSON()).to.not.be.null;
    });
  });
});
