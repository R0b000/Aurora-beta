import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('actualToken') || undefined,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join-room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', roomId);
  }

  sendMessage(conversationId: string, text: string, sender?: string) {
    this.socket?.emit('send-message', {
      conversationId,
      text,
      sender,
    });
  }

  onReceiveMessage(callback: (data: any) => void) {
    this.socket?.off('receive-message');
    this.socket?.on('receive-message', callback);
  }

  onNewNotification(callback: (notification: any) => void) {
    this.socket?.off('new-notification');
    this.socket?.on('new-notification', callback);
  }

  onStockUpdate(callback: (data: { productId: number; stock: number }) => void) {
    this.socket?.off('stock-update');
    this.socket?.on('stock-update', callback);
  }

  onNotificationUpdated(callback: (data: { notificationId: number; isRead: boolean }) => void) {
    this.socket?.off('notification-updated');
    this.socket?.on('notification-updated', callback);
  }

  markNotificationRead(notificationId: number) {
    this.socket?.emit('mark-notification-read', notificationId);
  }
}

const socketService = new SocketService();

export default socketService;
