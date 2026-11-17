import io from "socket.io-client";
import { SERVER_EMIT, SERVER_ON, SERVER_OFF } from "../actions/server";

// Redux middleware owning the socket.io connection.
// Components never touch the socket: they dispatch actions instead.
//   emit(event, payload) -> socket.emit(event, payload)
//   on(event, handler)   -> socket.on(event, handler)
//   off(event, handler)  -> socket.off(event, handler)
export const createSocketMiddleware = (socket) => () => (next) => (action) => {
  switch (action.type) {
    case SERVER_EMIT:
      socket.emit(action.event, action.payload);
      return undefined;
    case SERVER_ON:
      socket.on(action.event, action.handler);
      return undefined;
    case SERVER_OFF:
      if (action.handler) socket.off(action.event, action.handler);
      else socket.off(action.event);
      return undefined;
    default:
      return next(action);
  }
};

export const socketMiddleware = (url) => createSocketMiddleware(io(url));
