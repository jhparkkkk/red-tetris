import React from "react";
import GameBoard from "../components/GameBoard";
import Spectrum from "../components/Spectrum";
import NextPiece from "../components/NextPiece";
import ScoreBoard from "../components/ScoreBoard";
import ThemeToggle from "../components/ThemeToggle"; // ✅ Dans /components/
import "../components/GameBoard.css";
import { usePlayer } from "../game/usePlayer";
import { useGame } from "../game/useGame";
import { useControls } from "../game/useControls";
import { useScore } from "../game/useScore";
import { useTheme } from "../game/useTheme"; // ✅ Dans /game/
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { emit, on, off } from "../actions/server";
import { TETRIMINOS } from "../game/tetriminos";
import { calculateSpectrum } from "../game/spectrumUtils";
const GameContainer = () => {
  const { room, playerName } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentHost, setCurrentHost] = useState(null);
  const [hasWon, setHasWon] = useState(false); // ✅ NOUVEAU: Distinguer victoire
  const [opponentSpectrums, setOpponentSpectrums] = useState({});

  // ✅ Initialiser le système de scoring
  const { score, linesCleared, level, addLinesCleared, resetScore } =
    useScore();

  // ✅ Initialiser le système de thème
  const { isDarkMode, toggleTheme } = useTheme();

  const { player, setPlayer, resetPlayer, nextPiece, setNextPiece } =
    usePlayer(); // 🆕 Ajouter nextPiece et setNextPiece

  const handleGameOver = () => {
    console.log("💥 GAME OVER");
    setIsGameOver(true);
    setHasWon(false); // ✅ Défaite, pas une victoire
  };

  const { grid, pile, lockPiece } = useGame(
    player,
    resetPlayer,
    handleGameOver,
    isGameOver,
    gameStarted,
    nextPiece, // 🆕 Passer nextPiece
    setNextPiece, // 🆕 Passer setNextPiece
    addLinesCleared // ✅ Passer la fonction pour mettre à jour le score
  );

  useEffect(() => {
    if (!gameStarted || !player.name) return;

    const interval = setInterval(() => {
      const mySpectrum = calculateSpectrum(pile);

      dispatch(emit("spectrum-update", {
        room: room,
        player: playerName,
        spectrum: mySpectrum,
      }));
    }, 500); // Mise à jour toutes les 500ms

    return () => clearInterval(interval);
  }, [gameStarted, pile, dispatch, room, playerName]);

  // ✅ NOUVEAU: Recevoir les spectrums des adversaires
  useEffect(() => {
    dispatch(on("opponent-spectrum", ({ player, spectrum }) => {
      setOpponentSpectrums((prev) => {
        const prevPlayer = prev[player];
        return {
          ...prev,
          [player]: {
            spectrum: spectrum,
            isGameOver: (prevPlayer && prevPlayer.isGameOver) || false,
          },
        };
      });
    }));

    return () => {
      dispatch(off("opponent-spectrum"));
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(on("game-won", ({ winner }) => {
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
    }));

    return () => {
      dispatch(off("game-won"));
    };
  }, [dispatch, playerName]);

  useEffect(() => {
    console.log("GameContainer mounted with params:", { room, playerName });
    if (room && playerName) {
      console.log("Emitting join-room");
      dispatch(emit("join-room", { room, player: playerName }));

      dispatch(on("player-joined", ({ players, host }) => {
        console.log("Players in room:", players, "Host:", host);
        setPlayers(players);
        setCurrentHost(host);
        setIsHost(host === playerName);

        const newSpectrums = {};
        players.forEach((p) => {
          if (p !== playerName) {
            newSpectrums[p] = {
              spectrum: Array(10).fill(0),
              isGameOver: false,
            };
          }
        });
        setOpponentSpectrums(newSpectrums);
      }));

      dispatch(on("host-changed", ({ newHost, oldHost }) => {
        console.log(`👑 Host changed from ${oldHost} to ${newHost}`);
        setCurrentHost(newHost);
        setIsHost(newHost === playerName);

        if (newHost === playerName) {
          alert(`👑 You are now the host! You can start/restart the game.`);
        }
      }));

      dispatch(on("player-left", ({ player: leftPlayer, players, host }) => {
        console.log(`🚪 ${leftPlayer} left the room`);
        setPlayers(players);
        setCurrentHost(host);
        setIsHost(host === playerName);

        setOpponentSpectrums((prev) => {
          const updated = { ...prev };
          delete updated[leftPlayer];
          return updated;
        });
      }));

      dispatch(on("game-started", ({ piece, nextPiece: serverNextPiece }) => {
        console.log("🎮 Game started event received");
        console.log("First piece:", piece);
        console.log("Next piece preview:", serverNextPiece);

        // ✅ Reset des états de victoire/défaite
        setIsGameOver(false);
        setHasWon(false);

        // ✅ Reset du score
        resetScore();

        const resetSpectrums = {};
        players.forEach((p) => {
          if (p !== playerName) {
            resetSpectrums[p] = {
              spectrum: Array(10).fill(0),
              isGameOver: false,
            };
          }
        });
        setOpponentSpectrums(resetSpectrums);

        // 🎯 Définir la première pièce courante (celle qu'on joue maintenant)
        setPlayer({
          shape: TETRIMINOS[piece.type].shape,
          color: TETRIMINOS[piece.type].color,
          position: { x: 3, y: 3 }, // Démarrer à y: 4 (première ligne visible)
          name: playerName,
          room: room,
        });

        // 🎯 Définir la prochaine pièce pour la preview
        if (serverNextPiece) {
          const nextPieceData = {
            shape: TETRIMINOS[serverNextPiece.type].shape,
            color: TETRIMINOS[serverNextPiece.type].color,
            type: serverNextPiece.type,
          };

          console.log("🔍 Setting nextPiece:", nextPieceData);
          setNextPiece(nextPieceData);

          console.log(
            "✅ Initial setup - Current:",
            piece.type,
            "Next:",
            serverNextPiece.type
          );
        } else {
          console.error("❌ serverNextPiece is undefined!");
        }

        setGameStarted(true);
      }));

      dispatch(on("game-over", ({ player: deadPlayer }) => {
        console.log(`💀 ${deadPlayer} is game over`);
        setOpponentSpectrums((prev) => ({
          ...prev,
          [deadPlayer]: {
            ...prev[deadPlayer],
            isGameOver: true,
          },
        }));
      }));

      dispatch(on("error", ({ message }) => {
        console.log("Server error:", message);
        alert(`Error: ${message}`);
      }));

      return () => {
        console.log("Leaving room:", room);
        dispatch(emit("leave-room", { room, player: playerName }));
        dispatch(off("player-joined"));
        dispatch(off("host-changed"));
        dispatch(off("player-left"));
        dispatch(off("game-started"));
        dispatch(off("game-over"));
        dispatch(off("error"));
      };
    } else {
      console.error("Missing room or playerName in URL params");
    }
  }, [dispatch, room, playerName]);

  const startGame = () => {
    console.log("Emitting start-game event for room:", room);
    dispatch(emit("start-game", { room }));
  };

  useControls({ player, setPlayer, pile, isGameOver, lockPiece });

  return (
    <div style={{ textAlign: "center" }}>
      {/* ✅ Bouton de toggle du thème */}
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <h1>Red Tetris - Room {room}</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Players in Room:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {players.map((p, index) => (
            <li key={`${p}-${index}`} style={{ margin: "5px 0" }}>
              {p}
              {p === playerName && " (You)"}
              {p === currentHost && " Host"}
            </li>
          ))}
        </ul>

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
          {/* Messages de victoire/défaite */}
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

          {/* Layout principal: votre board + spectrums */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            {/* 🆕 Section: Votre board + NextPiece */}
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <h3 style={{ color: "#4CAF50" }}>Your Board</h3>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                {/* 🆕 NextPiece Preview à gauche */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <NextPiece nextPiece={nextPiece} />
                  {/* ✅ ScoreBoard sous NextPiece */}
                  <ScoreBoard
                    score={score}
                    linesCleared={linesCleared}
                    level={level}
                  />
                </div>

                {/* GameBoard au centre */}
                <GameBoard grid={grid} />
              </div>
            </div>

            {/* ✅ NOUVEAU: Spectrums des adversaires */}
            {Object.keys(opponentSpectrums).length > 0 && (
              <div style={{ flex: "0 0 auto" }}>
                <h3 className="spectrums-title">Opponents</h3>
                <div className="spectrums-container">
                  {Object.entries(opponentSpectrums).map(([name, data]) => (
                    <Spectrum
                      key={name}
                      playerName={name}
                      heights={data.spectrum}
                      isGameOver={data.isGameOver}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        !isHost && <h2>Waiting for host to start the game...</h2>
      )}
    </div>
  );
};

export default GameContainer;
