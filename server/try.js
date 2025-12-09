const io = require("socket.io-client");

const socket = io("http://localhost:8001", {
    auth: {
        token: "Bearer weqeqwesdfsd2324sv"
    }
});

socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.on("welcome", msg => console.log("Server:", msg));