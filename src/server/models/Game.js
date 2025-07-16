function Game(room) {
  this.room = room;
  this.players = [];
  this.host = null;
  this.started = false;
}

Game.prototype.addPlayer = function(player) {
  this.players.push(player);
  if (this.players.length === 1) {
    this.host = player;
  }
};

module.exports = Game; 