import React from "react";
import GameBoard from "../components/GameBoard";
import "../components/GameBoard.css";
import { usePlayer } from "../game/usePlayer";
import { useGame } from "../game/useGame";
import { useControls } from "../game/useControls";
import { useState } from "react";
const App = () => {
  const [isGameOver, setIsGameOver] = useState(false);

  const handleGameOver = () => {
    console.log("💥 GAME OVER");
    setIsGameOver(true);
  };

  const { player, setPlayer, resetPlayer } = usePlayer();
  const { grid, pile } = useGame(player, resetPlayer, handleGameOver);

  useControls({ player, setPlayer, pile });

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Red Tetris</h1>
      {isGameOver && (
        <h2 style={{ color: "red", marginTop: "20px" }}>💥 GAME OVER</h2>
      )}
      <GameBoard grid={grid} />
    </div>
  );
};

export default App;
