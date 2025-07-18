class Piece {
  constructor(type) {
    this.type = type; // 'I', 'O', 'T', 'S', 'Z', 'J', 'L'
  }

  serialize() {
    return { type: this.type };
  }
}

module.exports = Piece;
