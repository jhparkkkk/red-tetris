import { useEffect, useState, useRef } from "react";
import {
  createEmptyGrid,
  checkCollision,
  mergePieceWithGrid,
  clearFullRows,
  reachedTop,
  calculateGhostPosition,
  mergeGhostPieceWithGrid,
} from "./utils";

import { useDispatch } from "react-redux";
import { emit, on, off } from "../actions/server";
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
  const dispatch = useDispatch();
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
    // Toujours merger d'abord la pile avec la pièce actuelle
    // A locked piece is already part of the pile
    let updatedGrid = player.locked ? pile : mergePieceWithGrid(pile, player);

    // ✅ Calculer et afficher la ghost piece UNIQUEMENT si:
    // 1. Le jeu est démarré
    // 2. La pièce actuelle a une forme valide
    if (gameStarted && !player.locked && player.shape && player.shape.length > 0) {
      try {
        const ghostY = calculateGhostPosition(
          pile,
          player.shape,
          player.position
        );

        // Si la ghost piece n'est pas à la même position que la pièce actuelle, l'afficher
        if (ghostY !== player.position.y) {
          updatedGrid = mergeGhostPieceWithGrid(updatedGrid, player, ghostY);
        }
      } catch (error) {
        console.error("Error calculating ghost position:", error);
      }
    }

    setGrid(updatedGrid);
  }, [pile, player, gameStarted]);

  const nextPieceRef = useRef(nextPiece);

  useEffect(() => {
    nextPieceRef.current = nextPiece;
  }, [nextPiece]);

  // Receive next-piece events from the server
  useEffect(() => {
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
    dispatch(on("next-piece", handleNextPieceWrapper));

    return () => {
      console.log("🔌 Removing next-piece listener");
      dispatch(off("next-piece", handleNextPieceWrapper));
    };
  }, [dispatch, resetPlayer, setNextPiece]);

  useEffect(() => {
    console.log("🔌 Setting up penalty listener");
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

    dispatch(on("receive-penalty", handlePenalty));
    return () => {
      dispatch(off("receive-penalty", handlePenalty));
    };
  }, [dispatch]);

  // Freeze the piece into the pile and notify the server.
  // Called when a falling piece touches the pile, and right away on hard drop.
  const lockPiece = (piece) => {
    if (piece.locked || playerRef.current.locked) return;
    const lockedPiece = { ...piece, locked: true };
    playerRef.current = lockedPiece;
    resetPlayer(lockedPiece);

    const merged = mergePieceWithGrid(pileRef.current, piece);
    const { newPile, clearedLines } = clearFullRows(merged);
    pileRef.current = newPile;
    setPile(newPile);

    if (clearedLines > 0) {
      console.log(`🧹 ${clearedLines} lines cleared`);

      // ✅ Notifier le système de scoring
      if (onLinesCleared) {
        onLinesCleared(clearedLines);
      }

      dispatch(
        emit("lines-cleared", {
          room: piece.room,
          player: piece.name,
          lines: clearedLines,
        })
      );
    }

    if (reachedTop(newPile)) {
      if (handleGameOver) handleGameOver();
      dispatch(
        emit("game-over", {
          room: piece.room,
          player: piece.name,
        })
      );
      return;
    }

    console.log("🔄 Emitting piece-placed", {
      room: piece.room,
      player: piece.name,
    });
    dispatch(
      emit("piece-placed", {
        room: piece.room,
        player: piece.name,
      })
    );
  };

  // Loop falling down the piece
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      console.log("🆕 Nouvelle partie - réinitialisation du plateau");
      const empty = createEmptyGrid();
      pileRef.current = empty;
      setPile(empty);
      setGrid(empty);
    }
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      const pile = pileRef.current;

      // Waiting for the next piece from the server
      if (player.locked) return;

      const nextPos = { ...player.position, y: player.position.y + 1 };

      if (!checkCollision(pile, player.shape, nextPos)) {
        resetPlayer({ ...player, position: nextPos });
      } else {
        lockPiece(player);
      }
    }, 383);

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  return { grid, pile, lockPiece };
};
