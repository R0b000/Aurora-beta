import axiosConfig from "../config/AxiosConfig"

class PublicService {
    listCategories = async() => {
        let response = await axiosConfig.get('/categories');
        return response
    }

    listProduct = async (id?: string, signal?: AbortSignal) => {
        let response = await axiosConfig.get('/products', {
            params: id ? { id } : {},
            signal
        })
        return response
    }

    getProductById = async (id: string, signal?: AbortSignal) => {
        let response = await axiosConfig.get(`/products/${id}`, { signal });
        return response
    }

    searchProduct = async(title?: string, signal?: AbortSignal) => {
        let response = await axiosConfig.get(`/search`, {
            params: title ? { title: title } : {},
            signal
        })
        return response
    }

    MoreProduct = async (page: number | 1, limit: number | 10) => {
        let response = await axiosConfig.get('/products', {
            params: {page: page, limit: limit}
        })

        return response
    }
}

const publicSvc = new PublicService()

export default publicSvc