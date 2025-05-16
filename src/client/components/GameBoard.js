import React from "react";
import "./GameBoard.css";

const GameBoard = ({ grid }) => {
  return (
    <div className="game-board">
      {grid.map((row, rowIndex) => (
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
