import type { Role } from "../AuthPage/auth.validation";

export interface ProductDetailsInterface {
    _id: string,
    seller: {
        address: string[],
        avatar: {
            public_id: string, 
            secure_url: string, 
            optimized_url: string
        },
        email: string, 
        favourites: string[],
        isBan: boolean, 
        isVerified: boolean, 
        name: string,
        phone: string, 
        role: Role,
        sellerProfile: {
            rating: number, 
            totalReview: number,
        },
        _id: string
    },
    title: string,
    slug: string,
    description: string,
    category: {
        image: {
            public_id: string,
            secure_url: string,
        },
        id: string,
        name: string,
        slug: string,
    }[];
    price: number,
    currency: string,
    stock: number,
    images: {
        public_id: string,
        secure_url: string,
        _id: string
    }[],
    variants: string,
    attributes: string,
    weight: string,
    dimensions: string,
    shippingClass: string,
    isPublished: boolean,
    isFeatured: boolean,
    rating: number
    totalReviews: number
}