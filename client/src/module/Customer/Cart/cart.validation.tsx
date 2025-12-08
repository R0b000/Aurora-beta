import type { CouponProps, listUserProps } from "../../Admin/admin.validator";
import type { ListProductDetails } from "../../HomePage/homepage.validation";

export interface CartDetails {
    items: {
        product: ListProductDetails,
        quantity: number,
        price: number,
    },
    _id: string,
    user: listUserProps,
    isActive: boolean,
    coupon: CouponProps,
}

export interface CartResponse {
    data: CartDetails[],
    message: string,
    code: number,
    options: {
        page: number,
        total: number,
        limit: number,
    }
}