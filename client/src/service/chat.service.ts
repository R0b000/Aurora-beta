import axiosConfig from "../config/AxiosConfig";

class ChatService {
    createRoom = async(id: string) => {
        const response = await axiosConfig.get('/chat/create-room', {
            params: {sellerId: id}
        })

        return response
    }

    createMessage = async(sender: string, conversation: string, data:any ) => {
        const response = await axiosConfig.post('/chat/message', data, {
            params: {
                sender: sender, 
                conversation: conversation
        }})

        console.log(response)
        return response
    }

    listMessage = async() => {
        const response = await axiosConfig.get('/chat/message/list')

        console.log(response.data)
        return response
    }

    getMessages = async (id: string) => {
        const response = await axiosConfig.get(`/chat/message/${id}`)
        console.log('Checking form servc', response.data)
        return response;
    }
}

const chatSvc = new ChatService();

export default chatSvc