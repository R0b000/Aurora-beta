export interface ProductDetailsInterface {
    _id: string,
    seller: string,
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