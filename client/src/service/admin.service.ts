import axiosConfig from "../config/AxiosConfig";
import type { payloadCouponProps, updatePayloadCouponProps } from "../module/Admin/admin.validator";

class AdminService {
    async listUsers() {
        const response = await axiosConfig.get('/admin/users');
        return response.data;
    }

    async listCategory() {
        const response = await axiosConfig.get('/admin/category');
        return response.data
    }

    async listActiveBanners(isActive: boolean | null) {
        const response = await axiosConfig.get('/admin/banners/list', {
            params: isActive ? {isActive: isActive} : {}
        })
        return response.data
    }

    async listActiveCoupons(isActive?: boolean | null) {
        const response = await axiosConfig.get('/admin/coupon/list', {
            params: isActive ? {isActive: isActive} : {}
        })
        return response.data
    }

    async bannerDetailsById(id: string) {
        const response = await axiosConfig.get(`/admin/banners/${id}`)
        return response.data.data
    }

    async categoryDetailsById(id: string) {
        const response = await axiosConfig.get(`/admin/category/${id}`)
        return response.data.data
    }

    async createCategoty(formData: FormData) {
        await axiosConfig.post('/admin/category', formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
    }

    async createBanners(formData: FormData) {
        const response = await axiosConfig.post('/admin/banners', formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        return response.data
    }

    async updateBannerById(formData: FormData, id: string) {
        const response = await axiosConfig.put(`/admin/banners/${id}`, formData)
        return response.data
    }

    async bannerDeleteById(id: string) {
        await axiosConfig.delete(`/admin/banners/${id}`)
    }

    async categoryDeleteById(id: string) {
        await axiosConfig.delete(`/admin/category/${id}`)
    }

    async updateCategoryById(formData: FormData, id: string) {
        const response = await axiosConfig.put(`/admin/category/${id}`, formData)
        return response.data
    }

    async createCoupon (payload: payloadCouponProps) {
        const response = await axiosConfig.post('/admin/coupon/create/', payload);
        return response.data;
    }

    async deleteCouponById(id: string) {
        await axiosConfig.delete(`/admin/coupon/${id}`)
    }

    async getSingleCouponById(id: string) {
       const response =  await axiosConfig.get(`/admin/coupon/${id}`)
       return response.data
    }

    async updateCouponById(payload: updatePayloadCouponProps, id: string) {
        const response = await axiosConfig.put(`/admin/coupon/${id}`, payload);
        return response.data;
    }

    async getSingleUserById(id: string) {
        const response = await axiosConfig.get(`/admin/users/${id}`)
        return response.data
    }

    async getSellerProduct(id: string) {
        const response = await axiosConfig.get(`/admin/products`, {
            params: {seller: id}
        });
        return response.data;
    }

    async updateUserBan(id: string, banValue: boolean) {
        await axiosConfig.put(`/admin/users/${id}`, {
            isBan: banValue
        })
    }

    async deleteUser(id: string) {
        await axiosConfig.delete(`/admin/users/${id}`)
    }
}

const adminSvc = new AdminService();

export default adminSvc