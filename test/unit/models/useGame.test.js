import chai from "chai";

chai.should();

/**
 * Test minimal pour useGame.js
 *
 * Ce test importe simplement le fichier pour que nyc le compte
 * dans la couverture. Le hook React ne peut pas être testé
 * facilement sans @testing-library/react-hooks.
 */

describe("useGame Import", () => {
  it("should import useGame module", () => {
    // Import du module
    const useGameModule = require("../../../src/client/game/useGame");

    // Vérifier que le module existe
    chai.expect(useGameModule).to.exist;
    chai.expect(useGameModule.useGame).to.be.a("function");
  });
});

/**
 * Note: Ce test ne teste PAS la logique de useGame.
 * La logique (collision, grille, etc.) est déjà testée dans utils.test.js
 *
 * useGame.js est un hook React UI qui:
 * - Utilise useState, useEffect, useRef
 * - Nécessiterait @testing-library/react-hooks pour être testé
 * - N'est PAS requis par le sujet Red Tetris (focus serveur)
 *
 * La couverture restera faible pour ce fichier et c'est OK ✅
 */
