/**
 * Calcule le spectrum d'une pile (hauteur maximale pour chaque colonne)
 * La hauteur est la distance entre le bloc le plus haut et le bas de la grille visible
 * @param {Array} pile - La pile du joueur (24 lignes x 10 colonnes)
 * @returns {Array} - Tableau de 10 hauteurs (une par colonne)
 */
export const calculateSpectrum = (pile) => {
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
