/**
 * Version alternative : calcule depuis le bas
 */
export const calculateSpectrumFromBottom = (pile) => {
  const numColumns = 10;
  const numRows = 24;
  const visibleOffset = 4; // Offset pour les lignes invisibles

  const heights = [];

  for (let col = 0; col < numColumns; col++) {
    let maxHeight = 0;

    // Parcourir de haut en bas pour trouver le premier bloc rempli (le plus haut)
    for (let row = visibleOffset; row < numRows; row++) {
      if (pile[row] && pile[row][col] && pile[row][col].filled) {
        // Calculer la hauteur depuis le bas visible (ligne 23)
        // La hauteur est la distance entre le bloc le plus haut et le bas
        maxHeight = numRows - row;
        break;
      }
    }

    heights.push(maxHeight);
  }

  return heights;
};
