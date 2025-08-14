
import { io, Socket } from 'socket.io-client';
let socket: Socket | null = null;
export function getSocket() {
  if (!socket) {
    const url = 'http://localhost:8080';
    socket = io(url, { transports: ['websocket'] });
  }
  return socket;
}
