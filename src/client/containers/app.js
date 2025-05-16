import React, { useEffect } from "react";
import GameBoard from "../components/GameBoard";
import "../components/GameBoard.css";
import { usePlayer } from "../game/usePlayer";
import { useGame } from "../game/useGame";

const App = () => {
  const { player, move, rotatePiece, resetPlayer } = usePlayer();
  const { grid } = useGame(player, resetPlayer);
  console.log("⛹️‍♀️ player:", player);
  console.log("⛹️‍♀️ reset player", resetPlayer);

  useEffect(() => {
    const handleKeyDown = (e) => {
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
          console.log("rotate");
          rotatePiece();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, rotatePiece]);
  const testGrid = Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => ({
      filled: true,
      color: "grey",
    }))
  );

  console.log("player: ", player);
  console.log("grid:", grid);
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Red Tetris</h1>
      <GameBoard grid={grid} />
      <GameBoard grid={testGrid} />
    </div>
  );
};

export default App;
