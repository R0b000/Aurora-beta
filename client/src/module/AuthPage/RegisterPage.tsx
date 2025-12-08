import { Input, Select, Space } from "antd"
import { Controller, useForm } from "react-hook-form"
import { AiOutlinePhone, AiOutlineUser } from "react-icons/ai"
import { RegisterValidatorDTO, type authRegisterprops } from "./auth.validation"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import authSvc from "../../service/auth.service"
import { useAppContext } from "../../context/AppContext"
import { ImSpinner9 } from "react-icons/im"

const RegisterPage = () => {
    const [clickNext, setClickNext] = useState<boolean>(false)
    const { setLoginClick } = useAppContext();
    const navigate = useNavigate()

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
    })

    const submitForm = async (data: authRegisterprops) => {
        try {
            await authSvc.registerUser(data);
            setLoginClick(true)
            navigate('/auth/login')
        } catch (error) {
            throw error
        }
    }

    return (
        <>
            <div className="flex w-full justify-center items-center">
                <form onSubmit={handleSubmit(submitForm)} className={`flex flex-col w-full p-2 `}>
                    <div
                        className={`flex flex-col
                        ${clickNext ? "hidden" : "visible"} 
                    `}>
                        <div className='flex flex-col relative h-[9vh]'>
                            <Controller
                                name='name'
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
                                {errors.name?.message}
                            </div>
                        </div>
                        <div className='flex flex-col relative h-[9vh]'>
                            <Controller
                                name='email'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        style={{ height: '45px' }}
                                        placeholder="Enter your email"
                                        prefix={<AiOutlineUser style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    />
                                )}
                            />
                            <div className='absolute bottom-2 left-1 text-red-500/90'>
                                {errors.email?.message}
                            </div>
                        </div>
                        <div className='flex flex-col relative h-[10vh]'>
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
                            <div className='absolute bottom-0 left-1 text-red-500/90'>
                                {errors.password?.message}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex flex-col
                        ${clickNext ? "visible" : "hidden"} 
                    `}>
                        <div className='flex flex-col relative h-[10vh] gap-1'>
                            <div className="flex px-1">
                                Select your role
                            </div>
                            <Controller
                                name='role'
                                control={control}
                                render={({ field }) => (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Select
                                            {...field}
                                            size='large'
                                            defaultValue="customer"
                                            className="w-full"
                                            options={[
                                                { label: 'Customer', value: 'customer' },
                                                { label: 'Seller', value: 'seller' },
                                            ]}
                                        />
                                    </Space>
                                )}
                            />
                            <div className='absolute bottom-2 left-1 text-red-500/90'>
                                {errors.role?.message}
                            </div>
                        </div>
                        <div className='flex flex-col relative h-[9vh]'>
                            <Controller
                                name='phone'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        style={{ height: '45px' }}
                                        placeholder="Enter your phone number"
                                        prefix={<AiOutlinePhone style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    />
                                )}
                            />
                            <div className='absolute bottom-2 left-1 text-red-500/90'>
                                {errors.phone?.message}
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-col gap-5
                        ${clickNext ? "hidden" : "visible"} 
                    `}>
                        <div className='flex cursor-pointer w-full p-2 items-center justify-center text-gray-700 underline'>
                            Already have a account? Log In
                        </div>
                        <button
                            className={`flex cursor-pointer bg-green-950 w-full h-[6vh] p-2 rounded-md text-white items-center justify-center header-title text-xl`}
                            onClick={async () => {
                                const valid = await trigger(['name', 'email', 'password'])
                                if (!valid) return;

                                let email = getValues('email')

                                const response = await authSvc.checkEmail(email);

                                if (response.data.code === 404) {
                                    setError("email", {
                                        type: "manual",
                                        message: "Email already exists",
                                    });

                                    return;
                                }
                                setClickNext(true);
                            }}
                        >
                            Next
                        </button>
                    </div>
                    <div className={`flex flex-col gap-7
                        ${clickNext ? "visible" : "hidden"}
                    `}>
                        <div className='flex cursor-pointer w-full p-2 items-center justify-center text-gray-700 underline'>
                            Already have a account? Log In
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
                        <div onClick={() => setClickNext(false)} className="flex cursor-pointer text-gray-800 w-full border p-3 rounded-md items-center justify-center" >
                            Back
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default RegisterPage