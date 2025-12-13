require('dotenv').config();
const http = require('http');
const app = require('./src/config/express.config');
const { Server } = require('socket.io')

// Move this BEFORE creating http server
if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Running in production mode');
    app.set('trust proxy', 1);

    const compression = require('compression');
    app.use(compression());
} else {
    console.log('🧑‍💻 Running in development mode');
}

const PORT = process.env.PORT || 8001;
const URL = '0.0.0.0'
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: ['http://localhost:5173']
})

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.emit('welcome', "Welcome to the server!");

    socket.on('message', (msg) => {
        console.log('Message from client', msg)
    })

    socket.on('disconnect', () => {
        console.log("Disconnected:", socket.id)
    })
})

app.set('io', io)

httpServer.listen(PORT, URL, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server running on url ${URL}`);
});
