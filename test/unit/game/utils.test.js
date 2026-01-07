import { expect } from "chai";
import {
  createEmptyGrid,
  checkCollision,
  mergePieceWithGrid,
  clearFullRows,
  reachedTop,
  calculateGhostPosition,
  mergeGhostPieceWithGrid,
} from "../../../src/client/game/utils";

describe("Game Utils", () => {
  describe("createEmptyGrid()", () => {
    it("should create a 24x10 empty grid", () => {
      const grid = createEmptyGrid();
      expect(grid).to.have.lengthOf(24);
      expect(grid[0]).to.have.lengthOf(10);
    });

    it("should have all cells unfilled", () => {
      const grid = createEmptyGrid();
      expect(grid[0][0].filled).to.be.false;
    });
  });

  describe("checkCollision()", () => {
    let grid;

    beforeEach(() => {
      grid = createEmptyGrid();
    });

    it("should detect bottom collision", () => {
      // Avec une pièce de hauteur 2, position y:23 devrait collisionner
      expect(checkCollision(grid, [[1], [1]], { x: 3, y: 23 })).to.be.true;
    });

    it("should detect wall collisions", () => {
      expect(checkCollision(grid, [[1]], { x: -1, y: 10 })).to.be.true;
      expect(checkCollision(grid, [[1]], { x: 10, y: 10 })).to.be.true;
    });
  });

  describe("mergePieceWithGrid()", () => {
    it("should merge piece", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      const newGrid = mergePieceWithGrid(grid, piece);
      expect(newGrid[10][3].filled).to.be.true;
    });
  });

  describe("clearFullRows()", () => {
    it("should clear full rows", () => {
      const grid = createEmptyGrid();
      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "red", indestructible: false };
      }

      const { clearedLines } = clearFullRows(grid);
      expect(clearedLines).to.equal(1);
    });
  });

  describe("reachedTop()", () => {
    it("should detect top reached", () => {
      const pile = createEmptyGrid();
      pile[0][5] = { filled: true, color: "red" };
      expect(reachedTop(pile)).to.be.true;
    });
  });

  describe("calculateGhostPosition()", () => {
    it("should calculate ghost position", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1]], { x: 3, y: 5 });
      expect(ghostY).to.be.at.least(5);
    });
  });
});
