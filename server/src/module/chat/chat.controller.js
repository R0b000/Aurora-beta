const chatSvc = require("./chat.service");

class ChatController {
    createRoom = async (req, res, next) => {
        try {   
            const sellerId = (req.query.sellerId)
            const member = [sellerId, req.loggedInUser._id];
            
            //create the room and save it 
            const response = await chatSvc.saveRoom(member);
            console.log(response)

            res.json({
                data: response, 
                code: 200, 
                status: "Success",
                message: "Success",
            })
        } catch (error) {
            throw error
        }
    }
}

const chatCtrl = new ChatController();

module.exports = chatCtrl