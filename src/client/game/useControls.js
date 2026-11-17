import { useEffect, useCallback } from "react";
import { checkCollision } from "./utils";

export const useControls = ({
  player,
  setPlayer,
  pile,
  isGameOver,
  lockPiece,
}) => {
  const move = useCallback(
    (dx, dy) => {
      const newPos = {
        x: player.position.x + dx,
        y: player.position.y + dy,
      };

      const hasCollision = checkCollision(pile, player.shape, newPos);

      if (!hasCollision) {
        // Ignored if the piece got locked in the meantime (hard drop)
        setPlayer((prev) =>
          prev.locked ? prev : { ...player, position: newPos }
        );
      } else if (dy === 1) {
      }
    },
    [pile, player, setPlayer]
  );

  const hardDrop = useCallback(() => {
    let dropY = player.position.y;

    while (
      !checkCollision(pile, player.shape, {
        x: player.position.x,
        y: dropY + 1,
      })
    ) {
      dropY++;
    }

    const droppedPlayer = {
      ...player,
      position: { ...player.position, y: dropY },
    };

    // The piece is frozen right away: no last-moment move after a hard drop
    if (lockPiece) lockPiece(droppedPlayer);
    else setPlayer(droppedPlayer);
  }, [pile, player, setPlayer, lockPiece]);

  const rotate = (matrix) =>
    matrix[0].map((_, i) => matrix.map((row) => row[i])).reverse();

  const rotatePiece = () => {
    const rotatedShape = rotate(player.shape);
    const originalPos = player.position;
    const offsets = [0, -1, 1, -2, 2];

    for (let offset of offsets) {
      const newPos = { x: originalPos.x + offset, y: originalPos.y };

      if (!checkCollision(pile, rotatedShape, newPos)) {
        setPlayer((prev) =>
          prev.locked
            ? prev
            : { ...prev, shape: rotatedShape, position: newPos }
        );
        return;
      }
    }
    // ();
    return;
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (isGameOver || player.locked) return;
      //if (e.repeat) return;
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
    [isGameOver, player.locked, move, hardDrop, rotatePiece]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
