import { Input, Select } from "antd"
import { Controller, useForm } from "react-hook-form"
import { MdEmail, MdLock, MdPerson, MdPhone } from "react-icons/md"
import { RegisterValidatorDTO, type authRegisterprops } from "./auth.validation"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import authSvc from "../../service/auth.service"
import { ImSpinner9 } from "react-icons/im"
import { useAppContext } from "../../context/AppContext"

const RegisterPage = () => {
    const [clickNext, setClickNext] = useState(false);
    const { setLoginClick } = useAppContext();
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
            navigate('/auth/login');
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join us today</p>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
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
                                className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
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
                                    className="flex-1 h-12 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type='submit'
                                    className={`flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link 
                            to="/auth/login" 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;