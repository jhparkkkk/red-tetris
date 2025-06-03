import { useEffect, useState } from "react";
import {
  createEmptyGrid,
  checkCollision,
  mergePieceWithGrid,
  clearFullRows,
} from "./utils";
import { randomTetrimino } from "./tetriminos";

export const useGame = (player, resetPlayer, onGameOver) => {
  const initialGrid = mergePieceWithGrid(createEmptyGrid(), player);
  const [grid, setGrid] = useState(initialGrid);
  const [pile, setPile] = useState(createEmptyGrid());

  useEffect(() => {
    const updatedGrid = mergePieceWithGrid(pile, player);
    setGrid(updatedGrid);
  }, [pile, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextPos = { ...player.position, y: player.position.y + 1 };

      if (!checkCollision(pile, player.shape, nextPos)) {
        resetPlayer({ ...player, position: nextPos });
      } else {
        const merged = mergePieceWithGrid(pile, player);
        const { newPile, clearedLines } = clearFullRows(merged);
        setPile(newPile);

        if (clearedLines > 0) {
          console.log(`🧹 ${clearedLines} ligne(s) supprimée(s)`);
        }

        setGrid(
          mergePieceWithGrid(newPile, {
            shape: [],
            color: null,
            position: { x: 0, y: 0 },
          })
        );

        const newPlayer = {
          shape: randomTetrimino().shape,
          color: randomTetrimino().color,
          position: { x: 3, y: 0 },
        };

        if (checkCollision(newPile, newPlayer.shape, newPlayer.position)) {
          if (onGameOver) onGameOver();
          clearInterval(interval);
          return;
        }

        resetPlayer(newPlayer);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [player, resetPlayer, pile, onGameOver]);

  return { grid, pile };
};
