// src/client/game/useControls.js
import { useEffect, useCallback } from "react";
import { checkCollision } from "./utils";

export const useControls = ({ player, setPlayer, rotatePiece, pile }) => {
  const move = useCallback(
    (dx, dy) => {
      const newPos = {
        x: player.position.x + dx,
        y: player.position.y + dy,
      };

      if (!checkCollision(pile, player.shape, newPos)) {
        setPlayer((prev) => ({
          ...prev,
          position: newPos,
        }));
      }
    },
    [player, pile, setPlayer]
  );

  const hardDrop = useCallback(() => {
    let dropY = player.position.y;
    const newPos = { ...player.position };

    while (!checkCollision(pile, player.shape, { ...newPos, y: dropY + 1 })) {
      dropY++;
    }

    setPlayer((prev) => ({
      ...prev,
      position: { ...prev.position, y: dropY },
    }));
  }, [player, pile, setPlayer]);

  const handleKeyDown = useCallback(
    (e) => {
      e.preventDefault();

      switch (e.key) {
        case "ArrowLeft":
          move(-1, 0);
          break;
        case "ArrowRight":
          move(1, 0);
          break;
        case "ArrowDown":
          move(0, 1);
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        case " ":
          hardDrop();
          break;
        default:
          break;
      }
    },
    [move, hardDrop, rotatePiece]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
