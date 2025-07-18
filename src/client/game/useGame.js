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
  gameStarted
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

  // Handle next piece from the server
  const handleNextPiece = ({ piece }) => {
    const definition = TETRIMINOS[piece.type];
    if (!definition) {
      console.error("Received unknown piece type:", piece.type);
      return;
    }

    const nextPiece = {
      shape: definition.shape,
      color: definition.color,
      position: { x: 3, y: 0 },
      name: playerRef.current.name,
      room: playerRef.current.room,
    };

    resetPlayer(nextPiece);

    console.log("📦 Received from server:", nextPiece);
  };

  // Receive next-piece events from the server
  useEffect(() => {
    if (!socket) return;
    socket.on("next-piece", handleNextPiece);
    return () => {
      socket.off("next-piece", handleNextPiece);
    };
  }, [socket]);

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

        const newPile = [...prevPile.slice(count + 1), ...newLines];

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
