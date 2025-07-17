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

  const { player, setPlayer, resetPlayer } = usePlayer();
  const { grid, pile } = useGame(
    player,
    resetPlayer,
    handleGameOver,
    isGameOver,
    gameStarted
  );

  useEffect(() => {
    console.log("GameContainer mounted with params:", { room, playerName });
    if (room && playerName) {
      console.log("Emitting join-room");
      socket.emit("join-room", { room, player: playerName });

      socket.on("player-joined", ({ players, host }) => {
        console.log("Players in room:", players, "Host:", host);
        setPlayers(players);
        setIsHost(host === playerName);
      });

      socket.on("game-started", ({ piece }) => {
        console.log("Game started event received");
        console.log("First piece:", piece);
        setPlayer({
          shape: TETRIMINOS[piece.type].shape,
          color: TETRIMINOS[piece.type].color,
          position: { x: 3, y: -2 },
          name: playerName,
          room: room,
        });

        setGameStarted(true);
      });

      socket.on("error", ({ message }) => {
        console.log("Server error:", message);
      });

      return () => {
        console.log("Leaving room:", room);
        socket.emit("leave-room", { room, player: playerName });
        socket.off("player-joined");
        socket.off("game-started");
        socket.off("error");
      };
    } else {
      console.error("Missing room or playerName in URL params");
    }
  }, [socket, room, playerName]);

  const handleGameOver = () => {
    console.log("💥 GAME OVER");
    setIsGameOver(true);
  };

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
          {players.map((p) => (
            <li key={p}>
              {p} {p === playerName && "(You)"}{" "}
              {isHost && p === playerName && "(Host)"}
            </li>
          ))}
        </ul>
        {isHost && !gameStarted && (
          <button onClick={startGame}>
            Start Game {players.length === 1 ? "(Solo)" : ""}
          </button>
        )}
      </div>
      {gameStarted ? (
        <div>
          {isGameOver && (
            <h2 style={{ color: "red", marginTop: "20px" }}>💥 GAME OVER</h2>
          )}
          <GameBoard grid={grid} />
        </div>
      ) : (
        <h2>Waiting for host to start the game...</h2>
      )}
    </div>
  );
};

export default GameContainer;
