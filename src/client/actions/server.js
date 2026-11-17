export const SERVER_EMIT = "server/emit";
export const SERVER_ON = "server/on";
export const SERVER_OFF = "server/off";

export const ping = () => {
  return {
    type: 'server/ping'
  }
}

export const emit = (event, payload) => ({ type: SERVER_EMIT, event, payload });

export const on = (event, handler) => ({ type: SERVER_ON, event, handler });

export const off = (event, handler) => ({ type: SERVER_OFF, event, handler });
