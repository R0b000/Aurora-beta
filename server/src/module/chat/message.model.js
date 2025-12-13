const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const messageModel = new mongoose.model('Message', messageSchema);

module.exports = messageModel