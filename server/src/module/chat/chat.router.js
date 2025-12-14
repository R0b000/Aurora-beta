const chatCtrl = require('./chat.controller');
const chatRouter = require('express').Router();

chatRouter.get('/create-room', chatCtrl.createRoom)
chatRouter.post('/message', chatCtrl.createMessage)
chatRouter.get('/message/list', chatCtrl.listMessage)

module.exports = chatRouter