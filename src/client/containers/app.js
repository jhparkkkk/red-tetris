import React, { useEffect } from "react";
import GameBoard from "../components/GameBoard";
import "../components/GameBoard.css";
import { usePlayer } from "../game/usePlayer";
import { useGame } from "../game/useGame";
import { checkCollision } from "../game/utils";

const App = () => {
  const { player, rotatePiece, setPlayer, resetPlayer } = usePlayer(pile);
  const { grid, pile } = useGame(player, resetPlayer);
  console.log("⛹️‍♀️ player:", player);
  console.log("⛹️‍♀️ reset player", resetPlayer);

  const move = (dx, dy) => {
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
  };

  const hardDrop = () => {
    let dropY = player.position.y;
    const newPos = { ...player.position };

    while (!checkCollision(pile, player.shape, { ...newPos, y: dropY + 1 }))
      dropY++;
    setPlayer((prev) => ({
      ...prev,
      position: { ...prev.position, y: dropY },
    }));
  };

  const handleKeyDown = (e) => {
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
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Red Tetris</h1>
      <GameBoard grid={grid} />
    </div>
  );
};

export default App;
