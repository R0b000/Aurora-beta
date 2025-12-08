import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import { InputNumber } from "antd"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import publicSvc from "../../service/public.service"
import type { ListProductDetails } from "../HomePage/homepage.validation"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
import { ImSpinner9 } from "react-icons/im"
import customerSvc from "../../service/customer.service"
import type { ProductCartProps } from "./ProductViewPage"
import { CartValidationDTO, type cartValidationProps } from "../Customer/customer.validator"

const ProductAddToCart = ({ setCartClicked, buyClick }: ProductCartProps) => {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('id')
    const [productDetails, setProductDetails] = useState<ListProductDetails | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [quantity, setQuantity] = useState<number>(1)
    const navigate = useNavigate();
    const type = searchParams.get('type')

    const fetchProductDetails = useCallback(async (id: string) => {
        try {
            const response = await publicSvc.getProductById(id);
            setProductDetails(response.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, [])


    const { control, handleSubmit, formState: { isSubmitting }, setValue } = useForm({
        defaultValues: {
            items: {
                quantity: 1
            },
            coupon: ''
        },
        resolver: yupResolver(CartValidationDTO),
        mode: "onSubmit"
    })

    const onSubmit = async (data: cartValidationProps, id: string) => {
        try {
            console.log(data)
            if (type === 'cart') {
                await customerSvc.addToCart(data, id);
            } else {
                const response = await customerSvc.addToCart(data, id)
                const cartId = response.data.data._id
                const cashPayResponse = await customerSvc.checkout(cartId!)
                const orderItemId = cashPayResponse.data._id
                const onlineResponse = await customerSvc.onlinePayment(orderItemId!)
                window.location.href = (`${onlineResponse.data.data.payment_url}`);
            }
            setCartClicked(false)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    useEffect(() => {
        if (productId) {
            fetchProductDetails(productId)
        }
    }, [productId])

    return (
        <>
            {!isLoading &&
                <div className="flex flex-col shrink-0 h-full w-full p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-center w-full h-[10vh] shrink-0 bg-amber-500 rounded-md">
                        <h2 className="flex p-3 text-start text-base">
                            {productDetails?.title}
                        </h2>
                    </div>
                    <div className="flex w-full h-[5vh] shrink-0 mt-5">
                        <h2 className="flex gap-2 text-base header-title items-center justify-center">
                            Price:  {productDetails?.currency}  {(productDetails?.price ?? 0) / 100}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit((data) => onSubmit(data, productId!))} className="flex flex-col w-full h-full shrink-0 p-2">
                        <div className="flex flex-col w-full h-auto shirnk-0 p-2 items-center justify-center gap-10">
                            <div className="flex flex-col w-full gap-3">
                                <span className="flex text-sm">
                                    Items Quantity: {productDetails?.stock}
                                </span>
                                <div className="flex w-full gap-2">
                                    <button type="button" onClick={() => {
                                        setQuantity((prev) => Math.max(1, (prev - 1)))
                                        setValue('items.quantity', quantity)
                                    }} className="border border-gray-300 cursor-pointer rounded-md w-[15vw] md:w-[8vw] lg:w-[3vw] items-center justify-center flex">
                                        <AiOutlineMinus />
                                    </button>
                                    <Controller
                                        control={control}
                                        name='items.quantity'
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                min={1}
                                                max={productDetails?.stock}
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
                                            const maxStock = productDetails?.stock ?? 1
                                            const newValue = Math.min(maxStock, quantity + 1)
                                            setQuantity(newValue)
                                            setValue('items.quantity', newValue)
                                        }}
                                        className="border border-gray-300 cursor-pointer rounded-md w-[15vw] md:w-[8vw] lg:w-[3vw] items-center justify-center flex"
                                    >
                                        <AiOutlinePlus />
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-col mt-4">
                                    <h3 className="text-sm">
                                        Total: {quantity * (productDetails?.price ?? 0) / 100}
                                    </h3>
                                    <h3 className="text-sm">
                                        Tax @13%: {quantity * (productDetails?.price ?? 0) * 0.13 / 100}
                                    </h3>
                                    <h3 className="text-sm">
                                        Total with Tax@13%: {quantity * (productDetails?.price ?? 0) / 100 + quantity * (productDetails?.price ?? 0) * 0.13 / 100}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full">
                                {!isSubmitting &&
                                    (
                                        buyClick ?
                                            <button type="submit" className="flex cursor-pointer hover:scale-105 bg-amber-500 text-base rounded-md w-full h-[6vh] text-white header-title items-center justify-center">
                                                Buy Now
                                            </button>
                                            :
                                            <button type="submit" className="flex cursor-pointer hover:scale-105 bg-amber-500 rounded-md text-base w-full h-[6vh] text-white header-title items-center justify-center">
                                                Add To Cart
                                            </button>
                                    )
                                }
                                {isSubmitting &&
                                    <button type="submit" className="flex bg-amber-500 rounded-md w-full h-[6vh] text-white header-title items-center justify-center">
                                        <ImSpinner9 className="animate-spin" />
                                    </button>
                                }
                                <button onClick={() => {
                                    navigate(`/product/${productId}`)
                                    setCartClicked(false)
                                }} className="flex bg-amber-500 cursor-pointer hover:scale-105 rounded-md w-full h-[6vh] text-white header-title items-center justify-center">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form >
                </div >
            }
        </>
    )
}

export default ProductAddToCart;