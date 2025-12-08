import axiosConfig from "../config/AxiosConfig"

class SellerService {
    listProducts = async(id: string, limit: number | 10, page: number | 1) => {
        const response = await axiosConfig.get('/seller/products', {
            params: {seller: id, limit: limit, page: page}
        })

        return response.data
    }

    createCategory = async(formData: FormData) => {
        const response = await axiosConfig.post(`/seller/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }

    deleteCategory = async (id: string) => {
        await axiosConfig.delete(`/seller/products/${id}`)
    }

    updateCategory = async(id: string, formData: FormData) => {
        await axiosConfig.put(`/seller/products/${id}`, formData)
    }

    productReview = async (id: string) => {
        const response = await axiosConfig.get(`/products/${id}/review`)
        return response
    }
}

const sellerSvc = new SellerService()

export default sellerSvc