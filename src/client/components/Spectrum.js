import React from "react";
import "./Spectrum.css";

/**
 * Spectrum component - Affiche la vue "spectrum" d'un adversaire
 * Le spectrum montre la hauteur de la colonne la plus haute pour chaque colonne (10 colonnes)
 */
const Spectrum = ({ playerName, heights, isGameOver }) => {
  const maxHeight = 20; // Hauteur visible maximale

  return (
    <div className={`spectrum-container ${isGameOver ? "game-over" : ""}`}>
      <div className="spectrum-header">
        <span className="spectrum-player-name">{playerName}</span>
        {isGameOver && <span className="spectrum-status">💀</span>}
      </div>
      <div className="spectrum-grid">
        {heights.map((height, index) => (
          <div key={index} className="spectrum-column">
            <div
              className="spectrum-bar"
              style={{
                height: `${(height / maxHeight) * 100}%`,
                backgroundColor: getColorForHeight(height, maxHeight),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Fonction pour obtenir une couleur selon la hauteur (vert -> jaune -> rouge)
const getColorForHeight = (height, maxHeight) => {
  const ratio = height / maxHeight;

  if (ratio < 0.3) {
    return "#4CAF50"; // Vert (safe)
  } else if (ratio < 0.6) {
    return "#FFC107"; // Jaune (attention)
  } else if (ratio < 0.8) {
    return "#FF9800"; // Orange (danger)
  } else {
    return "#F44336"; // Rouge (critique)
  }
};

export default Spectrum;
