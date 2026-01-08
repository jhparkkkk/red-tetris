import debug from "debug";

const loginfo = debug("tetris:info");
const { log } = require("console");
const Piece = require("./Piece");
const TETROMINOS = ["I", "O", "T", "S", "Z", "J", "L"];

// 🎯 Nombre de pièces à maintenir en avance dans la queue
const MIN_QUEUE_SIZE = 10;

function Game(room, seed) {
  this.room = room;
  this.players = [];
  this.host = null;
  this.started = false;
  this.pieceQueue = [];

  // Générateur déterministe avec seed
  this.seed = seed || room;
  this.rng = this.initRNG(this.seed);
  this.currentBag = [];
}

Game.prototype.generateNextPiece = function () {
  if (this.currentBag.length === 0) {
    // Créer un nouveau bag avec tous les 7 types
    this.currentBag = ["I", "O", "T", "S", "Z", "J", "L"];

    // Mélanger avec le RNG déterministe (Fisher-Yates)
    for (let i = this.currentBag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.currentBag[i], this.currentBag[j]] = [
        this.currentBag[j],
        this.currentBag[i],
      ];
    }
  }

  const type = this.currentBag.pop();
  const piece = new Piece(type);
  this.pieceQueue.push(piece);
  return piece;
};

/**
 * 🚀 Remplit la queue avec suffisamment de pièces en avance
 * pour éviter toute latence lors de la distribution
 */
Game.prototype.fillPieceQueue = function () {
  const targetSize = this.pieceQueue.length + MIN_QUEUE_SIZE;

  while (this.pieceQueue.length < targetSize) {
    this.generateNextPiece();
  }

  loginfo(`📦 Piece queue filled: ${this.pieceQueue.length} pieces available`);
};

Game.prototype.initRNG = function (seed) {
  // Convertir la seed en nombre
  let value = 0;
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) % 2147483647;
  }

  // Générateur LCG
  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

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

  // 🚀 Maintenir la queue remplie en permanence
  // Au lieu de générer une pièce seulement quand nécessaire,
  // on s'assure qu'il y a toujours MIN_QUEUE_SIZE pièces en avance
  const maxIndex = Math.max(...this.players.map((p) => p.pieceIndex));
  const piecesNeeded = maxIndex + MIN_QUEUE_SIZE;

  // Remplir la queue si nécessaire
  while (this.pieceQueue.length < piecesNeeded) {
    const newPiece = this.generateNextPiece();
    loginfo(
      `🧩 Generated piece #${this.pieceQueue.length - 1}: ${newPiece.type}`
    );
  }

  loginfo(
    `📊 ${playerName} index: ${player.pieceIndex}, queue length: ${
      this.pieceQueue.length
    }, buffer: ${this.pieceQueue.length - maxIndex}`
  );

  const currentPiece = this.pieceQueue[player.pieceIndex];
  return currentPiece ? currentPiece.serialize() : null;
};

Game.prototype.reset = function () {
  this.started = true;
  this.pieceQueue = [];
  this.currentBag = [];
  this.players.forEach((p) => {
    p.pieceIndex = 0;
    p.isGameOver = false;
    p.isPlaying = true;
  });

  // 🚀 Préremplir la queue avec des pièces en avance
  // Ceci garantit qu'il n'y a aucune latence au début de la partie
  this.fillPieceQueue();

  loginfo(`🎮 Game reset: ${this.pieceQueue.length} pieces pre-generated`);
};

module.exports = Game;
