const socketAuth = require('./socket.auth')

io.use(socketAuth)

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.user);

  socket.on("message", (data) => {
    console.log("Message from:", socket.user._id, data);
  });
});