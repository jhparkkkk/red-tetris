/**
 * Calcule le spectrum d'une pile (hauteur de la colonne la plus haute pour chaque colonne)
 * @param {Array} pile - La pile du joueur (24 lignes x 10 colonnes)
 * @returns {Array} - Tableau de 10 hauteurs (une par colonne)
 */
export const calculateSpectrum = (pile) => {
  const numColumns = 10;
  const numRows = 24;
  const visibleOffset = 4; // Offset pour les lignes invisibles

  const heights = [];

  for (let col = 0; col < numColumns; col++) {
    let height = 0;

    // Parcourir de haut en bas pour trouver le premier bloc rempli
    for (let row = visibleOffset; row < numRows; row++) {
      if (pile[row] && pile[row][col] && pile[row][col].filled) {
        // Calculer la hauteur depuis le bas visible
        height = numRows - row - visibleOffset;
        break;
      }
    }

    heights.push(height);
  }

  return heights;
};

/**
 * Version alternative : calcule depuis le bas
 */
export const calculateSpectrumFromBottom = (pile) => {
  const numColumns = 10;
  const numRows = 24;
  const visibleOffset = 4;

  const heights = [];

  for (let col = 0; col < numColumns; col++) {
    let height = 0;

    // Parcourir de bas en haut
    for (let row = numRows - 1; row >= visibleOffset; row--) {
      if (pile[row] && pile[row][col] && pile[row][col].filled) {
        height++;
      } else if (height > 0) {
        // Si on a déjà compté des blocs et qu'on trouve un vide, arrêter
        // (pour gérer les trous dans la pile)
        break;
      }
    }

    heights.push(height);
  }

  return heights;
};
