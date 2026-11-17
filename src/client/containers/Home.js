import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { emit, on, off } from "../actions/server";
import ThemeToggle from "../components/ThemeToggle"; // ✅ Dans /components/
import { useTheme } from "../game/useTheme"; // ✅ Dans /game/

const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [nameError, setNameError] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();

  // ✅ Initialiser le système de thème
  const { isDarkMode, toggleTheme } = useTheme();

  // Validation du pseudo
  const validatePlayerName = (name) => {
    if (!name || name.length === 0) {
      return "Player name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.length > 8) {
      return "Name must be at most 8 characters";
    }
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      return "Name must be alphanumeric only (letters and numbers)";
    }
    return "";
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setPlayerName(name);
    setNameError(validatePlayerName(name));
  };

  useEffect(() => {
    // 🔄 Demander explicitement la liste des rooms au montage du composant
    // Ceci est crucial pour le cas où l'utilisateur revient avec le bouton "précédent"
    dispatch(emit("get-rooms"));
    console.log("📡 Requesting available rooms...");

    // Recevoir la liste initiale des rooms disponibles
    dispatch(on("rooms", (roomsList) => {
      console.log("📋 Received available rooms:", roomsList);
      setRooms(roomsList);
    }));

    // ✅ NOUVEAU: Recevoir les mises à jour dynamiques
    dispatch(on("rooms-update", (roomsList) => {
      console.log("🔄 Rooms updated:", roomsList);
      setRooms(roomsList);
    }));

    // Ajouter une nouvelle room créée
    dispatch(on("new-room", (room) => {
      console.log("✨ New room created:", room);
      setRooms((prev) => {
        // Éviter les doublons
        if (prev.includes(room)) return prev;
        return [...prev, room];
      });
    }));

    return () => {
      dispatch(off("rooms"));
      dispatch(off("rooms-update"));
      dispatch(off("new-room"));
    };
  }, [dispatch]);

  // 🔄 Rafraîchir les rooms quand la page devient visible (retour avec bouton précédent)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Page visible again, refreshing rooms...");
        dispatch(emit("get-rooms"));
      }
    };

    const handleFocus = () => {
      console.log("🎯 Window focused, refreshing rooms...");
      dispatch(emit("get-rooms"));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);

  const createRoom = () => {
    const error = validatePlayerName(playerName);
    if (error) {
      setNameError(error);
      return;
    }
    const room = Math.floor(Math.random() * 100000).toString();
    dispatch(emit("create-room", room));
    history.push(`/${room}/${playerName}`);
  };

  const joinRoom = (room) => {
    const error = validatePlayerName(playerName);
    if (error) {
      setNameError(error);
      return;
    }
    history.push(`/${room}/${playerName}`);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* ✅ Bouton de toggle du thème */}
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <h1>Red Tetris</h1>
      <input
        type="text"
        placeholder="Enter your name (2-8 alphanumeric)"
        value={playerName}
        onChange={handleNameChange}
        maxLength={8}
        style={{
          margin: "10px",
          padding: "8px",
          border: nameError ? "2px solid #f44336" : "1px solid #ccc",
          borderRadius: "4px",
          outline: "none",
        }}
      />
      {nameError && (
        <div
          style={{
            color: "#f44336",
            fontSize: "14px",
            marginTop: "-5px",
            marginBottom: "10px",
          }}
        >
          {nameError}
        </div>
      )}
      <button onClick={createRoom}>Create Room</button>

      <h2>Available Rooms ({rooms.length})</h2>

      {/* ✅ NOUVEAU: Message si aucune room disponible */}
      {rooms.length === 0 ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          No available rooms. Create one to start playing!
        </p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {rooms.map((room) => (
            <li key={room} style={{ margin: "10px 0" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "10px",
                  color: "#4CAF50",
                }}
              >
                Room {room}
              </span>
              <button
                onClick={() => joinRoom(room)}
                style={{
                  padding: "5px 15px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ NOUVEAU: Note explicative */}
      <p
        style={{
          marginTop: "30px",
          fontSize: "14px",
          color: "#666",
          fontStyle: "italic",
        }}
      >
        💡 Note: Rooms disappear from this list once a game starts
      </p>
    </div>
  );
};

export default Home;
