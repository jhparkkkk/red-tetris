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

  const rotatePiece = () => {
    setPlayer((prev) => ({
      ...prev,
      shape: rotate(prev.shape),
    }));
  };

  const resetPlayer = (newPlayer) => {
    setPlayer(newPlayer);
  };

  return { player, setPlayer, rotatePiece, resetPlayer };
};
