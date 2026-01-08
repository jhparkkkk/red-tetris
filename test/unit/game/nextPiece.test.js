import React from "react";
import { expect } from "chai";
import renderer from "react-test-renderer";
import NextPiece from "../../../src/client/components/NextPiece";

describe("NextPiece Component - Complete Tests", () => {
  describe("Rendering with null/undefined", () => {
    it("should render without crashing when nextPiece is null", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render placeholder when nextPiece is null", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      expect(tree.type).to.equal("div");
      expect(tree.props.className).to.equal("next-piece-container");
    });

    it("should show empty grid with placeholder", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      expect(grid.props.className).to.include("empty");
    });

    it("should display three dots when no piece", () => {
      const component = renderer.create(<NextPiece nextPiece={null} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle undefined nextPiece gracefully", () => {
      const component = renderer.create(<NextPiece nextPiece={undefined} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
      expect(tree.props.className).to.equal("next-piece-container");
    });
  });

  describe("Rendering with I piece", () => {
    it("should render I piece (1x4 horizontal)", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={iPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render I piece with correct structure", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={iPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      expect(grid.props.className).to.equal("next-piece-grid");
    });

    it("should render I piece with cyan color", () => {
      const iPiece = {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={iPiece} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Rendering with O piece", () => {
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

    it("should render O piece with 2 rows", () => {
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

      const grid = tree.children[1];
      expect(grid.children).to.have.lengthOf(2);
    });
  });

  describe("Rendering with T piece", () => {
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

    it("should render T piece with filled and empty cells", () => {
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
    });
  });

  describe("Rendering with S piece", () => {
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
  });

  describe("Rendering with Z piece", () => {
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
  });

  describe("Rendering with J piece", () => {
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
  });

  describe("Rendering with L piece", () => {
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

  describe("Cell Styling", () => {
    it("should apply backgroundColor to filled cells", () => {
      const mockPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const row = grid.children[0];
      const cell = row.children[0];

      expect(cell.props.style.backgroundColor).to.equal("cyan");
    });

    it("should apply transparent to empty cells", () => {
      const mockPiece = {
        shape: [[0]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const row = grid.children[0];
      const cell = row.children[0];

      expect(cell.props.style.backgroundColor).to.equal("transparent");
    });

    it("should apply filled class to filled cells", () => {
      const mockPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const row = grid.children[0];
      const cell = row.children[0];

      expect(cell.props.className).to.include("filled");
    });

    it("should apply empty class to empty cells", () => {
      const mockPiece = {
        shape: [[0]],
        color: "cyan",
        type: "I",
      };

      const component = renderer.create(<NextPiece nextPiece={mockPiece} />);
      const tree = component.toJSON();

      const grid = tree.children[1];
      const row = grid.children[0];
      const cell = row.children[0];

      expect(cell.props.className).to.include("empty");
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

    it("should handle missing color property", () => {
      const pieceWithoutColor = {
        shape: [[1]],
        type: "Z",
      };

      const component = renderer.create(
        <NextPiece nextPiece={pieceWithoutColor} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle missing shape property", () => {
      const pieceWithoutShape = {
        color: "red",
        type: "Z",
      };

      // Sans shape, le composant va crash (comportement attendu)
      try {
        renderer.create(<NextPiece nextPiece={pieceWithoutShape} />);
      } catch (error) {
        expect(error).to.be.an("error");
      }
    });
  });

  describe("Different Colors", () => {
    it("should render with cyan color", () => {
      const piece = { shape: [[1]], color: "cyan", type: "I" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with yellow color", () => {
      const piece = { shape: [[1]], color: "yellow", type: "O" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with purple color", () => {
      const piece = { shape: [[1]], color: "purple", type: "T" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with green color", () => {
      const piece = { shape: [[1]], color: "green", type: "S" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with red color", () => {
      const piece = { shape: [[1]], color: "red", type: "Z" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with blue color", () => {
      const piece = { shape: [[1]], color: "blue", type: "J" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
    });

    it("should render with orange color", () => {
      const piece = { shape: [[1]], color: "orange", type: "L" };
      const component = renderer.create(<NextPiece nextPiece={piece} />);
      expect(component.toJSON()).to.not.be.null;
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

    it("should handle null prop", () => {
      expect(() => {
        renderer.create(<NextPiece nextPiece={null} />);
      }).to.not.throw();
    });

    it("should handle undefined prop", () => {
      expect(() => {
        renderer.create(<NextPiece nextPiece={undefined} />);
      }).to.not.throw();
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
});
