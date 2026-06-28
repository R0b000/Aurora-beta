import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import { CartValidationDTO, type cartValidationProps } from "../customer.validator"
import { InputNumber } from "antd"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
import { ImSpinner9 } from "react-icons/im"
import type { HomePageCartProps } from "../../HomePage/HomePage"
import customerSvc from "../../../service/customer.service"
import type { CartDetails } from "./cart.validation"

const CartUpdatePage = ({ setCartClicked }: HomePageCartProps) => {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('id')
    const [cartDetails, setCartDetails] = useState<CartDetails | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [quantity, setQuantity] = useState<number>(1)
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { isSubmitting, isSubmitSuccessful }, setValue } = useForm({
        defaultValues: {
            items: {
                quantity: 1
            },
            coupon: ''
        },
        resolver: yupResolver(CartValidationDTO),
        mode: "onSubmit"
    })

    const fetchProductDetails = useCallback(async (id: string) => {
        try {
            const response = await customerSvc.getSingleCartById(id);
            setCartDetails(response.data.data)
            setQuantity(response.data.data.items.quantity)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const onSubmit = async (data: cartValidationProps, id: string) => {
        try {
            await customerSvc.updateCartById(id, data)
            setCartClicked(false)
            navigate('/customer/cart')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProductDetails(productId)
        }
    }, [productId, fetchProductDetails, isSubmitSuccessful])

    return (
        <>
            {!isLoading &&
                <div className="flex flex-col shrink-0 h-full w-full p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-center w-full h-[10vh] shrink-0 bg-amber-500 rounded-md">
                        <h2 className="flex p-3 text-start">
                            {cartDetails?.items.product.title}
                        </h2>
                    </div>
                    <div className="flex w-full h-[5vh] shrink-0 mt-5">
                        <h2 className="flex gap-2 text-base items-center justify-center">
                            Price:  {cartDetails?.items.product.currency}  {(cartDetails?.items.product.price ?? 0) / 100}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit((data) => onSubmit(data, productId!))} className="flex flex-col w-full h-full shrink-0 p-2">
                        <div className="flex flex-col w-full h-auto shirnk-0 p-2 items-center justify-center gap-10">
                            <div className="flex flex-col w-full gap-3">
                                <span className="flex text-sm">
                                    Product Stock: {cartDetails?.items.product.stock}
                                </span>
                                <div className="flex w-full gap-2">
                                    <button type="button" onClick={() => {
                                        setQuantity((prev) => Math.max(1, (prev - 1)))
                                        setValue('items.quantity', quantity)
                                    }} className="border cursor-pointer border-gray-300 rounded-md w-[15vw] md:w-[9vw] lg:w-[4vw] items-center justify-center flex">
                                        <AiOutlineMinus />
                                    </button>
                                    <Controller
                                        control={control}
                                        name='items.quantity'
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                min={1}
                                                max={cartDetails?.items.product.stock}
                                                placeholder="Enter the quantity?"
                                                style={{ width: '100%', alignContent: 'center' }}
                                                className="flex h-[5vh] bg-red-500"
                                                value={quantity}
                                                onChange={(value) => {
                                                    setQuantity(value!)
                                                    field.onChange(value)
                                                }}
                                            />
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const maxStock = cartDetails?.items.product.stock ?? 0;
                                            const newValue = Math.min(maxStock, quantity + 1);
                                            setQuantity(newValue);
                                            setValue('items.quantity', newValue);
                                        }}
                                        disabled={cartDetails?.items.product.stock === 0} // disable if no stock
                                        className={`border cursor-pointer border-gray-300 rounded-md w-[15vw] md:w-[9vw] lg:w-[4vw] items-center justify-center flex
                                            ${cartDetails?.items.product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <AiOutlinePlus />
                                    </button>

                                </div>
                                <div className="flex gap-2 flex-col mt-4">
                                    <h3>
                                        Total: {quantity * (cartDetails?.items.product.price ?? 0) / 100}
                                    </h3>
                                    <h3>
                                        Tax @13%: {quantity * (cartDetails?.items.product.price ?? 0) * 0.13 / 100}
                                    </h3>
                                    <h3>
                                        Total with Tax@13%: {quantity * (cartDetails?.items.product.price ?? 0) / 100 + quantity * (cartDetails?.items.product.price ?? 0) * 0.13 / 100}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full ">
                                {!isSubmitting &&
                                    <button type="submit" className="flex bg-amber-500 rounded-md w-full cursor-pointer h-[6vh] text-white header-title items-center justify-center">
                                        Update Cart
                                    </button>
                                }
                                {isSubmitting &&
                                    <button type="submit" className="flex bg-amber-500 rounded-md w-full h-[6vh] text-white header-title items-center justify-center">
                                        <ImSpinner9 className="animate-spin" />
                                    </button>
                                }
                                <button onClick={() => {
                                    navigate('/customer/cart')
                                    setCartClicked(false)
                                }} className="flex bg-amber-500 rounded-md w-full h-[6vh] cursor-pointer text-white header-title items-center justify-center">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            }
        </>
    )
}

export default CartUpdatePage;