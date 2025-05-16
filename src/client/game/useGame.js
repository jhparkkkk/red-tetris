import { useEffect, useState } from "react";
import { createEmptyGrid, checkCollision, mergePieceWithGrid } from "./utils";
import { randomTetrimino } from "./tetriminos";

export const useGame = (player, resetPlayer) => {
  const initialGrid = mergePieceWithGrid(createEmptyGrid(), player);
  console.log(player);
  console.log(initialGrid);
  const [grid, setGrid] = useState(initialGrid);
  const [pile, setPile] = useState(createEmptyGrid());

  useEffect(() => {
    const updatedGrid = mergePieceWithGrid(createEmptyGrid(), player);
    setGrid(updatedGrid);
  }, [pile, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextPos = { ...player.position, y: player.position.y + 1 };

      if (!checkCollision(pile, player.shape, nextPos)) {
        console.log(resetPlayer);
        resetPlayer({ ...player, position: nextPos });
      } else {
        const newPile = mergePieceWithGrid(pile, player);
        setPile(newPile);

        resetPlayer({
          shape: randomTetrimino().shape,
          color: randomTetrimino().color,
          position: { x: 3, y: 0 },
        });
      }
    }, 5000000);

    return () => clearInterval(interval);
  }, [player, resetPlayer]);

  console.log(grid);
  return { grid };
};
