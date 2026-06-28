import api from '../config/AxiosConfig';

class SellerService {
  listProducts = async (id: string, limit = 10, page = 1) => {
    const response = await api.get('/seller/products', {
      params: { seller: id, limit, page },
    });
    return response.data;
  };

  createProduct = async (formData: FormData) => {
    const response = await api.post('/seller/products', formData);
    return response.data;
  };

  updateProduct = async (id: string, formData: FormData) => {
    const response = await api.put(`/seller/products/${id}`, formData);
    return response.data;
  };

  deleteProduct = async (id: string) => {
    await api.delete(`/seller/products/${id}`);
  };

  getProductReviews = async (id: string) => {
    const response = await api.get(`/products/${id}/reviews`);
    return response;
  };
}

const sellerSvc = new SellerService();
export default sellerSvc;