import { useState } from "react";
import { TETRIMINOS } from "./tetriminos";
import { checkCollision } from "./utils";

export const usePlayer = (pile) => {
  const [player, setPlayer] = useState({
    shape: TETRIMINOS.T.shape,
    color: TETRIMINOS.T.color,
    position: { x: 3, y: 0 },
  });

  const rotate = (matrix) =>
    matrix[0].map((_, i) => matrix.map((row) => row[i])).reverse();

  const rotatePiece = (pile, player, setPlayer) => {
    const rotatedShape = rotate(player.shape);
    const originalPos = player.position;

    const offsets = [0, -1, 1, -2, 2];

    for (let offset of offsets) {
      const newPos = { x: originalPos.x + offset, y: originalPos.y };

      if (!checkCollision(pile, rotatedShape, newPos)) {
        setPlayer((prev) => ({
          ...prev,
          shape: rotatedShape,
          position: newPos,
        }));
        return;
      }
    }
  };

  const resetPlayer = (newPlayer) => {
    setPlayer(newPlayer);
  };

  return { player, setPlayer, rotatePiece, resetPlayer };
};
