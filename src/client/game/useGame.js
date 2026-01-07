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
  handleGameOver,
  isGameOver,
  gameStarted,
  nextPiece,
  setNextPiece,
  onLinesCleared // ✅ Nouveau callback pour notifier le scoring
) => {
  const socket = useSocket();
  const [grid, setGrid] = useState(() =>
    mergePieceWithGrid(createEmptyGrid(), player)
  );
  const [pile, setPile] = useState(createEmptyGrid());

  const playerRef = useRef(player);
  const pileRef = useRef(pile);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    pileRef.current = pile;
  }, [pile]);

  // Update the grid whenever the pile or player changes
  useEffect(() => {
    const updatedGrid = mergePieceWithGrid(pile, player);
    setGrid(updatedGrid);
  }, [pile, player]);

  const nextPieceRef = useRef(nextPiece);

  useEffect(() => {
    nextPieceRef.current = nextPiece;
  }, [nextPiece]);

  // Receive next-piece events from the server
  useEffect(() => {
    if (!socket) return;

    const handleNextPieceWrapper = ({ piece }) => {
      const definition = TETRIMINOS[piece.type];
      if (!definition) {
        console.error("Received unknown piece type:", piece.type);
        return;
      }

      console.log("📦 Received next-piece from server:", piece.type);

      // Si on a déjà une nextPiece, elle devient la pièce courante
      const currentNextPiece = nextPieceRef.current;
      if (currentNextPiece !== null) {
        console.log(
          "🔄 Moving nextPiece to current player:",
          currentNextPiece.type
        );

        const currentPiece = {
          shape: currentNextPiece.shape,
          color: currentNextPiece.color,
          position: { x: 3, y: 3 }, // Démarrer en haut (zone invisible)
          name: playerRef.current.name,
          room: playerRef.current.room,
        };

        resetPlayer(currentPiece);
      }

      // La nouvelle pièce reçue devient toujours la nextPiece
      const newNextPiece = {
        shape: definition.shape,
        color: definition.color,
        type: piece.type,
      };

      setNextPiece(newNextPiece);
      console.log("✅ NextPiece updated to:", piece.type);
    };

    console.log("🔌 Registering next-piece listener");
    socket.on("next-piece", handleNextPieceWrapper);

    return () => {
      console.log("🔌 Removing next-piece listener");
      socket.off("next-piece", handleNextPieceWrapper);
    };
  }, [socket, resetPlayer, setNextPiece]);

  useEffect(() => {
    if (!socket) return;
    console.log("🔌 Socket connected, setting up listeners");
    const handlePenalty = ({ count }) => {
      console.log(`🔌🔌🔌 Received penalty of ${count} lines`);

      setPile((prevPile) => {
        const width = prevPile[0].length;

        const newLines = Array.from({ length: count }, () =>
          Array.from({ length: width }, () => ({
            filled: true,
            color: "grey",
            indestructible: true,
          }))
        );

        const newPile = [...prevPile.slice(count), ...newLines];

        console.log("New pile after adding penalty lines:", newPile);
        return newPile;
      });
    };

    socket.on("receive-penalty", handlePenalty);
    return () => {
      socket.off("receive-penalty", handlePenalty);
    };
  }, [socket]);

  // Loop falling down the piece
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      console.log("🆕 Nouvelle partie - réinitialisation du plateau");
      const empty = createEmptyGrid();
      setPile(empty);
      setGrid(empty);
    }
    if (!gameStarted || isGameOver) return;

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

        if (clearedLines > 0) {
          console.log(`🧹 ${clearedLines} lines cleared`);

          // ✅ Notifier le système de scoring
          if (onLinesCleared) {
            onLinesCleared(clearedLines);
          }

          socket.emit("lines-cleared", {
            room: player.room,
            player: player.name,
            lines: clearedLines,
          });
        }

        if (reachedTop(newPile)) {
          if (handleGameOver) handleGameOver();
          socket.emit("game-over", {
            room: player.room,
            player: player.name,
          });
          clearInterval(interval);
          return;
        }

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
  }, [gameStarted, isGameOver]);

  return { grid, pile };
};
