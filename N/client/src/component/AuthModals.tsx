import { Input, Select } from 'antd';
import { MdEmail, MdLock, MdPerson, MdPhone } from "react-icons/md"
import { Controller, useForm } from 'react-hook-form';
import { LoginValidatorDTO, RegisterValidatorDTO, type authLoginprops, type authRegisterprops } from '../module/AuthPage/auth.validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import authSvc from '../service/auth.service';
import { ImSpinner9 } from 'react-icons/im';
import { useAppContext } from "../context/AppContext";
import { useState } from 'react';

interface AuthModalProps {
    type: 'login' | 'register' | null;
    onClose: () => void;
}

const LoginModal = ({ type, onClose }: AuthModalProps) => {
    const navigate = useNavigate();
    const { setLoggedInUser, setAuthModal } = useAppContext();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<authLoginprops>({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: yupResolver(LoginValidatorDTO)
    });

    const submitForm = async (data: authLoginprops) => {
        try {
            const result = await authSvc.loginUser(data);
            setLoggedInUser(result.data.user);
            onClose();
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    if (type !== 'login') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    &times;
                </button>
                
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
                    <p className="text-gray-600 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Controller
                            name='email'
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    size="large"
                                    placeholder="Enter your email"
                                    prefix={<MdEmail className="text-gray-400 text-xl" />}
                                    className="rounded-lg"
                                />
                            )}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <Controller
                            name='password'
                            control={control}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    size="large"
                                    placeholder="Enter your password"
                                    prefix={<MdLock className="text-gray-400 text-xl" />}
                                    className="rounded-lg"
                                />
                            )}
                        />
                        {errors.password && (
                            <span className="text-red-500 text-xs">{errors.password.message}</span>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setAuthModal('register');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type='submit'
                        className={`flex items-center justify-center gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <ImSpinner9 className="animate-spin text-xl" />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <button
                            type="button"
                            onClick={() => setAuthModal('register')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Create one
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RegisterModal = ({ type, onClose }: AuthModalProps) => {
    const [clickNext, setClickNext] = useState(false);
    const { setLoginClick, setAuthModal } = useAppContext();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting }, trigger, getValues, setError } = useForm<authRegisterprops>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: 'customer',
            phone: ''
        },
        resolver: yupResolver(RegisterValidatorDTO),
        mode: "onSubmit"
    });

    const submitForm = async (data: authRegisterprops) => {
        try {
            await authSvc.registerUser(data);
            setLoginClick(true);
            onClose();
            setAuthModal('login');
        } catch (error) {
            throw error;
        }
    };

    const handleNext = async () => {
        const valid = await trigger(['name', 'email', 'password']);
        if (!valid) return;

        let email = getValues('email');
        const response = await authSvc.checkEmail(email);

        if (response.data.code === 404) {
            setError("email", {
                type: "manual",
                message: "Email already exists",
            });
            return;
        }
        setClickNext(true);
    };

    if (type !== 'register') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    &times;
                </button>
                
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
                    <p className="text-gray-600 text-sm">Join us today</p>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-3">
                    {!clickNext ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <Controller
                                    name='name'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            size="large"
                                            placeholder="Enter your full name"
                                            prefix={<MdPerson className="text-gray-400 text-xl" />}
                                            className="rounded-lg"
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <span className="text-red-500 text-xs">{errors.name.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <Controller
                                    name='email'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            size="large"
                                            placeholder="Enter your email"
                                            prefix={<MdEmail className="text-gray-400 text-xl" />}
                                            className="rounded-lg"
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <span className="text-red-500 text-xs">{errors.email.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <Controller
                                    name='password'
                                    control={control}
                                    render={({ field }) => (
                                        <Input.Password
                                            {...field}
                                            size="large"
                                            placeholder="Create a password"
                                            prefix={<MdLock className="text-gray-400 text-xl" />}
                                            className="rounded-lg"
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <span className="text-red-500 text-xs">{errors.password.message}</span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Account Type</label>
                                <Controller
                                    name='role'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            size="large"
                                            defaultValue="customer"
                                            className="w-full rounded-lg"
                                            options={[
                                                { label: 'Customer', value: 'customer' },
                                                { label: 'Seller', value: 'seller' },
                                            ]}
                                        />
                                    )}
                                />
                                {errors.role && (
                                    <span className="text-red-500 text-xs">{errors.role.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Controller
                                    name='phone'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            size="large"
                                            placeholder="Enter your phone number"
                                            prefix={<MdPhone className="text-gray-400 text-xl" />}
                                            className="rounded-lg"
                                        />
                                    )}
                                />
                                {errors.phone && (
                                    <span className="text-red-500 text-xs">{errors.phone.message}</span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setClickNext(false)}
                                    className="flex-1 h-11 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type='submit'
                                    className={`flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <ImSpinner9 className="animate-spin text-xl" />
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <button
                        type="button"
                        onClick={() => setAuthModal('login')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export { LoginModal, RegisterModal };