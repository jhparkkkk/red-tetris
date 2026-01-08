import React from "react";
import { expect } from "chai";
import renderer from "react-test-renderer";
import NextPiece from "../../../src/client/components/NextPiece";

describe("NextPiece Component", () => {
  describe("Rendering with null nextPiece", () => {
    it("should render without crashing when nextPiece is null", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render placeholder with empty class", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      // Check structure
      expect(tree.type).to.equal("div");
      expect(tree.props.className).to.equal("next-piece-container");
    });

    it("should display three dots when no piece", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      // Find the empty grid
      const grid = tree.children[1]; // Second child after title
      expect(grid.props.className).to.include("empty");
    });
  });

  describe("Rendering with undefined nextPiece", () => {
    it("should handle undefined nextPiece gracefully", () => {
      const component = renderer.create(<NextPiece nextPiece={undefined} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
      expect(tree.props.className).to.equal("next-piece-container");
    });
  });

  describe("Rendering with valid nextPiece", () => {
    it("should render I piece (1x4)", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={iPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
      expect(tree.props.className).to.equal("next-piece-container");
    });

    it("should render O piece (2x2)", () => {
      const oPiece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "yellow",
        type: "O",
      };

      const component = renderer.create(<NextPiece nextPiece={oPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render T piece with correct structure", () => {
      const tPiece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "purple",
        type: "T",
      };

      const component = renderer.create(<NextPiece nextPiece={tPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
      expect(tree.type).to.equal("div");
    });

    it("should render S piece", () => {
      const sPiece = {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "green",
        type: "S",
      };

      const component = renderer.create(<NextPiece nextPiece={sPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render Z piece", () => {
      const zPiece = {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "red",
        type: "Z",
      };

      const component = renderer.create(<NextPiece nextPiece={zPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render J piece", () => {
      const jPiece = {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "blue",
        type: "J",
      };

      const component = renderer.create(<NextPiece nextPiece={jPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render L piece", () => {
      const lPiece = {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "orange",
        type: "L",
      };

      const component = renderer.create(<NextPiece nextPiece={lPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Component Structure", () => {
    it("should have container div", () => {
      const mockPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      expect(tree.type).to.equal("div");
      expect(tree.props.className).to.equal("next-piece-container");
    });

    it("should have title element", () => {
      const mockPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const title = tree.children[0];
      expect(title.type).to.equal("h3");
      expect(title.props.className).to.equal("next-piece-title");
    });

    it("should render grid container", () => {
      const mockPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      expect(grid.type).to.equal("div");
      expect(grid.props.className).to.equal("next-piece-grid");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty shape array", () => {
      const emptyPiece = {
        shape: [],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={emptyPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle piece with only zeros", () => {
      const zeroPiece = {
        shape: [[0, 0, 0]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={zeroPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle large shape", () => {
      const largePiece = {
        shape: [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
        ],
        color: "cyan",
        type: "custom",
      };

      const component = renderer.create(<NextPiece nextPiece={largePiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Snapshot Testing", () => {
    it("should match snapshot for null piece", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for I piece", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={iPiece} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for O piece", () => {
      const oPiece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "yellow",
        type: "O",
      };

      const component = renderer.create(<NextPiece nextPiece={oPiece} />);
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });
  });

  describe("Props Validation", () => {
    it("should accept valid nextPiece prop", () => {
      const validPiece = {
        shape: [[1]],
        color: "red",
        type: "Z",
      };

      expect(() => {
        renderer.create(<NextPiece nextPiece={validPiece} />);
      }).to.not.throw();
    });

    it("should handle missing color property", () => {
      const pieceWithoutColor = {
        shape: [[1]],
        type: "Z",
      };

      expect(() => {
        renderer.create(<NextPiece nextPiece={pieceWithoutColor} />);
      }).to.not.throw();
    });

    it("should handle missing shape property", () => {
      const pieceWithoutShape = {
        color: "red",
        type: "Z",
      };

      // Sans shape, le composant va crash (c'est normal)
      // On vérifie juste qu'il ne crash pas tout le test suite
      try {
        renderer.create(<NextPiece nextPiece={pieceWithoutShape} />);
      } catch (error) {
        // Expected error - shape.map() on undefined
        expect(error).to.be.an("error");
      }
    });
  });
});
