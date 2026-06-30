import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initializeSocket } from './socket/index.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const socketManager = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { socketManager };