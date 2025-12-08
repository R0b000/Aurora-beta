import * as Yup from "yup";

export interface sellerCreateProduct {
    title: string,
    slug: string,
    category: string[],
    price: number,
    currency: string,
    stock: number,
    weight: number,
    dimensions: string,
    shippingClass: string,
    isPublished: boolean,
    variants: string,
    attributes: string,
    description: string,
    images: string[],
}

export const sellerCreateProductSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required"),

    slug: Yup.string()
        .nullable(),

    category: Yup.array()
        .of(Yup.string())
        .nullable(),

    price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .positive("Price must be positive"),

    currency: Yup.string()
        .required("Currency is required"),

    stock: Yup.number()
        .typeError("Stock must be a number")
        .required("Stock is required")
        .min(0, "Stock cannot be negative"),

    weight: Yup.number()
        .typeError("Weight must be a number")
        .nullable(),

    dimensions: Yup.string()
        .nullable(),

    shippingClass: Yup.string()
        .nullable(),

    isPublished: Yup.boolean()
        .nullable(),

    variants: Yup.string()
        .nullable(),

    attributes: Yup.string()
        .nullable(),

    description: Yup.string()
        .nullable(),

    images: Yup.array()
        .of(Yup.mixed())
        .min(1, 'At least 1 image is required')
        .max(5, 'You can upload a maximum of 5 images')

});
