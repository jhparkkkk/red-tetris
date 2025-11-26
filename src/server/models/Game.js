import debug from "debug";

const loginfo = debug("tetris:info");
const { log } = require("console");
const Piece = require("./Piece");
const TETROMINOS = ["I", "O", "T", "S", "Z", "J", "L"];

function getRandomType() {
  const index = Math.floor(Math.random() * TETROMINOS.length);
  return TETROMINOS[index];
}

function Game(room) {
  this.room = room;
  this.players = [];
  this.host = null;
  this.started = false;
  this.pieceQueue = [];
}

Game.prototype.addPlayer = function (player) {
  this.players.push(player);
  if (this.players.length === 1) {
    this.host = player;
  }
};

Game.prototype.transferHost = function () {
  if (this.players.length > 0) {
    const newHost = this.players[0];
    this.host = newHost;
    console.log(`host transferred to ${newHost.name}`);
    return newHost;
  }

  this.host = null;
  console.log("no player left in room");
  return null;
};

Game.prototype.removePlayer = function (playerName) {
  const wasHost = this.host && this.host.name === playerName;

  this.players = this.players.filter((p) => p.name !== playerName);
  console.log(
    `🚪 ${playerName} left room ${this.room}. Players remaining: ${this.players.length}`
  );

  let newHost = null;
  if (wasHost) {
    newHost = this.transferHost();
  }

  return {
    wasHost: wasHost,
    newHost: newHost,
    playersRemaining: this.players.length,
  };
};

Game.prototype.getHostName = function () {
  return this.host ? this.host.name : null;
};

Game.prototype.getPlayerNames = function () {
  return this.players.map((p) => p.name);
};

Game.prototype.generateNextPiece = function () {
  const type = getRandomType();
  const piece = new Piece(type);
  this.pieceQueue.push(piece);
  return piece;
};
Game.prototype.getNextPieceForPlayer = function (playerName) {
  const player = this.players.find((p) => p.name === playerName);
  if (!player) return null;

  const index = player.pieceIndex;
  return this.pieceQueue[index] || null;
};

Game.prototype.getLastPiece = function () {
  return this.pieceQueue[this.pieceQueue.length - 1] || null;
};

Game.prototype.getPieceQueue = function () {
  return this.pieceQueue.map((p) => p.serialize());
};

Game.prototype.onPlayerPlacedPiece = function (playerName) {
  const player = this.players.find((p) => p.name === playerName);
  if (!player) return null;

  player.pieceIndex++;

  const maxIndex = Math.max(...this.players.map((p) => p.pieceIndex));
  const queueLength = this.pieceQueue.length;

  console.log(
    `🔍 ${playerName} index: ${player.pieceIndex}, maxIndex: ${maxIndex}, queueLength: ${queueLength}`
  );

  if (maxIndex >= queueLength) {
    const newPiece = this.generateNextPiece();
    console.log(`🧩 New piece generated: ${newPiece.type}`);
  }

  const currentPiece = this.pieceQueue[player.pieceIndex];
  return currentPiece ? currentPiece.serialize() : null;
};

Game.prototype.reset = function () {
  this.started = true;
  this.pieceQueue = [];
  this.players.forEach((p) => {
    p.pieceIndex = 0;
    p.isGameOver = false;
    p.isPlaying = true;
  });
};

module.exports = Game;
