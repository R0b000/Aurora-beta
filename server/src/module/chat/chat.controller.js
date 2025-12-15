const chatSvc = require("./chat.service");
const conversationModel = require("./conversation.model");

class ChatController {
    createRoom = async (req, res, next) => {
        try {
            const sellerId = (req.query.sellerId)
            const members = [sellerId, req.loggedInUser._id];
            const createdAt = Date.now().toString();

            const checkMembers = await conversationModel.findOne({
                members: { $all: members }
            })

            const data = {
                members,
                createdAt
            }

            //create the room and save it 
            if (!checkMembers) {
                const response = await chatSvc.saveRoom(data);

                res.json({
                    data: response,
                    code: 200,
                    status: "Success",
                    message: "Success",
                })
            }

            res.json({
                data: checkMembers,
                code: 200,
                status: "Conversation Id already created.",
                message: "Conversation Id already created."
            })
        } catch (error) {
            throw error
        }
    }

    createMessage = async (req, res, next) => {
        try {
            let { conversation, sender } = req.query
            const text = req.body.message
            console.log('Backend query datas', conversation, sender, text)

            const data = {
                conversation: conversation,
                sender: sender,
                text: text
            }

            const response = await chatSvc.saveMessage(data);

            res.json({
                data: response,
                code: 200,
                status: 'Success',
                message: 'Success'
            })
        } catch (error) {
            console.log(error)
        }
    }

    listMessage = async (req, res, next) => {
        try {
            const { messages, conversation } = await chatSvc.listMessage(req)

            res.json({
                data: {
                    messages, conversation
                },
                code: 200,
                message: "Success",
                status: "Success"
            })
        } catch (error) {
            throw error
        }
    }

    listRoomMessages = async (req, res, next) => {
        try {   
            const id = req.params.id;

            const response = await chatSvc.listRoomMessages({
                conversation: id
            })

            res.json({
                data: response, 
                code:200,
                status: 'Success',
                message: 'Success'
            })
        } catch (error) {
            throw error
        }
    }
}

const chatCtrl = new ChatController();

module.exports = chatCtrl