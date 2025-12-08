import axiosConfig from "../config/AxiosConfig";
import type { cartValidationProps } from "../module/Customer/customer.validator";

class CustomerService {
    addToCart = async (data: cartValidationProps, productId: string) => {
        const response = await axiosConfig.post(`/cart/items`, data, {
            params: {
                id: productId
            }
        })

        return response
    }

    listCart = async () => {
        let response = await axiosConfig.get('/cart/list');
        return response
    }

    getSingleCartById = async (id: string) => {
        let response = await axiosConfig.get(`/cart/items/${id}`)
        return response
    }

    updateCartById = async (id: string, data: cartValidationProps) => {
        await axiosConfig.put(`/cart/items/${id}`, data)
    }

    deleteCartById = async (id: string) => {
        await axiosConfig.delete(`/cart/items/${id}`)
    }

    checkout = async (id: string) => {
        const response = await axiosConfig.post(`checkout/${id}`)
        return response.data
    }

    orderItem = async () => {
        const response = await axiosConfig.get(`/checkout/list`)
        return response.data
    }

    onlinePayment = async (id: string) => {
        const response = await axiosConfig.post(`/checkout/payment/${id}`)
        return response
    }

    savePayment = async (query: any) => {
        const response = await axiosConfig.post('/payment/payment-success', {
            amount: query.amount,
            mobile: query.mobile,
            pidx: query.pidx,
            purchase_order_id: query.purchase_order_id,
            purchase_order_name: query.purchase_order_name,
            status: query.status,
            tidx: query.tidx,
            total_amount: query.total_amount,
            transaction_id: query.transaction_id,
            txnId: query.txnId
        })

        return response.data
    }

    getOrderItems = async() => {
        const response = await axiosConfig.get(`/checkout/list`)
        return response.data 
    }
}

const customerSvc = new CustomerService();

export default customerSvc;