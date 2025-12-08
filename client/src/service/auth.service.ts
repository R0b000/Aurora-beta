import axiosConfig from "../config/AxiosConfig";
import type { authLoginprops, authRegisterprops } from "../module/AuthPage/auth.validation";

class authService {
    async checkEmail(email: string) {
        const response = await axiosConfig.get('/auth/register', {
            params: {
                email: email
            }
        })
        return response;
    }

    async registerUser(data: authRegisterprops) {
        try {
            const response = await axiosConfig.post('/auth/register', data);
            return response;
        } catch (error) {
            throw error
        }
    }

    async loginUser(data: authLoginprops) {
        try {
            const response = await axiosConfig.post('/auth/login', data);
            localStorage.setItem('actualToken', response.data.data.actualToken)
            localStorage.setItem('refreshToken', response.data.data.refreshToken)
            return response
        } catch (error) {
            throw error
        }
    }

    async getMyProfile() {
        try {
            const response = await axiosConfig.get('/auth/me')
            return response.data.data
        } catch (error) {
            throw error
        }
    }

    activateAccount = async (id: string) => {
        const response = await axiosConfig.post(`/auth/activate/account/${id}`)
        return response
    }
}

const authSvc = new authService();

export default authSvc