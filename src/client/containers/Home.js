import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [rooms, setRooms] = useState([]);
  const socket = useContext(SocketContext);
  const history = useHistory();

  useEffect(() => {
    socket.on("rooms", (roomsList) => {
      setRooms(roomsList);
    });
    socket.on("new-room", (room) => {
      setRooms((prev) => [...new Set([...prev, room])]);
    });
    return () => {
      socket.off("rooms");
      socket.off("new-room");
    };
  }, [socket]);

  const createRoom = () => {
    const room = Math.floor(Math.random() * 100000).toString();
    socket.emit("create-room", room);
    history.push(`/${room}/${playerName}`, { fromButton: true });
  };

  const joinRoom = (room) => {
    if (!playerName) {
      alert("Please enter a player name");
      return;
    }
    history.push(`/${room}/${playerName}`, { fromButton: true });
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
      <h2>Active Rooms</h2>
      <ul style={{ listStyleType: "none" }}>
        {rooms.map((room) => (
          <li key={room}>
            Room {room} <button onClick={() => joinRoom(room)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home; 