const chatCtrl = require('./chat.controller');
const chatRouter = require('express').Router();

chatRouter.get('/create-room', chatCtrl.createRoom)

module.exports = chatRouter