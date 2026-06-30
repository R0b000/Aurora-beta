import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        null;

      if (!token) {
        return next(new Error('Authentication error: Token expected'));
      }

      const raw = token.split(' ').pop() || token;
      const payload = jwt.verify(raw, process.env.JWT_ACCESS_SECRET);
      
      if (!payload?.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const [users] = await pool.query(
        'SELECT id, name, email, role, phone, avatar_url, is_verified, is_banned FROM users WHERE id = ?',
        [payload.userId]
      );

      const user = users[0];
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        is_banned: user.is_banned,
      };

      next();
    } catch (err) {
      console.error('Socket auth failed:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, user: ${socket.user?.name} (${socket.user?.role})`);

    socket.on('join-room', async (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { userId: socket.user?.id, name: socket.user?.name });
      console.log(`User ${socket.user?.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId: socket.user?.id });
      console.log(`User ${socket.user?.id} left room ${roomId}`);
    });

    socket.on('send-message', async (data) => {
      const { conversationId, text, sender } = data;
      if (!conversationId || !text) return;

      try {
        const timestamp = new Date().toISOString();

        await pool.query(
          'INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)',
          [conversationId, sender || socket.user?.id, text, timestamp]
        );

        await pool.query(
          'UPDATE conversations SET last_message_at = ? WHERE id = ?',
          [timestamp, conversationId]
        );

        socket.to(conversationId).emit('receive-message', {
          conversationId,
          text,
          sender: sender || socket.user?.id,
          timestamp,
        });

        io.emit('new-notification', {
          type: 'message',
          title: 'New message',
          message: `You have a new message`,
          data: { conversationId, sender: socket.user?.id, senderName: socket.user?.name },
          recipientId: null,
        });
      } catch (err) {
        console.error('send-message error:', err);
      }
    });

    socket.on('mark-notification-read', async (notificationId) => {
      try {
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [
          notificationId,
          socket.user?.id,
        ]);
        socket.emit('notification-updated', { notificationId, isRead: true });
      } catch (err) {
        console.error('mark-notification-read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}, user: ${socket.user?.name}`);
    });
  });


  return {
    io,
    emitToUser(userId, event, data) {
      io.to(`user:${userId}`).emit(event, data);
    },
    emitToRoom(roomId, event, data) {
      io.to(roomId).emit(event, data);
    },
    emitNewNotification(userId, notification) {
      io.to(`user:${userId}`).emit('new-notification', notification);
    },
    emitStockUpdate(productId, stock) {
      io.to('stock-updates').emit('stock-update', { productId, stock });
    },
  };
}
