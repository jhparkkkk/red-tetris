import { ROWS, COLS } from "../components/GameBoard";

export const createEmptyGrid = () =>
  Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => ({ filled: false, color: "black" }))
  );

export const mergePieceWithGrid = (grid, piece) => {
  console.log("[mergePieceWithGrid] - grid:", grid);
  const newGrid = grid.map((row) => [...row]);

  console.log("fusion", piece);

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

        if (
          newY >= 20 || // bas
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

export const clearFullRows = (pile) => {
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
