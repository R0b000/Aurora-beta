import * as yup from 'yup'
import type { ListCategoryDetails, ListProductDetails } from '../HomePage/homepage.validation'
import dayjs from 'dayjs'

export interface createCategoryProps {
    name: string,
}

export const categoryValidationDTO = yup.object().shape({
    name: yup.string().required('Category name is required.'),
    image: yup.string().nullable()
})

export const BannerType = {
    Homepage: 'homepage',
    Category: 'category'
} as const

export type BannerType = typeof BannerType[keyof typeof BannerType]

export interface createBannerProps {
    title: string,
    type: BannerType,
    image?: string | null,
    startAt: dayjs.Dayjs,
    endAt: dayjs.Dayjs,
    isActive?: boolean | null,
    priority?: number | null
}

export const BannerValidationDTO = yup.object().shape({
    title: yup.string().required("Title is required."),
    startAt: yup.mixed<dayjs.Dayjs>().required('Start date is required'),
    endAt: yup.mixed<dayjs.Dayjs>().required('End date is required'),
    type: yup.mixed<BannerType>().oneOf(Object.values(BannerType), "Invalid Type").required("Type is required"),
    image: yup.string().nullable(),
    isActive: yup.boolean().nullable(),
    priority: yup.number().nullable(),
})

export const couponType = {
    Percentage: 'percentage',
    Fixed: 'fixed'
} as const

export type couponType = typeof couponType[keyof typeof couponType]

export interface createCouponProps {
    discountType: couponType,
    discountValue: number,
    validFrom?: dayjs.Dayjs | null,
    validUntil?: dayjs.Dayjs | null,
    applicableCategories?: Array<string> | null,
}

export const CouponValidationDTO = yup.object().shape({
    discountType: yup.mixed<couponType>().oneOf(Object.values(couponType), 'Invalid Type').required('Type is required'),
    discountValue: yup.number().required("Discount value is required").min(1, `Discount value can't be smaller than 1`),
    validFrom: yup.mixed<dayjs.Dayjs>().nullable(),
    validUntil: yup.mixed<dayjs.Dayjs>().nullable(),
    applicableCategories: yup.array().nullable(),
})

export interface listUserProps {
    _id: string,
    name: string,
    email: string,
    role: string,
    phone: string,
    isVerified: boolean,
    isBan: boolean,
    avatar: {
        public_id: string,
        secure_url: string,
        optimizedUrl: string
    },
    sellerProfile: {
        companyName: string,
        gstNumber: string,
        bio: string,
        address: string,
        rating: number,
        totalReviews: number
    },
    addresses: {
        label: string,
        fullName: string,
        phone: number,
        line1: string,
        line2: string,
        city: string,
        state: string,
        postalCode: string,
        country: string,
        isDefault: string
    }[],
    favourites: [string]
}

export interface BannerProps {
    _id: string;
    title: string;
    subtitle: string;
    type: string;
    startAt: string; // ISO date string
    endAt: string;   // ISO date string
    isActive: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    image: {
        public_id: string;
        secure_url: string;
    };
}

export interface CouponProps {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed'; // assuming you may have fixed amount discount as well
    discountValue: number;
    validFrom: string; // or Date if you plan to convert it
    validUntil: string; // or Date
    isActive: boolean;
    applicableCategories: string[];
    __v: number;
}

export interface payloadCouponProps {
    discountType: couponType; // assuming you may have fixed amount discount as well
    discountValue: string | number;
    validFrom: string; // or Date if you plan to convert it
    validUntil: string; // or Date
    applicableCategories: string[];
}

export interface updatePayloadCouponProps {
    discountType?: couponType; // assuming you may have fixed amount discount as well
    discountValue?: string | number;
    validFrom?: string; // or Date if you plan to convert it
    validUntil?: string; // or Date
    applicableCategories?: string[];
}

export interface BannerResponse {
    code: number;
    data: BannerProps[];
    message: string;
    options: {
        total: number;
    };
    status: string;
}

export interface CouponResponse {
    code: number;
    data: CouponProps[];
    message: string;
    options: {
        total: number;
    };
    status: string;
}

export interface UserResponse {
    code: number;
    data: listUserProps[];
    message: string;
    options: {
        total: number;
    };
    status: string;
}

export interface CategoryResponse {
    code: number;
    data: ListCategoryDetails[];
    message: string;
    options: {
        total: number;
    };
    status: string;
}

export interface ProductResponse {
    code: number;
    data: ListProductDetails[];
    message: string;
    options: {
        total: number,
        page: number,
        limit: number,
    };
    status: string;
}

export type createBannerPageProps = {
    onBannerCreated?: () => void
}