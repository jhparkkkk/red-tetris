import { useState } from "react";
import { TETRIMINOS } from "./tetriminos";

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    shape: TETRIMINOS.T.shape,
    color: TETRIMINOS.T.color,
    position: { x: 3, y: 0 },
  });

  const move = (dx, dy) => {
    setPlayer((prev) => ({
      ...prev,
      position: {
        x: prev.position.x + dx,
        y: prev.position.y + dy,
      },
    }));
  };

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

  return { player, move, rotatePiece, resetPlayer };
};
