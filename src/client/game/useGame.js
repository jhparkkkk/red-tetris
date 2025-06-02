import { useEffect, useState } from "react";
import { createEmptyGrid, checkCollision, mergePieceWithGrid } from "./utils";
import { randomTetrimino } from "./tetriminos";

export const useGame = (player, resetPlayer) => {
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
        const newPile = mergePieceWithGrid(pile, player);
        setPile(newPile);

        // display pile with attached pice
        setGrid(
          mergePieceWithGrid(newPile, {
            shape: [],
            color: null,
            position: { x: 0, y: 0 },
          })
        );

        // to prevent pile rm
        setTimeout(() => {
          resetPlayer({
            shape: randomTetrimino().shape,
            color: randomTetrimino().color,
            position: { x: 3, y: 0 },
          });
        }, 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, resetPlayer]);

  return { grid, pile };
};
