import React from "react";
import "./NextPiece.css";

/**
 * NextPiece component - Affiche la prochaine pièce à venir
 */
const NextPiece = ({ nextPiece }) => {
  console.log("🎨 NextPiece rendering with:", nextPiece);

  if (!nextPiece) {
    console.log("⚠️ NextPiece is null, showing placeholder");
    return (
      <div className="next-piece-container">
        <h3 className="next-piece-title">Next</h3>
        <div className="next-piece-grid empty">
          <span>...</span>
        </div>
      </div>
    );
  }

  const { shape, color } = nextPiece;
  console.log(
    "✅ NextPiece has shape:",
    shape && shape.length,
    "rows, color:",
    color
  );

  return (
    <div className="next-piece-container">
      <h3 className="next-piece-title">Next</h3>
      <div className="next-piece-grid">
        {shape.map((row, rowIndex) => (
          <div key={rowIndex} className="next-piece-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`next-piece-cell ${cell ? "filled" : "empty"}`}
                style={{
                  backgroundColor: cell ? color : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextPiece;
