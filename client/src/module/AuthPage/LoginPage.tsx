import { Input } from 'antd';
import { MdEmail, MdLock } from "react-icons/md";
import { Controller, useForm } from 'react-hook-form';
import { LoginValidatorDTO, type authLoginprops } from './auth.validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import authSvc from '../../service/auth.service';
import { ImSpinner9 } from 'react-icons/im';
import { useAppContext } from "../../context/AppContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const { setLoggedInUser } = useAppContext();

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
            setLoggedInUser(result.data);
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
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
                        <Link 
                            to="/auth/forget-password" 
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type='submit'
                        className={`flex items-center justify-center gap-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <ImSpinner9 className="animate-spin text-xl" />
                        ) : (
                            <>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                            to="/auth/register" 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;