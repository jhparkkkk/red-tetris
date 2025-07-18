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

Game.prototype.removePlayer = function (player) {
  this.players = this.players.filter((p) => p.name !== player);
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

module.exports = Game;
