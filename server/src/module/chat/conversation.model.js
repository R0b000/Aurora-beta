const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const conversationModel = new mongoose.model('Conversation', conversationSchema);

module.exports = conversationModel