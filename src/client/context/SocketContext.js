import React from "react";
import { createContext, useMemo, useContext } from "react";
import io from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const serverUrl = `http://${window.location.hostname}:3004`;
    return io(serverUrl);
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
