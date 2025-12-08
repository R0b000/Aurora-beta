const express = require('express');
const cors = require('cors')
const route = require('./router.config');
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
require('./mongoose.config');

const app = express();

const allowedOrigins = [
    "https://aurorashop.free.nf",
    "http://localhost:5173",
    "http://localhost:4173"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 60 * 1000,
    max: 10000,
})

app.use(limiter)

app.use(helmet())

app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use(express.json({
    limit: '2mb'
}));

app.use('/api/', route);

app.get('/ping', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running"
    });
});

//Routing handling for the invalid urls 
app.use((req, res, next) => {
    res.status(404).json({
        data: '',
        code: 404,
        status: "Invalid Url",
        message: "Entered Url is invalid one check it again",
        options: null
    });
});

//Global Middleware
app.use((error, req, res, next) => {
    let data = error.data || null;
    let code = error.code || 500;
    let status = error.status || "Server Timeout";
    let message = error.message || "Connection failed. Try again after sometime";
    let options = error.options || null;

    res.status(code).json({
        data: data,
        status: status,
        message: message,
        options: options
    })
})

module.exports = app;