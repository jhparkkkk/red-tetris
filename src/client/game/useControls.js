import { useEffect, useCallback } from "react";
import { checkCollision } from "./utils";

export const useControls = ({ player, setPlayer, rotatePiece, pile }) => {
  const move = useCallback(
    (dx, dy) => {
      setPlayer((prev) => {
        const newPos = {
          x: prev.position.x + dx,
          y: prev.position.y + dy,
        };

        if (!checkCollision(pile, prev.shape, newPos)) {
          return {
            ...prev,
            position: newPos,
          };
        }

        return prev;
      });
    },
    [pile, setPlayer]
  );

  const hardDrop = useCallback(() => {
    setPlayer((prev) => {
      let dropY = prev.position.y;
      const newPos = { ...prev.position };

      while (!checkCollision(pile, prev.shape, { ...newPos, y: dropY + 1 })) {
        dropY++;
      }

      return {
        ...prev,
        position: { ...prev.position, y: dropY },
      };
    });
  }, [pile, setPlayer]);

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
          rotatePiece(pile, player, setPlayer);
          break;
        case " ":
          hardDrop();
          break;
        default:
          break;
      }
    },
    [move, hardDrop, rotatePiece, pile]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
