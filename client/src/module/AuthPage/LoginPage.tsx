import { Input } from 'antd';
import { AiOutlineUser } from "react-icons/ai";
import { Controller, useForm } from 'react-hook-form';
import { LoginValidatorDTO, type authLoginprops } from './auth.validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import authSvc from '../../service/auth.service';
import { ImSpinner9 } from 'react-icons/im';

const LoginPage = () => {
    const navigate = useNavigate()

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<authLoginprops>({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: yupResolver(LoginValidatorDTO)
    })

    const submitForm = async (data: authLoginprops) => {
        try {
            await authSvc.loginUser(data);
            navigate('/')
        } catch (error) {
            throw error
        }
    }

    return (
        <>
            <div className="flex w-full justify-center items-center">
                <form onSubmit={handleSubmit(submitForm)} className='flex flex-col w-full p-2'>
                    <div className='flex flex-col h-[18vh]'>
                        <div className='flex flex-col relative h-[9vh]'>
                            <Controller
                                name='email'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        style={{ height: '45px' }}
                                        placeholder="Enter your username"
                                        prefix={<AiOutlineUser style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    />
                                )}
                            />
                            <div className='absolute bottom-2 left-1 text-red-500/90'>
                                {errors.email?.message}
                            </div>
                        </div>
                        <div className='flex flex-col relative h-[9vh]'>
                            <Controller
                                name='password'
                                control={control}
                                render={({ field }) => (
                                    <Input.Password
                                        {...field}
                                        style={{ height: '45px' }}
                                        placeholder="Enter your password"
                                        prefix={<AiOutlineUser style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        suffix
                                    />
                                )}
                            />
                            <div className='absolute bottom-2 left-1 text-red-500/90'>
                                {errors.password?.message}
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-7 h-[22vh]'>
                        <div className='flex cursor-pointer w-full p-2 items-center justify-center text-gray-700 underline'>
                            Don't have a account? Join Now?
                        </div>
                        {!isSubmitting &&
                            <button
                                className={`flex cursor-pointer bg-green-950 w-full h-[6vh] p-2 rounded-md text-white items-center justify-center header-title text-xl`}
                                type='submit'
                            >
                                Log In
                            </button>
                        }
                        {isSubmitting &&
                            < div className="flex w-full bg-green-950 h-[6vh] shrink-0 text-white header-title items-center justify-center rounded-md">
                                <ImSpinner9 className="animate-spin" />
                            </div>
                        }
                        <button
                            onClick={() => {
                                navigate('/auth/forget-password')
                            }}
                            className={`flex cursor-pointer bg-gray-400 w-full h-[6vh] p-2 rounded-md text-white items-center justify-center header-title text-xl`}
                        >
                            Forget Password
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default LoginPage