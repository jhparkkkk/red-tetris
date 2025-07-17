import { useEffect, useState, useRef } from "react";
import {
  createEmptyGrid,
  checkCollision,
  mergePieceWithGrid,
  clearFullRows,
  reachedTop,
} from "./utils";

import { useSocket } from "../context/SocketContext";
import { TETRIMINOS } from "./tetriminos";
export const useGame = (
  player,
  resetPlayer,
  onGameOver,
  isGameOver,
  gameStarted
) => {
  const socket = useSocket();
  const [grid, setGrid] = useState(() =>
    mergePieceWithGrid(createEmptyGrid(), player)
  );
  const [pile, setPile] = useState(createEmptyGrid());
  const [pieceQueue, setPieceQueue] = useState(() => (player ? [player] : []));

  const playerRef = useRef(player);
  const pileRef = useRef(pile);
  const pieceQueueRef = useRef(pieceQueue);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    pileRef.current = pile;
  }, [pile]);

  useEffect(() => {
    pieceQueueRef.current = pieceQueue;
  }, [pieceQueue]);

  // Met à jour la grille
  useEffect(() => {
    const updatedGrid = mergePieceWithGrid(pile, player);
    setGrid(updatedGrid);
  }, [pile, player]);

  // Réception des pièces du serveur
  // 📦 Définir la fonction UNE SEULE FOIS (en dehors du useEffect)

  const handleNextPiece = ({ piece }) => {
    const type = piece.type;
    const definition = TETRIMINOS[type];

    if (!definition) {
      console.warn("❌ Type de pièce inconnu :", type);
      return;
    }

    const fullPiece = {
      shape: definition.shape,
      color: definition.color,
      position: { x: 3, y: -2 }, // ou celle que tu veux
      name: playerRef.current.name,
      room: playerRef.current.room,
    };

    resetPlayer(fullPiece);

    console.log("📦 Reçu du serveur:", fullPiece);

    setPieceQueue((prev) => {
      const updated = [...prev, fullPiece];
      console.log("📬 File d’attente mise à jour:", updated);
      return updated;
    });
  };

  // 🎧 Réception des pièces du serveur
  useEffect(() => {
    if (!socket) return;
    console.log("🎧 Listening for next-piece events");
    socket.on("next-piece", handleNextPiece);
    return () => {
      socket.off("next-piece", handleNextPiece);
    };
  }, [socket]);
  // Boucle de descente automatique des pièces
  useEffect(() => {
    console.log("current piece is", pieceQueueRef.current);
    if (!gameStarted) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      const pile = pileRef.current;

      const nextPos = { ...player.position, y: player.position.y + 1 };

      if (!checkCollision(pile, player.shape, nextPos)) {
        resetPlayer({ ...player, position: nextPos });
      } else {
        const merged = mergePieceWithGrid(pile, player);
        const { newPile, clearedLines } = clearFullRows(merged);
        setPile(newPile);
        console.log("current piece is", pieceQueueRef.current);

        if (clearedLines > 0) {
          console.log(`🧹 ${clearedLines} ligne(s) supprimée(s)`);
        }

        if (reachedTop(newPile)) {
          if (onGameOver) onGameOver();
          clearInterval(interval);
          return;
        }

        const nextPiece = pieceQueueRef.current[0];

        if (!nextPiece) {
          console.warn("⏳ En attente de la prochaine pièce du serveur");
          return;
        }
        console.log("🔄 Changement de pièce:", nextPiece);
        console.log("Emitting piece-placed event");

        setPieceQueue((prev) => prev.slice(1));
        pieceQueueRef.current = pieceQueueRef.current.slice(1);

        resetPlayer({
          shape: nextPiece.shape,
          color: nextPiece.color,
          position: { x: 3, y: -2 },
          name: player.name,
          room: player.room,
        });

        console.log("🔄 Emitting piece-placed", {
          room: player.room,
          player: player.name,
        });
        socket.emit("piece-placed", {
          room: player.room,
          player: player.name,
        });
      }
    }, 383);

    return () => clearInterval(interval);
  }, [gameStarted]);

  return { grid, pile };
};
