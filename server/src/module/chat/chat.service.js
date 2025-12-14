const conversationModel = require("./conversation.model");
const messageModel = require("./message.model");

class ChatService {
    saveRoom = async(data) => {
        const response = new conversationModel(data);
        return await response.save()
    }

    saveMessage = async(data) => {
        const response = new messageModel(data);
        return await response.save()
    }

    listMessage = async (req) => {
        const conversation = await conversationModel.find({
            members: req.loggedInUser._id
        })

        console.log('Testing', conversation)

        const conversationIds = conversation.map(c => c._id)

        console.log('Checking answer', conversationIds)

        const messages = await messageModel.find({
            conversation: {$in: conversationIds}
        })

        return messages
    }
}

const chatSvc = new ChatService();

module.exports = chatSvc