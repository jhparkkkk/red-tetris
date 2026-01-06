import { useState } from "react";

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    shape: [],
    color: null,
    position: { x: 3, y: 4 }, // Démarrer en haut (zone invisible)
    name: null,
    room: null,
  });

  // 🎯 State pour stocker la prochaine pièce à venir
  const [nextPiece, setNextPiece] = useState(null);

  const resetPlayer = (newPlayer) => {
    setPlayer(newPlayer);
  };

  return { player, setPlayer, resetPlayer, nextPiece, setNextPiece };
};
