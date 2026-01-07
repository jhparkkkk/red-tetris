import { expect } from "chai";
import { calculateSpectrum } from "../../../src/client/game/spectrumUtils";

describe("spectrumUtils", () => {
  const createEmptyGrid = () =>
    Array.from({ length: 24 }, () =>
      Array.from({ length: 10 }, () => ({ filled: false }))
    );

  describe("calculateSpectrum()", () => {
    it("should return 10 heights", () => {
      const spectrum = calculateSpectrum(createEmptyGrid());
      expect(spectrum).to.have.lengthOf(10);
    });

    it("should return zeros for empty pile", () => {
      const spectrum = calculateSpectrum(createEmptyGrid());
      expect(spectrum.every((h) => h === 0)).to.be.true;
    });

    it("should calculate height correctly", () => {
      const pile = createEmptyGrid();
      pile[20][5] = { filled: true };

      const spectrum = calculateSpectrum(pile);
      expect(spectrum[5]).to.equal(4);
    });
  });
});
