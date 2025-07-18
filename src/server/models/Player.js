function Player(socket, name) {
  this.socket = socket;
  this.name = name;
  this.score = 0;
  this.pieceIndex = 0;
  this.isPlaying = false;
  this.isGameOver = false;
}

module.exports = Player;
