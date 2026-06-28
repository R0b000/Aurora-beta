import { Controller, useForm } from "react-hook-form"
import { resetPasswordValidation, type resetPasswordProps } from "./auth.validation"
import { yupResolver } from "@hookform/resolvers/yup"
import { Input } from "antd"
import { AiOutlineUser } from "react-icons/ai"
import { useNavigate } from "react-router-dom"

const ResetPassword = () => {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm<resetPasswordProps>({
        defaultValues: {
            password: '',
            confirmPassword: ''
        },
        resolver: yupResolver(resetPasswordValidation),
        mode: 'onSubmit'
    })

    const submitForm = () => {
        try {
            
        } catch (error) {
            console.log("Errors", errors)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(submitForm)}>
                <div className='flex flex-col h-[22vh] items-center justify-center w-full'>
                    <div className='flex flex-col relative h-[9vh] w-full'>
                        <Controller
                            name='password'
                            control={control}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    style={{ height: '45px' }}
                                    placeholder="New Password"
                                    prefix={<AiOutlineUser style={{ color: 'rgba(0,0,0,.25)' }} />}
                                />
                            )}
                        />
                        <div className='absolute bottom-2 left-1 text-red-500/90'>
                            {errors.password?.message}
                        </div>
                    </div>
                    <div className='flex flex-col relative h-[9vh] w-full'>
                        <Controller
                            name='confirmPassword'
                            control={control}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    style={{ height: '45px' }}
                                    placeholder="Conform New Password"
                                    prefix={<AiOutlineUser style={{ color: 'rgba(0,0,0,.25)' }} />}
                                />
                            )}
                        />
                        <div className='absolute bottom-2 left-1 text-red-500/90'>
                            {errors.confirmPassword?.message}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-7 h-[14vh]'>
                    <button
                        className={`flex bg-green-950 w-full h-[6vh] p-2 rounded-md text-white items-center justify-center header-title text-xl`}
                        type='submit'
                    >
                        SEND RESET LINK
                    </button>
                    <button onClick={() => navigate('/auth/login')} className='flex w-full bg-gray-300 rounded-md p-2 items-center justify-center text-gray-700 h-[6vh]'>
                        Back to Log In
                    </button>
                </div>
            </form>
        </>
    )
}

export default ResetPassword