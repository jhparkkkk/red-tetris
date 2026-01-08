import React from "react";
import "./ScoreBoard.css";

/**
 * ScoreBoard component - Affiche le score, les lignes et le niveau
 */
const ScoreBoard = ({ score, linesCleared, level }) => {
  return (
    <div className="scoreboard-container">
      <div className="scoreboard-item">
        <span className="scoreboard-label">Score</span>
        <span className="scoreboard-value">{score.toLocaleString()}</span>
      </div>

      <div className="scoreboard-item">
        <span className="scoreboard-label">Lines</span>
        <span className="scoreboard-value">{linesCleared}</span>
      </div>
    </div>
  );
};

export default ScoreBoard;
