import axiosConfig from "../config/AxiosConfig";

class ChatService {
    createRoom = async(id: string) => {
        const response = await axiosConfig.get('/chat/create-room', {
            params: {sellerId: id}
        })

        return response
    }
}

const chatSvc = new ChatService();

export default chatSvc