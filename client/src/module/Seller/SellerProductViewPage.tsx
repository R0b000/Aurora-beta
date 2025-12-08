import { useCallback, useEffect, useState } from "react"
import publicSvc from "../../service/public.service"
import { useNavigate, useParams } from "react-router-dom"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa"
import { Rate } from "antd"
import { GoFoldUp, GoPlus } from "react-icons/go"
import ReactMarkdown from 'react-markdown'
import remarkBreaks from "remark-breaks"
import type { ProductDetailsInterface } from "../ProductPage/product.validation"
import sellerSvc from "../../service/seller.service"
import { AiOutlineUser } from "react-icons/ai"

const SellerProductViewPage = () => {
    const { id } = useParams<{ id: string }>()

    const [productDetails, setProductDetails] = useState<ProductDetailsInterface>({} as ProductDetailsInterface)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [imagesIndex, setImagesIndex] = useState<number>(0)
    const [maxIndexValue, setMaxIndexValue] = useState<number>(0)
    const [showDescription, setShowDescription] = useState<boolean>(false)
    const [productReview, setProductReview] = useState<any | null>(null)
    const navigate = useNavigate();

    const fetchProductDetails = useCallback(async (id: string, signal?: AbortSignal) => {
        try {
            const response = await publicSvc.getProductById(id, signal);
            setProductDetails(response.data.data)
            setMaxIndexValue(response.data.data.images.length)

            const reviewResponse = await sellerSvc.productReview(id);
            setProductReview(reviewResponse.data.reviews);
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

    useEffect(() => {
        if (id) {
            const controller = new AbortController();

            // trigger both requests and allow abort on cleanup
            fetchProductDetails(id, controller.signal);

            return () => controller.abort();
        }
    }, [id, fetchProductDetails])

    return (
        <>
            {!isLoading &&
                <div className="flex w-full h-full items-center justify-center mt-[13vh] md:mt-[14vh] lg:mt-[22vh]">
                    <div className="flex flex-col w-full lg:w-[80%] md:w-[95%] gap-5">
                        <div className="flex w-full lg:h-[80vh] h-[60vh] relative overflow-clip">
                            <div className="flex w-full h-[50vh] lg:h-[70vh] items-center justify-center">
                                <img src={productDetails.images[imagesIndex].secure_url} alt="" className="md:h-[70vh] md:w-auto" />
                            </div>
                            <div className="flex items-center justify-center absolute bottom-0 w-full h-[8vh] lg:h-[15vh] bg-gray-200/50 rounded-b-xl gap-3">
                                {productDetails.images?.map((items, index) => (
                                    <div
                                        key={items.secure_url}
                                        className="flex w-auto h-full "
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
                        <div className="flex flex-col rounded-xl md:h-[20vh] shrink-0">
                            <div className="flex flex-col rounded-t-xl md:h-[14vh] md:bg-gray-200">
                                <div className="flex flex-col w-full h-auto header-title bg-gray-200 px-2 pt-2 text-base rounded-t-xl md:text-base">
                                    {productDetails.title}
                                </div>
                                <div className="flex bg-gray-200 px-2 text-base header-title md:text-base">
                                    {productDetails.category.length > 0 ? productDetails.category[0].name : ""}
                                </div>
                                <div className="flex w-full md:text-base h-[5vh] md:h-[7vh] items-center bg-gray-200 p-2 gap-2 text-sm text-gray-700">
                                    <Rate className="custom-rate" value={productDetails.rating} />
                                    ({productDetails.totalReviews} Reviewers)
                                </div>
                            </div>
                            <div className="flex w-full h-[5vh] md:h-[7vh] items-center bg-gray-200 rounded-b-xl">
                                <div className="flex w-auto p-2 text-base bg-gray-200 items-center justify-center header-title rounded-b-xl">
                                    {productDetails.currency}
                                    {`  `}
                                    {productDetails.price}
                                </div>
                                <div className="bg-green-600 h-[4vh] items-center text-base flex p-2 rounded-md header-title rounded-b-xl">
                                    Save
                                </div>
                            </div>
                        </div>
                        <div className={`
                        flex w-full h-[7vh] bg-gray-200 p-2 items-center px-4 gap-4 text-gray-700 rounded-xl mt-3 md:text-base
                    `}>
                            <GoPlus onClick={() => setShowDescription(true)} className={`text-base cursor-pointer md:text-base ${showDescription ? "hidden rounded-t-xl" : "rounded-xl"}`} />
                            Description
                        </div>
                        {showDescription ?
                            <div className="flex flex-col text-justify p-2 bg-gray-100 w-full h-auto gap-5 px-4 rounded-md items-center justify-center">
                                <div className="flex flex-col gap-2 md:text-base w-full">
                                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>{productDetails.description}</ReactMarkdown>
                                </div>
                                <GoFoldUp size={35} className="animate-bounce cursor-pointer" onClick={() => setShowDescription(false)} />
                            </div>
                            : <></>}
                        <div className="flex w-full h-auto rounded-xl mt-4 items-center justify-center">
                            <div className="flex flex-col w-full p-6">
                                <h1 className="flex header-title text-base md:text-base">PRODUCT REVIEWS</h1>
                                <div className="flex flex-col w-full mt-4 gap-5">
                                    <div className="space-y-5 p-5">
                                        {productReview.length === 0 ? (
                                            <p className="text-center p-2 py-5 text-gray-500">
                                                No reviews yet. Be the first!
                                            </p>
                                        ) : (
                                            productReview.map((review: any) => (
                                                <div
                                                    key={review._id}
                                                    className="flex gap-5 border-b last:border-b-0 border-gray-400 p-3"
                                                >
                                                    <div className="shrink-0">
                                                        {review.user?.avatar ? (
                                                            <img
                                                                src={review.user.avatar}
                                                                alt={review.user.name}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <AiOutlineUser className="text-base text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-semibold text-base">
                                                                    {review.user?.name || "Anonymous"}
                                                                </p>
                                                                <p>
                                                                    {review.body}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className='flex w-full'>
                                        <span className='flex border border-t grow border-gray-500'></span>
                                    </div>
                                    <div className='flex w-full items-center justify-center mb-6'>
                                        <button onClick={() => navigate('/product/more')} className='border-2 cursor-pointer border-gray-500 p-2 rounded-xl w-[25vw] md:text-base'>
                                            More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default SellerProductViewPage