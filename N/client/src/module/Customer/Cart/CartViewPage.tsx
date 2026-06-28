import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa"
import { Rate } from "antd"
import { GoFoldUp, GoPlus } from "react-icons/go"
import ReactMarkdown from 'react-markdown'
import remarkBreaks from "remark-breaks"
import { MdOutlineArrowCircleLeft } from "react-icons/md"
import type { ProductDetailsInterface } from "../../ProductPage/product.validation"
import publicSvc from "../../../service/public.service"

const CartViewPage = () => {
    const { id } = useParams<{ id: string }>()
    console.log(id)

    const [productDetails, setProductDetails] = useState<ProductDetailsInterface>({} as ProductDetailsInterface)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [imagesIndex, setImagesIndex] = useState<number>(0)
    const [maxIndexValue, setMaxIndexValue] = useState<number>(0)
    const [showDescription, setShowDescription] = useState<boolean>(false)
    const navigate = useNavigate()

    const fetchProductDetails = useCallback(async (id: string, signal?: AbortSignal) => {
        try {
            const response = await publicSvc.getProductById(id, signal);
            setProductDetails(response.data.data)
            setMaxIndexValue(response.data.data.images.length)
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') return;
            throw error
        } finally {
            // Only stop loading if NOT aborted
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    }, [])

    const backNavigate = () => {
        try {
            navigate('/customer/cart');
        } catch (error) {
            throw error
        }
    }

    useEffect(() => {
        if (id) {
            const controller = new AbortController();

            // trigger both requests and allow abort on cleanup
            fetchProductDetails(id, controller.signal);

            return () => controller.abort();
        }
    }, [id, fetchProductDetails])

    return (
        // <></>
        <>
            {!isLoading &&
                <>
                    <div className="flex w-full h-[50vh] relative">
                        <div className="absolute top-3 left-2">
                            <MdOutlineArrowCircleLeft size={35} onClick={() => backNavigate()} />
                        </div>
                        <div className="flex w-full h-[45vh] items-center justify-center">
                            <img src={productDetails.images[imagesIndex].secure_url} alt="" />
                        </div>
                        <div className="flex items-center justify-center absolute bottom-0 w-full h-[8vh] bg-gray-200/50 rounded-b-xl gap-3">
                            {productDetails.images?.map((items, index) => (
                                <div
                                    key={items.secure_url}
                                    className="flex w-[15vw] h-[10vh] items-center justify-center"
                                    onClick={() => {
                                        setImagesIndex(index)
                                    }}
                                >
                                    <img src={items.secure_url} alt="" />
                                </div>
                            ))}
                        </div>
                        <div onClick={() => setImagesIndex(prev =>
                            (prev - 1 + maxIndexValue) % maxIndexValue
                        )} className="flex absolute left-0 top-1/2 -translate-y-1/2">
                            <FaCaretLeft size={35} />
                        </div>
                        <div onClick={() => setImagesIndex(prev => (prev + 1) % maxIndexValue)} className="flex absolute right-0 top-1/2 -translate-y-1/2">
                            <FaCaretRight size={35} />
                        </div>
                    </div>
                    <div className="flex flex-col rounded-xl">
                        <div className="flex flex-col rounded-t-xl">
                            <div className="flex flex-col w-full h-auto header-title bg-gray-200 px-2 pt-2 text-xl rounded-t-xl">
                                {productDetails.title}
                            </div>
                            <div className="flex bg-gray-200 px-2 text-xl header-title">
                                {productDetails.category.length > 0 ? productDetails.category[0].name : ""}
                            </div>
                            <div className="flex w-full h-[5vh] items-center bg-gray-200 p-2 gap-2 text-base text-gray-700">
                                <Rate className="custom-rate" value={productDetails.rating} />
                                ({productDetails.totalReviews} Reviewers)
                            </div>
                        </div>
                        <div className="flex w-full h-[5vh] items-center bg-gray-200 rounded-b-xl">
                            <div className="flex w-auto p-2 text-3xl bg-gray-200 items-center justify-center header-title rounded-b-xl">
                                {productDetails.currency}
                                {`  `}
                                {productDetails.price}
                            </div>
                            <div className="bg-green-600 h-[4vh] items-center text-xl flex p-2 rounded-md header-title rounded-b-xl">
                                Save
                            </div>
                        </div>
                    </div>
                    <div className={`
                        flex w-full h-[7vh] bg-gray-200 p-2 items-center px-4 gap-4 text-gray-700 rounded-xl mt-3
                    `}>
                        <GoPlus size={25} onClick={() => setShowDescription(true)} className={`${showDescription ? "hidden rounded-t-xl" : "rounded-xl"}`} />
                        Description
                    </div>
                    {showDescription ?
                        <div className="flex flex-col text-justify p-2 bg-gray-200 w-full h-auto gap-5 px-4 items-center justify-center">
                            <div className="flex flex-col gap-2">
                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>{productDetails.description}</ReactMarkdown>
                            </div>
                            <GoFoldUp size={35} className="animate-bounce" onClick={() => setShowDescription(false)} />
                        </div>
                        : <></>}
                    <div className="flex w-full h-auto rounded-xl mt-4 items-center justify-center">
                        <div className="flex flex-col">
                            <h1 className="flex header-title text-xl">PRODUCT REVIEWS</h1>
                            <div className="flex flex-col w-full mt-4 gap-5">
                                <div className="flex flex-col w-full gap-2 items-center justify-center overflow-hidden">

                                </div>
                                <div className='flex w-full'>
                                    <span className='flex border border-t grow border-gray-500'></span>
                                </div>
                                <div className='flex w-full items-center justify-center mb-6'>
                                    <button onClick={() => navigate('/product/more')} className='border-2 cursor-pointer border-gray-500 p-2 rounded-xl w-[25vw]'>
                                        More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default CartViewPage