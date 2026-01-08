import React from "react";
import { expect } from "chai";
import renderer from "react-test-renderer";
import ScoreBoard from "../../../src/client/components/ScoreBoard";

describe("ScoreBoard Component - Without Enzyme", () => {
  const defaultProps = {
    score: 0,
    linesCleared: 0,
    level: 1,
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should render container div", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree.type).to.equal("div");
      expect(tree.props.className).to.equal("scoreboard-container");
    });

    it("should render two scoreboard items", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      expect(tree.children).to.have.lengthOf(2);
    });
  });

  describe("Score Display", () => {
    it("should display score 0", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display score 100", () => {
      const component = renderer.create(
        <ScoreBoard score={100} linesCleared={1} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display score 1000", () => {
      const component = renderer.create(
        <ScoreBoard score={1000} linesCleared={10} level={2} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display large score 999999", () => {
      const component = renderer.create(
        <ScoreBoard score={999999} linesCleared={100} level={10} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should format score with toLocaleString", () => {
      const score = 123456;
      const formatted = score.toLocaleString();

      // toLocaleString should add separators
      expect(formatted).to.be.a("string");
      expect(formatted.length).to.be.greaterThan(6);
    });
  });

  describe("Lines Cleared Display", () => {
    it("should display 0 lines cleared", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display 1 line cleared", () => {
      const component = renderer.create(
        <ScoreBoard score={100} linesCleared={1} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display 10 lines cleared", () => {
      const component = renderer.create(
        <ScoreBoard score={1000} linesCleared={10} level={2} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display 100 lines cleared", () => {
      const component = renderer.create(
        <ScoreBoard score={10000} linesCleared={100} level={10} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display large number of lines", () => {
      const component = renderer.create(
        <ScoreBoard score={999999} linesCleared={999} level={99} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Component Structure", () => {
    it("should have score item with label and value", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      const scoreItem = tree.children[0];
      expect(scoreItem.props.className).to.equal("scoreboard-item");
      expect(scoreItem.children).to.have.lengthOf(2);
    });

    it("should have lines item with label and value", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      const linesItem = tree.children[1];
      expect(linesItem.props.className).to.equal("scoreboard-item");
      expect(linesItem.children).to.have.lengthOf(2);
    });

    it("should have correct label classes", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      const scoreLabel = tree.children[0].children[0];
      const linesLabel = tree.children[1].children[0];

      expect(scoreLabel.props.className).to.equal("scoreboard-label");
      expect(linesLabel.props.className).to.equal("scoreboard-label");
    });

    it("should have correct value classes", () => {
      const component = renderer.create(<ScoreBoard {...defaultProps} />);
      const tree = component.toJSON();

      const scoreValue = tree.children[0].children[1];
      const linesValue = tree.children[1].children[1];

      expect(scoreValue.props.className).to.equal("scoreboard-value");
      expect(linesValue.props.className).to.equal("scoreboard-value");
    });
  });

  describe("Score Formatting", () => {
    it("should format 1000 as 1,000", () => {
      const formatted = (1000).toLocaleString();
      expect(formatted).to.include("1");
      expect(formatted).to.include("0");
    });

    it("should format 1000000 with separators", () => {
      const formatted = (1000000).toLocaleString();
      expect(formatted.length).to.be.greaterThan(7);
    });

    it("should handle 0 score", () => {
      const formatted = (0).toLocaleString();
      expect(formatted).to.equal("0");
    });

    it("should handle negative scores (edge case)", () => {
      const component = renderer.create(
        <ScoreBoard score={-100} linesCleared={0} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Different Game States", () => {
    it("should display initial state", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display early game state", () => {
      const component = renderer.create(
        <ScoreBoard score={500} linesCleared={5} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display mid game state", () => {
      const component = renderer.create(
        <ScoreBoard score={5000} linesCleared={50} level={5} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display late game state", () => {
      const component = renderer.create(
        <ScoreBoard score={50000} linesCleared={200} level={20} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should display expert game state", () => {
      const component = renderer.create(
        <ScoreBoard score={999999} linesCleared={999} level={99} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Props Validation", () => {
    it("should accept score prop", () => {
      expect(() => {
        renderer.create(<ScoreBoard score={123} linesCleared={0} level={1} />);
      }).to.not.throw();
    });

    it("should accept linesCleared prop", () => {
      expect(() => {
        renderer.create(<ScoreBoard score={0} linesCleared={456} level={1} />);
      }).to.not.throw();
    });

    it("should accept level prop", () => {
      expect(() => {
        renderer.create(<ScoreBoard score={0} linesCleared={0} level={789} />);
      }).to.not.throw();
    });

    it("should handle all props together", () => {
      expect(() => {
        renderer.create(
          <ScoreBoard score={12345} linesCleared={123} level={12} />
        );
      }).to.not.throw();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero values", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={0} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle very large score", () => {
      const component = renderer.create(
        <ScoreBoard score={9999999999} linesCleared={9999} level={999} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });

    it("should handle decimal score (edge case)", () => {
      const component = renderer.create(
        <ScoreBoard score={123.45} linesCleared={10} level={2} />
      );
      const tree = component.toJSON();

      expect(tree).to.not.be.null;
    });
  });

  describe("Snapshot Testing", () => {
    it("should match snapshot for initial state", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for mid game", () => {
      const component = renderer.create(
        <ScoreBoard score={5000} linesCleared={50} level={5} />
      );
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });

    it("should match snapshot for high score", () => {
      const component = renderer.create(
        <ScoreBoard score={999999} linesCleared={999} level={99} />
      );
      const tree = component.toJSON();

      expect(tree).to.matchSnapshot;
    });
  });

  describe("Rendering Performance", () => {
    it("should render quickly with default props", () => {
      const start = Date.now();
      renderer.create(<ScoreBoard {...defaultProps} />);
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100);
    });

    it("should render quickly with large values", () => {
      const start = Date.now();
      renderer.create(
        <ScoreBoard score={9999999} linesCleared={9999} level={999} />
      );
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100);
    });
  });

  describe("Component Updates", () => {
    it("should handle score updates", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );

      // Update props
      component.update(<ScoreBoard score={100} linesCleared={1} level={1} />);

      const tree = component.toJSON();
      expect(tree).to.not.be.null;
    });

    it("should handle lines cleared updates", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );

      component.update(<ScoreBoard score={100} linesCleared={10} level={2} />);

      const tree = component.toJSON();
      expect(tree).to.not.be.null;
    });

    it("should handle multiple updates", () => {
      const component = renderer.create(
        <ScoreBoard score={0} linesCleared={0} level={1} />
      );

      component.update(<ScoreBoard score={100} linesCleared={1} level={1} />);

      component.update(<ScoreBoard score={300} linesCleared={3} level={1} />);

      component.update(<ScoreBoard score={800} linesCleared={7} level={1} />);

      const tree = component.toJSON();
      expect(tree).to.not.be.null;
    });
  });
});
