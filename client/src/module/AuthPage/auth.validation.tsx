import * as yup from 'yup'

export interface authLoginprops {
    email: string,
    password: string,
}

export const Role = {
    Customer: 'customer',
    Seller: 'seller'
} as const

export type Role = typeof Role[keyof typeof Role];

export interface authRegisterprops {
    name: string,
    email: string,
    password: string,
    role: Role,
    phone: string,
}

export interface forgetPasswordProps {
    email: string,
}

export interface resetPasswordProps {
    password: string,
    confirmPassword: string
}

export const forgetPasswordValidation = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required")
})

export const resetPasswordValidation = yup.object().shape({
    password: yup
        .string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
            "Password must include uppercase, lowercase, number, and special character")
        .required("Password is required"),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
})

export const LoginValidatorDTO = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
})

export const RegisterValidatorDTO = yup.object().shape({
    name: yup.string().min(4).max(30).required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
            "Password must include uppercase, lowercase, number, and special character")
        .required("Password is required"),
    role: yup
        .mixed<Role>()
        .oneOf(Object.values(Role), "Invalid role")
        .required("Role is required"),

    phone: yup
        .string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
})