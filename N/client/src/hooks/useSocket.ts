import { useEffect, useRef, useCallback } from 'react';
import socketService from '../service/socket.service';

export function useSocket() {
  const socketRef = useRef(socketService.getSocket());

  useEffect(() => {
    const token = localStorage.getItem('actualToken') || undefined;
    socketService.connect(token);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketService.leaveRoom(roomId);
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, sender?: string) => {
    socketService.sendMessage(conversationId, text, sender);
  }, []);

  const onReceiveMessage = useCallback((callback: (data: any) => void) => {
    socketService.onReceiveMessage(callback);
  }, []);

  const onNewNotification = useCallback((callback: (notification: any) => void) => {
    socketService.onNewNotification(callback);
  }, []);

  const onStockUpdate = useCallback((callback: (data: { productId: number; stock: number }) => void) => {
    socketService.onStockUpdate(callback);
  }, []);

  const onNotificationUpdated = useCallback((callback: (data: { notificationId: number; isRead: boolean }) => void) => {
    socketService.onNotificationUpdated(callback);
  }, []);

  const markNotificationRead = useCallback((notificationId: number) => {
    socketService.markNotificationRead(notificationId);
  }, []);

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    onReceiveMessage,
    onNewNotification,
    onStockUpdate,
    onNotificationUpdated,
    markNotificationRead,
  };
}
