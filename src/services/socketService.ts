import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO instance for real-time messaging and typing indicators
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    // Strip trailing /api to reach the root websocket server
    const serverUrl = rawUrl.replace(/\/api\/?$/, '');
    const token = typeof window !== 'undefined' ? localStorage.getItem('devasetu_token') : null;

    socket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || undefined,
      },
    });
  }
  return socket;
};

/**
 * Disconnect socket and clean up singleton
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
