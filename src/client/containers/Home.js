import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [rooms, setRooms] = useState([]);
  const socket = useContext(SocketContext);
  const history = useHistory();

  useEffect(() => {
    // Recevoir la liste initiale des rooms disponibles
    socket.on("rooms", (roomsList) => {
      console.log("📋 Received available rooms:", roomsList);
      setRooms(roomsList);
    });

    // ✅ NOUVEAU: Recevoir les mises à jour dynamiques
    socket.on("rooms-update", (roomsList) => {
      console.log("🔄 Rooms updated:", roomsList);
      setRooms(roomsList);
    });

    // Ajouter une nouvelle room créée
    socket.on("new-room", (room) => {
      console.log("✨ New room created:", room);
      setRooms((prev) => {
        // Éviter les doublons
        if (prev.includes(room)) return prev;
        return [...prev, room];
      });
    });

    return () => {
      socket.off("rooms");
      socket.off("rooms-update");
      socket.off("new-room");
    };
  }, [socket]);

  const createRoom = () => {
    const room = Math.floor(Math.random() * 100000).toString();
    socket.emit("create-room", room);
  };

  const joinRoom = (room) => {
    if (!playerName) {
      alert("Please enter a player name");
      return;
    }
    history.push(`/${room}/${playerName}`);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Red Tetris</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        style={{ margin: "10px" }}
      />
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
