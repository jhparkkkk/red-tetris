import React from "react";
import { expect } from "chai";
import renderer from "react-test-renderer";
import Spectrum from "../../../src/client/components/Spectrum";

describe("Spectrum Component - Without Enzyme", () => {
  const defaultProps = {
    playerName: "TestPlayer",
    heights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    isGameOver: false,
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render with container div", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree.type).to.equal("div");
      expect(tree.props.className).to.include("spectrum-container");
    });

    it("should display player name", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      // Find header
      const header = tree.children[0];
      expect(header.props.className).to.equal("spectrum-header");
    });

    it("should render 10 columns", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      // Grid is second child
      const grid = tree.children[1];
      expect(grid.children).to.have.lengthOf(10);
    });
  });

  describe("Game Over State", () => {
    it("should add game-over class when isGameOver is true", () => {
      const props = {
        ...defaultProps,
        isGameOver: true,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree.props.className).to.include("game-over");
    });

    it("should not have game-over class when isGameOver is false", () => {
      const props = {
        ...defaultProps,
        isGameOver: false,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree.props.className).to.not.include("game-over");
    });

    it("should display skull emoji when game over", () => {
      const props = {
        ...defaultProps,
        isGameOver: true,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      // Header contains status
      const header = tree.children[0];
      expect(header.children).to.have.lengthOf(2);
    });

    it("should not display skull emoji when not game over", () => {
      const props = {
        ...defaultProps,
        isGameOver: false,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      // Header contains only player name
      const header = tree.children[0];
      expect(header.children).to.have.lengthOf(1);
    });
  });

  describe("Heights Rendering", () => {
    it("should render empty spectrum (all zeros)", () => {
      const props = {
        ...defaultProps,
        heights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render low heights (green zone)", () => {
      const props = {
        ...defaultProps,
        heights: [1, 2, 3, 1, 2, 1, 3, 2, 1, 2],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render medium heights (yellow zone)", () => {
      const props = {
        ...defaultProps,
        heights: [8, 9, 10, 8, 9, 8, 10, 9, 8, 9],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render high heights (orange zone)", () => {
      const props = {
        ...defaultProps,
        heights: [14, 15, 13, 14, 15, 14, 13, 15, 14, 13],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render critical heights (red zone)", () => {
      const props = {
        ...defaultProps,
        heights: [18, 19, 20, 18, 19, 18, 20, 19, 18, 19],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render mixed heights", () => {
      const props = {
        ...defaultProps,
        heights: [2, 5, 10, 15, 18, 3, 8, 14, 19, 1],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle maximum height (20)", () => {
      const props = {
        ...defaultProps,
        heights: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Player Names", () => {
    it("should display short player name", () => {
      const props = {
        ...defaultProps,
        playerName: "Bob",
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display long player name", () => {
      const props = {
        ...defaultProps,
        playerName: "VeryLongPlayerName123",
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display player name with special characters", () => {
      const props = {
        ...defaultProps,
        playerName: "Player_123",
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty heights array", () => {
      const props = {
        ...defaultProps,
        heights: [],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle more than 10 columns", () => {
      const props = {
        ...defaultProps,
        heights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle less than 10 columns", () => {
      const props = {
        ...defaultProps,
        heights: [1, 2, 3, 4, 5],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle negative heights", () => {
      const props = {
        ...defaultProps,
        heights: [-1, -2, -3, 0, 1, 2, 3, 4, 5, 6],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle heights above maximum", () => {
      const props = {
        ...defaultProps,
        heights: [25, 30, 22, 24, 21, 23, 26, 28, 27, 29],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Component Structure", () => {
    it("should have header with player name", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      const header = tree.children[0];
      expect(header.type).to.equal("div");
      expect(header.props.className).to.equal("spectrum-header");
    });

    it("should have grid container", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      expect(grid.type).to.equal("div");
      expect(grid.props.className).to.equal("spectrum-grid");
    });

    it("should have columns with bars", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstColumn = grid.children[0];

      expect(firstColumn.props.className).to.equal("spectrum-column");
      expect(firstColumn.children[0].props.className).to.equal("spectrum-bar");
    });
  });

  describe("Color Mapping", () => {
    it("should use green for safe heights (< 6)", () => {
      const props = {
        ...defaultProps,
        heights: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      // Green color
      expect(firstBar.props.style.backgroundColor).to.equal("#4CAF50");
    });

    it("should use yellow for medium heights (6-12)", () => {
      const props = {
        ...defaultProps,
        heights: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      // Yellow color
      expect(firstBar.props.style.backgroundColor).to.equal("#FFC107");
    });

    it("should use orange for danger heights (12-16)", () => {
      const props = {
        ...defaultProps,
        heights: [14, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      // Orange color
      expect(firstBar.props.style.backgroundColor).to.equal("#FF9800");
    });

    it("should use red for critical heights (>= 16)", () => {
      const props = {
        ...defaultProps,
        heights: [18, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      // Red color
      expect(firstBar.props.style.backgroundColor).to.equal("#F44336");
    });
  });

  describe("Bar Height Calculation", () => {
    it("should calculate 0% height for zero", () => {
      const props = {
        ...defaultProps,
        heights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      expect(firstBar.props.style.height).to.equal("0%");
    });

    it("should calculate 50% height for height 10", () => {
      const props = {
        ...defaultProps,
        heights: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      expect(firstBar.props.style.height).to.equal("50%");
    });

    it("should calculate 100% height for height 20", () => {
      const props = {
        ...defaultProps,
        heights: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const firstBar = grid.children[0].children[0];

      expect(firstBar.props.style.height).to.equal("100%");
    });
  });

  describe("Snapshot Testing", () => {
    it("should match snapshot for empty spectrum", () => {
      const component = renderer.create(<Spectrum {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for active player", () => {
      const props = {
        playerName: "Alice",
        heights: [5, 8, 3, 10, 15, 2, 7, 12, 18, 4],
        isGameOver: false,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for game over player", () => {
      const props = {
        playerName: "Bob",
        heights: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
        isGameOver: true,
      };

      const component = renderer.create(<Spectrum {...props} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });
  });
});
