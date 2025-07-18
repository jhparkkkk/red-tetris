import React from "react";
import "./GameBoard.css";
const VISIBLE_ROWS = 20;
const OFFSET = 4; // pour ignorer les lignes invisibles tout en haut

const GameBoard = ({ grid }) => {
  // Affiche les 20 premières lignes de la pile
  const visibleGrid = grid.slice(OFFSET, OFFSET + VISIBLE_ROWS);

  return (
    <div className="game-board">
      {visibleGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell.filled ? "filled" : "empty"}`}
              style={{
                backgroundColor: cell.filled ? cell.color : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
