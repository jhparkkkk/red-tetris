import React from "react";
import GameBoard from "../components/GameBoard";
import "../components/GameBoard.css";
import { usePlayer } from "../game/usePlayer";
import { useGame } from "../game/useGame";
import { useControls } from "../game/useControls";
import { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { TETRIMINOS } from "../game/tetriminos";

const GameContainer = () => {
  const { room, playerName } = useParams();
  const history = useHistory();
  const socket = useContext(SocketContext);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentHost, setCurrentHost] = useState(null);
  const [hasWon, setHasWon] = useState(false); // ✅ NOUVEAU: Distinguer victoire

  const { player, setPlayer, resetPlayer } = usePlayer();

  const handleGameOver = () => {
    console.log("💥 GAME OVER");
    setIsGameOver(true);
    setHasWon(false); // ✅ Défaite, pas une victoire
  };

  const { grid, pile } = useGame(
    player,
    resetPlayer,
    handleGameOver,
    isGameOver,
    gameStarted
  );

  useEffect(() => {
    socket.on("game-won", ({ winner }) => {
      console.log(`🏆 Winner: ${winner}`);

      if (winner === playerName) {
        // ✅ MOI qui ai gagné
        setHasWon(true);
        setIsGameOver(true); // Pour afficher les contrôles
        alert(`🏆 Congratulations! You won the game!`);
      } else {
        // ✅ Quelqu'un d'autre a gagné
        setHasWon(false);
        setIsGameOver(true);
        alert(`🏆 ${winner} won the game!`);
      }
    });

    return () => {
      socket.off("game-won");
    };
  }, [socket, playerName]);

  useEffect(() => {
    console.log("GameContainer mounted with params:", { room, playerName });
    if (room && playerName) {
      console.log("Emitting join-room");
      socket.emit("join-room", { room, player: playerName });

      socket.on("player-joined", ({ players, host }) => {
        console.log("Players in room:", players, "Host:", host);
        setPlayers(players);
        setCurrentHost(host);
        setIsHost(host === playerName);
      });

      socket.on("host-changed", ({ newHost, oldHost }) => {
        console.log(`👑 Host changed from ${oldHost} to ${newHost}`);
        setCurrentHost(newHost);
        setIsHost(newHost === playerName);

        if (newHost === playerName) {
          alert(`👑 You are now the host! You can start/restart the game.`);
        }
      });

      socket.on("player-left", ({ player: leftPlayer, players, host }) => {
        console.log(`🚪 ${leftPlayer} left the room`);
        setPlayers(players);
        setCurrentHost(host);
        setIsHost(host === playerName);
      });

      socket.on("game-started", ({ piece }) => {
        console.log("Game started event received");
        console.log("First piece:", piece);

        // ✅ Reset des états de victoire/défaite
        setIsGameOver(false);
        setHasWon(false);

        setPlayer({
          shape: TETRIMINOS[piece.type].shape,
          color: TETRIMINOS[piece.type].color,
          position: { x: 3, y: 0 },
          name: playerName,
          room: room,
        });

        setGameStarted(true);
      });

      socket.on("error", ({ message }) => {
        console.log("Server error:", message);
        alert(`Error: ${message}`);
      });

      return () => {
        console.log("Leaving room:", room);
        socket.emit("leave-room", { room, player: playerName });
        socket.off("player-joined");
        socket.off("host-changed");
        socket.off("player-left");
        socket.off("game-started");
        socket.off("error");
      };
    } else {
      console.error("Missing room or playerName in URL params");
    }
  }, [socket, room, playerName]);

  const startGame = () => {
    console.log("Emitting start-game event for room:", room);
    socket.emit("start-game", { room });
  };

  useControls({ player, setPlayer, pile });

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Red Tetris - Room {room}</h1>
      <div style={{ marginBottom: "20px" }}>
        <h3>Players in Room:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {players.map((p, index) => (
            <li key={`${p}-${index}`} style={{ margin: "5px 0" }}>
              {p}
              {p === playerName && " (You)"}
              {p === currentHost && " 👑 Host"}
            </li>
          ))}
        </ul>

        {/* Avant la partie */}
        {isHost && !gameStarted && (
          <div>
            <p style={{ color: "#4CAF50", fontWeight: "bold" }}>
              👑 You are the host
            </p>
            <button onClick={startGame}>
              Start Game {players.length === 1 ? "(Solo)" : ""}
            </button>
          </div>
        )}

        {!isHost && !gameStarted && (
          <p style={{ color: "#999" }}>
            Waiting for {currentHost} (host) to start the game...
          </p>
        )}

        {/* Après la partie */}
        {isHost && isGameOver && (
          <button onClick={startGame}>🔁 Restart Game</button>
        )}

        {!isHost && isGameOver && (
          <p style={{ color: "#999" }}>
            Waiting for {currentHost} (host) to restart...
          </p>
        )}
      </div>

      {gameStarted ? (
        <div>
          {isGameOver && hasWon && (
            <h2
              style={{
                color: "#4CAF50",
                marginTop: "20px",
                fontSize: "36px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              🏆 YOU WON! 🏆
            </h2>
          )}

          {isGameOver && !hasWon && (
            <h2
              style={{
                color: "#f44336",
                marginTop: "20px",
                fontSize: "32px",
              }}
            >
              💥 GAME OVER
            </h2>
          )}

          <GameBoard grid={grid} />
        </div>
      ) : (
        !isHost && <h2>Waiting for host to start the game...</h2>
      )}
    </div>
  );
};

export default GameContainer;
