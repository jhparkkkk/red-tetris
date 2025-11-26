import { useState } from "react";

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    shape: [],
    color: null,
    position: { x: 3, y: 2 }, // en dehors du haut du plateau
    name: null,
    room: null,
  });

  const resetPlayer = (newPlayer) => {
    setPlayer(newPlayer);
  };

  return { player, setPlayer, resetPlayer };
};
