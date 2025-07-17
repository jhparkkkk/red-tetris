function Player(socket, name) {
  this.socket = socket;
  this.name = name;
  this.score = 0;
}

module.exports = Player; 