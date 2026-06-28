import api from "../config/AxiosConfig";
import type { authLoginprops, authRegisterprops } from "../module/AuthPage/auth.validation";

class authService {
    async checkEmail(email: string) {
        const response = await api.get('/auth/register', {
            params: { email }
        });
        return response;
    }

    async registerUser(data: authRegisterprops) {
        try {
            const response = await api.post('/auth/register', data);
            const { accessToken, refreshToken } = response.data.data;
            localStorage.setItem('actualToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async loginUser(data: authLoginprops) {
         try {
             const response = await api.post('/auth/login', data);
             const { accessToken, refreshToken } = response.data.data;
             localStorage.setItem('actualToken', accessToken);
             localStorage.setItem('refreshToken', refreshToken);
             return response.data;
         } catch (error) {
             throw error;
         }
     }

    async getMyProfile() {
        try {
            const token = localStorage.getItem('actualToken');
            if (!token) return null;
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            return null;
        }
    }

    async activateAccount(id: string) {
        const response = await api.put(`/auth/activate/account/${id}`);
        return response;
    }

    async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('actualToken');
        localStorage.removeItem('refreshToken');
    }
}

const authSvc = new authService();
export default authSvc;