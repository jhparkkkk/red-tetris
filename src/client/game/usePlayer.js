import { useState } from "react";
import { TETRIMINOS } from "./tetriminos";
import { checkCollision } from "./utils";

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    shape: TETRIMINOS.T.shape,
    color: TETRIMINOS.T.color,
    position: { x: 3, y: 0 },
  });

  const resetPlayer = (newPlayer) => {
    setPlayer(newPlayer);
  };

  return { player, setPlayer, resetPlayer };
};
