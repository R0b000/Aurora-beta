import React, { createContext, useContext, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  socket: ReturnType<typeof useSocket>['socket'];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (conversationId: string, text: string, sender?: string) => void;
  onReceiveMessage: (callback: (data: any) => void) => void;
  onNewNotification: (callback: (notification: any) => void) => void;
  onStockUpdate: (callback: (data: { productId: number; stock: number }) => void) => void;
  onNotificationUpdated: (callback: (data: { notificationId: number; isRead: boolean }) => void) => void;
  markNotificationRead: (notificationId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketApi = useSocket();

  return (
    <SocketContext.Provider value={socketApi}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
