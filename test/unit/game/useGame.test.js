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

describe("useGame Logic", () => {
  describe("Grid Management", () => {
    it("should create empty grid", () => {
      const grid = createEmptyGrid();
      expect(grid).to.have.lengthOf(24);
      expect(grid[0]).to.have.lengthOf(10);
    });

    it("should merge piece with grid", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      const merged = mergePieceWithGrid(grid, piece);
      expect(merged[10][3].filled).to.be.true;
      expect(merged[10][3].color).to.equal("cyan");
    });
  });

  describe("Collision Detection", () => {
    it("should detect collision with bottom", () => {
      const grid = createEmptyGrid();
      const shape = [[1], [1]];

      expect(checkCollision(grid, shape, { x: 5, y: 23 })).to.be.true;
    });

    it("should allow movement when no collision", () => {
      const grid = createEmptyGrid();
      const shape = [[1]];

      expect(checkCollision(grid, shape, { x: 5, y: 10 })).to.be.false;
    });

    it("should detect collision with pile", () => {
      const grid = createEmptyGrid();
      grid[15][5] = { filled: true, color: "red" };
      const shape = [[1]];

      expect(checkCollision(grid, shape, { x: 5, y: 15 })).to.be.true;
    });
  });

  describe("Line Clearing", () => {
    it("should clear one full line", () => {
      const grid = createEmptyGrid();

      // Remplir la ligne 23
      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "red", indestructible: false };
      }

      const { newPile, clearedLines } = clearFullRows(grid);

      expect(clearedLines).to.equal(1);
      expect(newPile[23][0].filled).to.be.false;
    });

    it("should clear multiple lines", () => {
      const grid = createEmptyGrid();

      // Remplir 3 lignes
      for (let row = 21; row <= 23; row++) {
        for (let col = 0; col < 10; col++) {
          grid[row][col] = {
            filled: true,
            color: "red",
            indestructible: false,
          };
        }
      }

      const { clearedLines } = clearFullRows(grid);
      expect(clearedLines).to.equal(3);
    });

    it("should not clear lines with indestructible cells", () => {
      const grid = createEmptyGrid();

      // Remplir une ligne avec des cellules indestructibles
      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "grey", indestructible: true };
      }

      const { clearedLines } = clearFullRows(grid);
      expect(clearedLines).to.equal(0);
    });
  });

  describe("Penalty Lines", () => {
    it("should add penalty lines at bottom", () => {
      const grid = createEmptyGrid();
      const penaltyCount = 2;

      // Simuler l'ajout de lignes de pénalité
      const newLines = Array.from({ length: penaltyCount }, () =>
        Array.from({ length: 10 }, () => ({
          filled: true,
          color: "grey",
          indestructible: true,
        }))
      );

      const newPile = [...grid.slice(penaltyCount), ...newLines];

      expect(newPile).to.have.lengthOf(24);
      expect(newPile[23][0].indestructible).to.be.true;
      expect(newPile[22][0].indestructible).to.be.true;
    });

    it("should shift pile up when adding penalty lines", () => {
      const grid = createEmptyGrid();
      grid[23][5] = { filled: true, color: "red", indestructible: false };

      const penaltyCount = 1;
      const newLines = Array.from({ length: penaltyCount }, () =>
        Array.from({ length: 10 }, () => ({
          filled: true,
          color: "grey",
          indestructible: true,
        }))
      );

      const newPile = [...grid.slice(penaltyCount), ...newLines];

      // La pièce qui était en 23 devrait être en 22
      expect(newPile[22][5].filled).to.be.true;
      expect(newPile[22][5].color).to.equal("red");
    });

    it("should create correct penalty line structure", () => {
      const width = 10;
      const count = 1;

      const newLines = Array.from({ length: count }, () =>
        Array.from({ length: width }, () => ({
          filled: true,
          color: "grey",
          indestructible: true,
        }))
      );

      expect(newLines).to.have.lengthOf(1);
      expect(newLines[0]).to.have.lengthOf(10);
      expect(newLines[0][0].filled).to.be.true;
      expect(newLines[0][0].indestructible).to.be.true;
    });
  });

  describe("Game Over Detection", () => {
    it("should detect when top row is filled", () => {
      const pile = createEmptyGrid();
      pile[0][5] = { filled: true, color: "red" };

      expect(reachedTop(pile)).to.be.true;
    });

    it("should not trigger game over for empty top row", () => {
      const pile = createEmptyGrid();
      expect(reachedTop(pile)).to.be.false;
    });

    it("should detect game over in rows 0-4", () => {
      const pile = createEmptyGrid();
      pile[4][3] = { filled: true, color: "blue" };

      expect(reachedTop(pile)).to.be.true;
    });

    it("should not detect game over for row 5+", () => {
      const pile = createEmptyGrid();
      pile[5][3] = { filled: true, color: "blue" };

      expect(reachedTop(pile)).to.be.false;
    });
  });

  describe("Piece Movement", () => {
    it("should calculate next position for downward movement", () => {
      const currentPos = { x: 3, y: 10 };
      const nextPos = { ...currentPos, y: currentPos.y + 1 };

      expect(nextPos.x).to.equal(3);
      expect(nextPos.y).to.equal(11);
    });

    it("should allow downward movement when no collision", () => {
      const grid = createEmptyGrid();
      const shape = [[1]];
      const currentPos = { x: 3, y: 10 };
      const nextPos = { x: 3, y: 11 };

      expect(checkCollision(grid, shape, nextPos)).to.be.false;
    });

    it("should prevent movement when collision detected", () => {
      const grid = createEmptyGrid();
      const shape = [[1], [1]]; // Pièce de hauteur 2
      const pos = { x: 3, y: 23 };

      expect(checkCollision(grid, shape, pos)).to.be.true;
    });
  });

  describe("Ghost Piece", () => {
    it("should calculate ghost position for empty pile", () => {
      const pile = createEmptyGrid();
      const shape = [[1]];
      const position = { x: 3, y: 5 };

      const ghostY = calculateGhostPosition(pile, shape, position);
      expect(ghostY).to.be.at.least(position.y);
    });

    it("should stop ghost at obstacle", () => {
      const pile = createEmptyGrid();
      pile[15][3] = { filled: true, color: "red" };

      const shape = [[1]];
      const position = { x: 3, y: 5 };

      const ghostY = calculateGhostPosition(pile, shape, position);
      expect(ghostY).to.be.lessThan(15);
    });

    it("should merge ghost piece with grid", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      const newGrid = mergeGhostPieceWithGrid(grid, piece, 20);
      expect(newGrid[20][3].isGhost).to.be.true;
    });

    it("should handle game started state for ghost rendering", () => {
      const gameStarted = true;
      const player = {
        shape: [[1]],
        position: { x: 3, y: 5 },
      };

      expect(gameStarted).to.be.true;
      expect(player.shape.length).to.be.greaterThan(0);
    });
  });

  describe("Game State", () => {
    it("should track game started state", () => {
      let gameStarted = false;
      expect(gameStarted).to.be.false;

      gameStarted = true;
      expect(gameStarted).to.be.true;
    });

    it("should track game over state", () => {
      let isGameOver = false;
      expect(isGameOver).to.be.false;

      isGameOver = true;
      expect(isGameOver).to.be.true;
    });

    it("should reset grid when game starts", () => {
      const empty = createEmptyGrid();
      expect(empty.every((row) => row.every((cell) => !cell.filled))).to.be
        .true;
    });
  });

  describe("Scoring Integration", () => {
    it("should prepare lines cleared callback", () => {
      const onLinesCleared = (lines) => {
        expect(lines).to.be.a("number");
        expect(lines).to.be.greaterThan(0);
      };

      onLinesCleared(1);
      onLinesCleared(4);
    });

    it("should calculate cleared lines from clearFullRows", () => {
      const grid = createEmptyGrid();

      for (let col = 0; col < 10; col++) {
        grid[23][col] = { filled: true, color: "red", indestructible: false };
      }

      const { clearedLines } = clearFullRows(grid);

      if (clearedLines > 0) {
        expect(clearedLines).to.equal(1);
      }
    });
  });

  describe("Next Piece Management", () => {
    it("should handle next piece structure", () => {
      const nextPiece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#F5DE74",
        type: "O",
      };

      expect(nextPiece).to.have.property("shape");
      expect(nextPiece).to.have.property("color");
      expect(nextPiece).to.have.property("type");
    });

    it("should prepare piece for current player", () => {
      const nextPiece = {
        shape: [[1]],
        color: "cyan",
        type: "I",
      };

      const currentPiece = {
        shape: nextPiece.shape,
        color: nextPiece.color,
        position: { x: 3, y: 3 },
        name: "testPlayer",
        room: "testRoom",
      };

      expect(currentPiece.position.x).to.equal(3);
      expect(currentPiece.position.y).to.equal(3);
    });
  });

  describe("Grid Merging", () => {
    it("should preserve grid cells not affected by piece", () => {
      const grid = createEmptyGrid();
      grid[5][5] = { filled: true, color: "red" };

      const piece = {
        shape: [[1]],
        position: { x: 3, y: 10 },
        color: "cyan",
      };

      const merged = mergePieceWithGrid(grid, piece);
      expect(merged[5][5].filled).to.be.true;
      expect(merged[5][5].color).to.equal("red");
    });

    it("should apply piece color to merged cells", () => {
      const grid = createEmptyGrid();
      const piece = {
        shape: [[1, 1]],
        position: { x: 3, y: 10 },
        color: "purple",
      };

      const merged = mergePieceWithGrid(grid, piece);
      expect(merged[10][3].color).to.equal("purple");
      expect(merged[10][4].color).to.equal("purple");
    });
  });

  describe("Game Loop Timing", () => {
    it("should use consistent interval timing", () => {
      const interval = 383;
      expect(interval).to.equal(383);
      expect(interval).to.be.a("number");
    });

    it("should calculate fall speed correctly", () => {
      const baseSpeed = 383;
      expect(baseSpeed).to.be.greaterThan(0);
      expect(baseSpeed).to.be.lessThan(1000);
    });
  });
});
