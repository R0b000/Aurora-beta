import axios from "axios";

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    // timeout: 5000,
    headers: { 'X-Custom-Header': 'foobar' }
});

axiosConfig.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('actualToken') || null

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    }, function (error) {
    return Promise.reject(error)
})

axios.interceptors.response.use(function (response) {
    return response
}, function (error) {
    return Promise.reject(error)
})

export default axiosConfig