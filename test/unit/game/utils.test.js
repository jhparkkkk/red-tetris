import { expect } from "chai";
import {
  createEmptyGrid,
  checkCollision,
  mergePieceWithGrid,
  clearFullRows,
  _clearFullRows,
  reachedTop,
  calculateGhostPosition,
  mergeGhostPieceWithGrid,
} from "../../../src/client/game/utils";

describe("Game Utils - Complete Coverage", () => {
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

    it("should have black color by default", () => {
      const grid = createEmptyGrid();
      expect(grid[0][0].color).to.equal("black");
    });

    it("should create independent rows", () => {
      const grid = createEmptyGrid();
      grid[0][0].filled = true;
      expect(grid[1][0].filled).to.be.false;
    });
  });

  describe("checkCollision()", () => {
    let grid;

    beforeEach(() => {
      grid = createEmptyGrid();
    });

    it("should detect bottom collision", () => {
      expect(checkCollision(grid, [[1], [1]], { x: 3, y: 23 })).to.be.true;
    });

    it("should detect wall collisions", () => {
      expect(checkCollision(grid, [[1]], { x: -1, y: 10 })).to.be.true;
      expect(checkCollision(grid, [[1]], { x: 10, y: 10 })).to.be.true;
    });

    it("should not collide in empty space", () => {
      expect(checkCollision(grid, [[1]], { x: 5, y: 10 })).to.be.false;
    });

    it("should detect collision with filled cells", () => {
      grid[10][5].filled = true;
      expect(checkCollision(grid, [[1]], { x: 5, y: 10 })).to.be.true;
    });

    it("should handle multi-cell pieces", () => {
      const iShape = [[1, 1, 1, 1]];
      expect(checkCollision(grid, iShape, { x: 3, y: 10 })).to.be.false;
      expect(checkCollision(grid, iShape, { x: 7, y: 10 })).to.be.true; // Would go out of bounds
    });

    it("should handle complex shapes", () => {
      const tShape = [
        [0, 1, 0],
        [1, 1, 1],
      ];
      expect(checkCollision(grid, tShape, { x: 3, y: 10 })).to.be.false;
    });

    it("should detect collision at exact bottom", () => {
      expect(checkCollision(grid, [[1]], { x: 5, y: 24 })).to.be.true;
    });

    it("should detect left wall collision", () => {
      expect(checkCollision(grid, [[1, 1]], { x: -1, y: 10 })).to.be.true;
    });

    it("should detect right wall collision", () => {
      expect(checkCollision(grid, [[1, 1]], { x: 9, y: 10 })).to.be.true;
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

    it("should preserve piece color", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 10 },
        color: "red",
      };

      const newGrid = mergePieceWithGrid(grid, piece);
      expect(newGrid[10][3].color).to.equal("red");
    });

    it("should merge multi-cell piece", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1, 1, 1, 1]],
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      const newGrid = mergePieceWithGrid(grid, piece);
      expect(newGrid[10][3].filled).to.be.true;
      expect(newGrid[10][4].filled).to.be.true;
      expect(newGrid[10][5].filled).to.be.true;
      expect(newGrid[10][6].filled).to.be.true;
    });

    it("should handle shapes with zeros", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        position: { x: 3, y: 10 },
        color: "purple",
      };

      const newGrid = mergePieceWithGrid(grid, piece);
      expect(newGrid[10][3].filled).to.be.false; // 0 in shape
      expect(newGrid[10][4].filled).to.be.true; // 1 in shape
    });

    it("should not modify original grid", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      mergePieceWithGrid(grid, piece);
      expect(grid[10][3].filled).to.be.false;
    });

    it("should handle out of bounds gracefully", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: -1, y: 10 },
        color: "cyan",
      };

      const newGrid = mergePieceWithGrid(grid, piece);
      expect(newGrid).to.exist;
    });
  });

  describe("_clearFullRows()", () => {
    it("should clear full rows", () => {
      const pile = createEmptyGrid();
      for (let col = 0; col < 10; col++) {
        pile[23][col] = { filled: true, color: "red" };
      }

      const { newPile, clearedLines } = _clearFullRows(pile);
      expect(clearedLines).to.equal(1);
      expect(newPile).to.have.lengthOf(24);
    });

    it("should not clear partial rows", () => {
      const pile = createEmptyGrid();
      for (let col = 0; col < 9; col++) {
        pile[23][col] = { filled: true, color: "red" };
      }

      const { clearedLines } = _clearFullRows(pile);
      expect(clearedLines).to.equal(0);
    });

    it("should clear multiple rows", () => {
      const pile = createEmptyGrid();
      for (let row = 22; row < 24; row++) {
        for (let col = 0; col < 10; col++) {
          pile[row][col] = { filled: true, color: "red" };
        }
      }

      const { clearedLines } = _clearFullRows(pile);
      expect(clearedLines).to.equal(2);
    });

    it("should add empty rows at top", () => {
      const pile = createEmptyGrid();
      for (let col = 0; col < 10; col++) {
        pile[23][col] = { filled: true, color: "red" };
      }

      const { newPile } = _clearFullRows(pile);
      expect(newPile[0][0].filled).to.be.false;
    });

    it("should handle empty pile", () => {
      const pile = createEmptyGrid();
      const { clearedLines } = _clearFullRows(pile);
      expect(clearedLines).to.equal(0);
    });

    it("should preserve non-full rows", () => {
      const pile = createEmptyGrid();
      pile[20][5] = { filled: true, color: "cyan" };
      for (let col = 0; col < 10; col++) {
        pile[23][col] = { filled: true, color: "red" };
      }

      const { newPile } = _clearFullRows(pile);
      expect(newPile[21][5].filled).to.be.true; // Shifted up
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

    it("should not clear rows with indestructible cells", () => {
      const grid = createEmptyGrid();
      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "red", indestructible: false };
      }
      grid[23][5].indestructible = true;

      const { clearedLines } = clearFullRows(grid);
      expect(clearedLines).to.equal(0);
    });

    it("should clear multiple rows", () => {
      const grid = createEmptyGrid();
      for (let row = 22; row < 24; row++) {
        for (let col = 0; col < 10; col++) {
          grid[row][col] = {
            filled: true,
            color: "red",
            indestructible: false,
          };
        }
      }

      const { clearedLines } = clearFullRows(grid);
      expect(clearedLines).to.equal(2);
    });

    it("should add empty rows at top", () => {
      const grid = createEmptyGrid();
      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "red", indestructible: false };
      }

      const { newPile } = clearFullRows(grid);
      expect(newPile[0][0].filled).to.be.false;
      expect(newPile[0][0].indestructible).to.be.false;
    });
  });

  describe("reachedTop()", () => {
    it("should detect top reached", () => {
      const pile = createEmptyGrid();
      pile[0][5] = { filled: true, color: "red" };
      expect(reachedTop(pile)).to.be.true;
    });

    it("should detect top reached in spawn zone", () => {
      const pile = createEmptyGrid();
      pile[4][3] = { filled: true, color: "cyan" };
      expect(reachedTop(pile)).to.be.true;
    });

    it("should not detect when below spawn zone", () => {
      const pile = createEmptyGrid();
      pile[5][5] = { filled: true, color: "red" };
      expect(reachedTop(pile)).to.be.false;
    });

    it("should check all columns", () => {
      const pile = createEmptyGrid();
      pile[2][9] = { filled: true, color: "red" };
      expect(reachedTop(pile)).to.be.true;
    });

    it("should return false for empty pile", () => {
      const pile = createEmptyGrid();
      expect(reachedTop(pile)).to.be.false;
    });
  });

  describe("calculateGhostPosition()", () => {
    it("should calculate ghost position", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1]], { x: 3, y: 5 });
      expect(ghostY).to.equal(23);
    });

    it("should stop at pile surface", () => {
      const pile = createEmptyGrid();
      pile[20][3] = { filled: true, color: "red" };

      const ghostY = calculateGhostPosition(pile, [[1]], { x: 3, y: 5 });
      expect(ghostY).to.equal(19);
    });

    it("should handle piece already at bottom", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1]], { x: 3, y: 23 });
      expect(ghostY).to.equal(23);
    });

    it("should handle multi-cell pieces", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1, 1, 1, 1]], {
        x: 3,
        y: 5,
      });
      expect(ghostY).to.be.at.least(5);
    });

    it("should handle null shape", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, null, { x: 3, y: 5 });
      expect(ghostY).to.equal(5);
    });

    it("should handle empty shape", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [], { x: 3, y: 5 });
      expect(ghostY).to.equal(5);
    });

    it("should handle null position", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1]], null);
      expect(ghostY).to.equal(0);
    });

    it("should not exceed maxIterations", () => {
      const pile = createEmptyGrid();
      const ghostY = calculateGhostPosition(pile, [[1]], { x: 3, y: 0 });
      expect(ghostY).to.be.at.most(25);
    });
  });

  describe("mergeGhostPieceWithGrid()", () => {
    it("should merge ghost piece", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      const newGrid = mergeGhostPieceWithGrid(grid, piece, 20);
      expect(newGrid[20][3].filled).to.be.true;
      expect(newGrid[20][3].isGhost).to.be.true;
    });

    it("should not overwrite filled cells", () => {
      const grid = createEmptyGrid();
      grid[20][3] = { filled: true, color: "red" };

      const piece = {
        shape: [[1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      const newGrid = mergeGhostPieceWithGrid(grid, piece, 20);
      expect(newGrid[20][3].color).to.equal("red");
      expect(newGrid[20][3].isGhost).to.be.undefined;
    });

    it("should handle multi-cell pieces", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1, 1, 1, 1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      const newGrid = mergeGhostPieceWithGrid(grid, piece, 20);
      expect(newGrid[20][3].isGhost).to.be.true;
      expect(newGrid[20][4].isGhost).to.be.true;
      expect(newGrid[20][5].isGhost).to.be.true;
      expect(newGrid[20][6].isGhost).to.be.true;
    });

    it("should handle shapes with zeros", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        position: { x: 3, y: 5 },
        color: "purple",
      };

      const newGrid = mergeGhostPieceWithGrid(grid, piece, 20);
      expect(newGrid[20][3].filled).to.be.false;
      expect(newGrid[20][4].isGhost).to.be.true;
    });

    it("should not modify original grid", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      mergeGhostPieceWithGrid(grid, piece, 20);
      expect(grid[20][3].filled).to.be.false;
    });
  });
});
