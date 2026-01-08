import { ROWS, COLS } from "../components/GameBoard";

export const createEmptyGrid = () =>
  Array.from({ length: 24 }, () =>
    Array.from({ length: 10 }, () => ({ filled: false, color: "black" }))
  );

export const mergePieceWithGrid = (grid, piece) => {
  //   console.log("[mergePieceWithGrid] - grid:", grid);
  const newGrid = grid.map((row) => [...row]);

  //   console.log("fusion", piece);

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;

      const posY = piece.position.y + y;
      const posX = piece.position.x + x;

      const isValid =
        posY >= 0 &&
        posY < newGrid.length &&
        posX >= 0 &&
        posX < newGrid[0].length;

      if (isValid) {
        newGrid[posY][posX] = {
          filled: true,
          color: piece.color,
        };
      } else {
        console.warn("❌ Ignored cell at", posY, posX);
        return newGrid;
      }
    });
  });

  return newGrid;
};

export const checkCollision = (grid, shape, position) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newY = position.y + y;
        const newX = position.x + x;
        console.log("Checking collision at (%d, %d)", newY, newX);
        if (
          newY >= 24 || // bas
          newX < 0 ||
          newX >= 10 || // bords
          (grid[newY] && grid[newY][newX] && grid[newY][newX].filled)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const _clearFullRows = (pile) => {
  const newPile = pile.filter((row) => row.some((cell) => !cell.filled));
  const clearedLines = pile.length - newPile.length;

  while (newPile.length < pile.length) {
    newPile.unshift(
      Array.from({ length: pile[0].length }, () => ({
        filled: false,
        color: null,
      }))
    );
  }

  return { newPile, clearedLines };
};

export function clearFullRows(grid) {
  const newGrid = grid.filter((row) => {
    const hasIndestructible = row.some((cell) => cell.indestructible);
    const isFull = row.every((cell) => cell.filled);
    return hasIndestructible || !isFull;
  });

  const clearedLines = grid.length - newGrid.length;

  const emptyRow = () =>
    Array.from({ length: grid[0].length }, () => ({
      filled: false,
      color: "red",
      indestructible: false,
    }));

  const newPile = Array.from({ length: clearedLines }, emptyRow).concat(
    newGrid
  );

  return { newPile, clearedLines };
}

export function reachedTop(pile) {
  console.log("Checking if reached top");

  // Vérifier les lignes 0-4 pour détecter game over
  // Ceci permet un spawn à y: 4 tout en détectant le game over
  for (let row = 0; row <= 4; row++) {
    for (let col = 0; col < 10; col++) {
      if (pile[row] && pile[row][col] && pile[row][col].filled) {
        console.log(`Reached top at row ${row}, column ${col}`);
        return true;
      }
    }
  }

  console.log("Did not reach top");
  return false;
}

/**
 * Calcule la position Y où la pièce va atterrir (pour la ghost piece)
 */
export function calculateGhostPosition(pile, shape, position) {
  if (!shape || shape.length === 0 || !position) {
    return position ? position.y : 0;
  }

  let ghostY = position.y;
  let iterations = 0;
  const maxIterations = 25; // Protection contre boucle infinie

  // Descendre jusqu'à trouver une collision
  while (iterations < maxIterations && ghostY < 23) {
    if (checkCollision(pile, shape, { x: position.x, y: ghostY + 1 })) {
      break;
    }
    ghostY++;
    iterations++;
  }

  return ghostY;
}

/**
 * Merge la ghost piece avec la grille (après avoir mergé la pièce actuelle)
 */
export const mergeGhostPieceWithGrid = (grid, piece, ghostY) => {
  const newGrid = grid.map((row) => [...row]);

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;

      const posY = ghostY + y;
      const posX = piece.position.x + x;

      const isValid =
        posY >= 0 &&
        posY < newGrid.length &&
        posX >= 0 &&
        posX < newGrid[0].length;

      // Ne pas afficher la ghost piece si elle chevauche la pièce actuelle
      if (isValid && !newGrid[posY][posX].filled) {
        newGrid[posY][posX] = {
          filled: true,
          color: piece.color,
          isGhost: true,
        };
      }
    });
  });

  return newGrid;
};
