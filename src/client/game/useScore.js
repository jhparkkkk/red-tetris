import { useState, useEffect } from "react";

/**
 * Hook pour gérer le score du joueur
 * Système de scoring basé sur les lignes complétées avec multiplicateur
 */
export const useScore = () => {
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);

  // Calcul du multiplicateur basé sur le nombre de lignes simultanées
  const getPointsForLines = (lines) => {
    const basePoints = {
      1: 100, // Single
      2: 300, // Double
      3: 500, // Triple
      4: 800, // Tetris
    };

    return (basePoints[lines] || 0) * level;
  };

  // Ajouter des points quand des lignes sont complétées
  const addLinesCleared = (lines) => {
    if (lines > 0) {
      const points = getPointsForLines(lines);
      setScore((prev) => prev + points);
      setLinesCleared((prev) => prev + lines);
    }
  };

  // Augmenter le niveau tous les 10 lignes
  useEffect(() => {
    const newLevel = Math.floor(linesCleared / 10) + 1;
    setLevel(newLevel);
  }, [linesCleared]);

  // Reset le score
  const resetScore = () => {
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
  };

  return {
    score,
    linesCleared,
    level,
    addLinesCleared,
    resetScore,
  };
};
