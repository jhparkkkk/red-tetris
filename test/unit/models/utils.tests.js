import chai from "chai";

chai.should();

const {
  createEmptyGrid,
  mergePieceWithGrid,
  checkCollision,
  clearFullRows,
  _clearFullRows,
  reachedTop,
} = require("../../../src/client/game/utils");

describe("Game Utils", () => {
  describe("createEmptyGrid", () => {
    it("should create a grid with correct dimensions", () => {
      const grid = createEmptyGrid();

      grid.should.be.an("array");
      grid.should.have.lengthOf(24); // ROWS
      grid[0].should.have.lengthOf(10); // COLS
    });

    it("should create empty cells", () => {
      const grid = createEmptyGrid();

      grid.forEach((row) => {
        row.forEach((cell) => {
          cell.should.have.property("filled", false);
          cell.should.have.property("color", "black");
        });
      });
    });

    it("should create independent rows", () => {
      const grid = createEmptyGrid();

      // Modifier une cellule
      grid[0][0].filled = true;

      // Les autres lignes ne doivent pas être affectées
      grid[1][0].filled.should.be.false;
    });
  });

  describe("mergePieceWithGrid", () => {
    let grid;

    beforeEach(() => {
      grid = createEmptyGrid();
    });

    it("should merge a piece with the grid", () => {
      const piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        position: { x: 4, y: 0 },
        color: "yellow",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      newGrid[0][4].filled.should.be.true;
      newGrid[0][4].color.should.equal("yellow");
      newGrid[0][5].filled.should.be.true;
      newGrid[1][4].filled.should.be.true;
      newGrid[1][5].filled.should.be.true;
    });

    it("should not modify the original grid", () => {
      const piece = {
        shape: [[1]],
        position: { x: 0, y: 0 },
        color: "red",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      grid[0][0].filled.should.be.false;
      newGrid[0][0].filled.should.be.true;
    });

    it("should handle I piece (4x1)", () => {
      const piece = {
        shape: [[1, 1, 1, 1]],
        position: { x: 3, y: 5 },
        color: "cyan",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      newGrid[5][3].filled.should.be.true;
      newGrid[5][4].filled.should.be.true;
      newGrid[5][5].filled.should.be.true;
      newGrid[5][6].filled.should.be.true;
      newGrid[5][3].color.should.equal("cyan");
    });

    it("should handle T piece", () => {
      const piece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        position: { x: 4, y: 10 },
        color: "purple",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      // Top middle
      newGrid[10][5].filled.should.be.true;
      // Bottom row
      newGrid[11][4].filled.should.be.true;
      newGrid[11][5].filled.should.be.true;
      newGrid[11][6].filled.should.be.true;
      // Top corners should be empty
      newGrid[10][4].filled.should.be.false;
      newGrid[10][6].filled.should.be.false;
    });

    it("should skip cells with value 0 in shape", () => {
      const piece = {
        shape: [
          [1, 0, 1],
          [0, 1, 0],
        ],
        position: { x: 2, y: 2 },
        color: "green",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      newGrid[2][2].filled.should.be.true;
      newGrid[2][3].filled.should.be.false; // 0 in shape
      newGrid[2][4].filled.should.be.true;
      newGrid[3][2].filled.should.be.false; // 0 in shape
      newGrid[3][3].filled.should.be.true;
    });

    it("should handle pieces at different positions", () => {
      const piece = {
        shape: [[1, 1]],
        position: { x: 8, y: 20 },
        color: "blue",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      newGrid[20][8].filled.should.be.true;
      newGrid[20][9].filled.should.be.true;
    });

    it("should ignore invalid positions (out of bounds)", () => {
      const piece = {
        shape: [[1, 1, 1]],
        position: { x: 9, y: 0 }, // Déborde à droite
        color: "orange",
      };

      const newGrid = mergePieceWithGrid(grid, piece);

      // Les cellules valides doivent être remplies
      newGrid[0][9].filled.should.be.true;
    });
  });

  describe("checkCollision", () => {
    let grid;

    beforeEach(() => {
      grid = createEmptyGrid();
    });

    it("should detect collision with bottom", () => {
      const shape = [[1]];
      const position = { x: 5, y: 24 }; // En dehors (bas)

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true;
    });

    it("should detect collision with left wall", () => {
      const shape = [[1]];
      const position = { x: -1, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true;
    });

    it("should detect collision with right wall", () => {
      const shape = [[1]];
      const position = { x: 10, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true;
    });

    it("should not detect collision in empty space", () => {
      const shape = [[1]];
      const position = { x: 5, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.false;
    });

    it("should detect collision with filled cells", () => {
      // Remplir une cellule
      grid[10][5].filled = true;

      const shape = [[1]];
      const position = { x: 5, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true;
    });

    it("should handle multi-cell pieces", () => {
      const shape = [
        [1, 1],
        [1, 1],
      ];
      const position = { x: 9, y: 10 }; // Déborde à droite

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true;
    });

    it("should check all cells of piece shape", () => {
      grid[11][6].filled = true; // Bloquer une cellule

      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];
      const position = { x: 5, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.true; // Collision avec grid[11][6]
    });

    it("should ignore 0 values in shape", () => {
      grid[10][4].filled = true;
      grid[10][6].filled = true;

      const shape = [
        [0, 1, 0], // Seulement le centre compte
        [0, 0, 0],
      ];
      const position = { x: 4, y: 10 };

      const collision = checkCollision(grid, shape, position);

      collision.should.be.false; // grid[10][5] est vide
    });

    it("should detect collision at bottom edge", () => {
      const shape = [
        [1, 1, 1, 1], // I piece horizontal
      ];
      const position = { x: 3, y: 23 }; // Dernière ligne valide

      const collision = checkCollision(grid, shape, position);

      collision.should.be.false; // Encore valide

      position.y = 24; // Une ligne trop bas

      const collision2 = checkCollision(grid, shape, position);

      collision2.should.be.true;
    });
  });

  describe("clearFullRows", () => {
    let grid;

    beforeEach(() => {
      grid = createEmptyGrid();
    });

    it("should not clear any rows in empty grid", () => {
      const result = clearFullRows(grid);

      result.clearedLines.should.equal(0);
      result.newPile.should.have.lengthOf(24);
    });

    it("should clear a single full row", () => {
      // Remplir la dernière ligne
      for (let x = 0; x < 10; x++) {
        grid[23][x] = { filled: true, color: "blue", indestructible: false };
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(1);
      result.newPile.should.have.lengthOf(24);

      // La dernière ligne devrait maintenant être vide
      result.newPile[23].every((cell) => !cell.filled).should.be.true;
    });

    it("should clear multiple full rows", () => {
      // Remplir 3 lignes
      for (let y = 21; y < 24; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = { filled: true, color: "red", indestructible: false };
        }
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(3);
      result.newPile.should.have.lengthOf(24);

      // Les 3 dernières lignes devraient être vides
      result.newPile[21].every((cell) => !cell.filled).should.be.true;
      result.newPile[22].every((cell) => !cell.filled).should.be.true;
      result.newPile[23].every((cell) => !cell.filled).should.be.true;
    });

    it("should not clear partially filled rows", () => {
      // Remplir presque toute la ligne (9/10 cellules)
      for (let x = 0; x < 9; x++) {
        grid[23][x] = { filled: true, color: "green", indestructible: false };
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(0);
    });

    it("should preserve non-full rows", () => {
      // Créer un pattern
      grid[22][5] = { filled: true, color: "yellow", indestructible: false };

      // Remplir la ligne 23
      for (let x = 0; x < 10; x++) {
        grid[23][x] = { filled: true, color: "blue", indestructible: false };
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(1);

      // La cellule de la ligne 22 devrait être préservée (maintenant en 23)
      result.newPile[23][5].filled.should.be.true;
      result.newPile[23][5].color.should.equal("yellow");
    });

    it("should not clear rows with indestructible cells", () => {
      // Remplir une ligne avec une cellule indestructible
      for (let x = 0; x < 10; x++) {
        grid[23][x] = {
          filled: true,
          color: "gray",
          indestructible: x === 5, // Cellule du milieu indestructible
        };
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(0); // Ligne non effacée
      result.newPile[23][5].indestructible.should.be.true;
    });

    it("should clear 4 rows (Tetris)", () => {
      // Remplir 4 lignes consécutives
      for (let y = 20; y < 24; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = { filled: true, color: "cyan", indestructible: false };
        }
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(4);

      // Vérifier que les 4 dernières lignes sont vides
      for (let y = 20; y < 24; y++) {
        result.newPile[y].every((cell) => !cell.filled).should.be.true;
      }
    });

    it("should add empty rows at the top", () => {
      // Remplir 2 lignes
      for (let y = 22; y < 24; y++) {
        for (let x = 0; x < 10; x++) {
          grid[y][x] = { filled: true, color: "purple", indestructible: false };
        }
      }

      const result = clearFullRows(grid);

      result.clearedLines.should.equal(2);

      // Les 2 premières lignes doivent être vides (nouvelles)
      result.newPile[0].every((cell) => !cell.filled).should.be.true;
      result.newPile[1].every((cell) => !cell.filled).should.be.true;
    });
  });

  describe("_clearFullRows (legacy)", () => {
    let pile;

    beforeEach(() => {
      pile = createEmptyGrid();
    });

    it("should clear full rows without indestructible logic", () => {
      // Remplir la dernière ligne
      for (let x = 0; x < 10; x++) {
        pile[23][x] = { filled: true, color: "blue" };
      }

      const result = _clearFullRows(pile);

      result.clearedLines.should.equal(1);
      result.newPile.should.have.lengthOf(24);
    });

    it("should handle multiple clears", () => {
      for (let y = 21; y < 24; y++) {
        for (let x = 0; x < 10; x++) {
          pile[y][x] = { filled: true, color: "red" };
        }
      }

      const result = _clearFullRows(pile);

      result.clearedLines.should.equal(3);
    });
  });

  describe("reachedTop", () => {
    let pile;

    beforeEach(() => {
      pile = createEmptyGrid();
    });

    it("should return false for empty grid", () => {
      const reached = reachedTop(pile);

      reached.should.be.false;
    });

    it("should return true when top row has filled cell", () => {
      pile[0][5].filled = true;

      const reached = reachedTop(pile);

      reached.should.be.true;
    });

    it("should check all columns in top row", () => {
      pile[0][0].filled = true;

      const reached = reachedTop(pile);

      reached.should.be.true;
    });

    it("should return true for any filled cell in top row", () => {
      pile[0][9].filled = true; // Dernière colonne

      const reached = reachedTop(pile);

      reached.should.be.true;
    });

    it("should return false if only second row is filled", () => {
      pile[1][5].filled = true;

      const reached = reachedTop(pile);

      reached.should.be.false;
    });

    it("should return true with multiple filled cells in top row", () => {
      pile[0][3].filled = true;
      pile[0][4].filled = true;
      pile[0][5].filled = true;

      const reached = reachedTop(pile);

      reached.should.be.true;
    });
  });
});

/**
 * 📊 COUVERTURE ATTENDUE
 *
 * utils.js devrait passer de 18.18% à 90%+ avec ces tests
 *
 * Fonctions testées:
 * - createEmptyGrid : 3 tests
 * - mergePieceWithGrid : 8 tests
 * - checkCollision : 10 tests
 * - clearFullRows : 9 tests
 * - _clearFullRows : 2 tests
 * - reachedTop : 6 tests
 *
 * Total : 38 tests pour utils.js
 *
 * Installation:
 *
 * cd ~/red-tetris
 * mkdir -p test/unit/game
 * cp /mnt/user-data/outputs/utils.test.js test/unit/game/
 *
 * Mettre à jour test/index.js:
 * import './unit/game/utils.test'
 *
 * Lancer:
 * npm test -- test/unit/game/utils.test.js
 * npm run coverage
 *
 * Résultat attendu:
 * utils.js : 18% → 90%+
 * Total : 28% → 35%+
 */
