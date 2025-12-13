const conversationModel = require("./conversation.model");

class ChatService {
    saveRoom = async(data) => {
        console.log(data)
        const response = new conversationModel({data});
        return await response.save()
    }
}

const chatSvc = new ChatService();

module.exports = chatSvc