import React, { useCallback, useEffect, useReducer, useState } from "react"
import publicSvc from "../../service/public.service"
import type { ProductDetailsInterface } from "./product.validation"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { FaCaretLeft, FaCaretRight, FaUserCircle } from "react-icons/fa"
import { Empty, Rate } from "antd"
import { GoFoldUp, GoPlus } from "react-icons/go"
import ReactMarkdown from 'react-markdown'
import remarkBreaks from "remark-breaks"
import { useAppContext } from "../../context/AppContext"
import HeaderComponent from "../../component/Header"
import Sidebar from "../../component/Sidebar"
import SearchPage from "../SearchPage/SearchPage"
import customerSvc from "../../service/customer.service"
import ProductRecommendAddToCartPage from "./ProductRecommendAddToCartPage"
import ProductReviewSection from "./ProductReviewSection"
import { MdDashboard } from "react-icons/md"
import { AiOutlineMessage, AiOutlineRight, AiOutlineUser } from "react-icons/ai"
import { ImSpinner9 } from "react-icons/im"
import MessagePage from "../Message/MessagePage"

export interface ProductCartProps {
    setCartClicked: React.Dispatch<React.SetStateAction<boolean>>;
    setBuyClick: React.Dispatch<React.SetStateAction<boolean>>;
    buyClick: boolean;
}

const messageReducer = (state: boolean, _action: any) => {
    return !state
}

export interface ProductMessageProps {
    setMessageClick: React.Dispatch<React.SetStateAction<boolean>>
    productDetails: ProductDetailsInterface
}

const ProductViewPage = () => {
    const { id } = useParams<{ id: string }>()
    const [productDetails, setProductDetails] = useState<ProductDetailsInterface>({} as ProductDetailsInterface)
    const [_buyClick, setBuyClick] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [imagesIndex, setImagesIndex] = useState<number>(0)
    const [maxIndexValue, setMaxIndexValue] = useState<number>(0)
    const [showDescription, setShowDescription] = useState<boolean>(false)
    const [productList, setProductList] = useState<ProductDetailsInterface[]>([]);
    const [cartClicked, setCartClicked] = useState<boolean>(false)
    const { loggedInUser, searchClick, menuClick, setMenuClick, searchValue, setLoggedInUser } = useAppContext();
    const [cartProductIds, setCartProductIds] = useState<any | null>(null)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const review = searchParams.get('review')
    const [viewUser, setViewUser] = useState<boolean>(false)
    const [yesLoading, setYesLoading] = useState(false);
    const [noLoading, setNoLoading] = useState(false);
    const [messageClick, setMessageClick] = useReducer(messageReducer, false)

    const fetchProductDetails = useCallback(async (id: string, signal?: AbortSignal) => {
        try {
            if (review === 'success') {
                const response = await publicSvc.getProductById(id, signal);
                setProductDetails(response.data.data)
                setMaxIndexValue(response.data.data.images.length)
                navigate(`/product/${id}`)
            } else {
                const response = await publicSvc.getProductById(id, signal);
                setProductDetails(response.data.data)
                setMaxIndexValue(response.data.data.images.length)
            }
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') return;
            throw error
        }
    }, [review])

    const fetchProductList = useCallback(
        async (id: string, signal?: AbortSignal) => {
            try {
                const response = await publicSvc.listProduct(id, signal);
                setProductList(response.data.data);

                if (loggedInUser?.role === "customer") {
                    const response = await customerSvc.listCart();
                    setCartProductIds(() =>
                        response.data.data.map((items: any) => items?.items?.product?._id)
                    );
                }
            } catch (error) {
                if (
                    (error as any)?.name === "CanceledError" ||
                    (error as any)?.message === "canceled"
                )
                    return;
                throw error;
            } finally {
                if (!signal?.aborted) {
                    setIsLoading(false);
                }
            }
        },
        []
    );

    const handleProductId = (id: string) => {
        try {
            setIsLoading(true);
            navigate(`/product/${id}`);
        } catch (error) {
            throw error
        }
    }

    const addToCartClick = (id: string) => {
        try {
            if (!loggedInUser) {
                navigate("/auth/login");
            }
            setCartClicked(true);
            navigate(`?id=${id}&type=cart`);
        } catch (error) {
            throw error;
        }
    };

    const directPayment = async () => {
        try {
            setCartClicked(true);
            navigate(`?id=${productDetails._id}&type=buy`);
            setBuyClick(true);
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const handleRouting = () => {
        if (loggedInUser?.role === 'admin') {
            navigate('/admin')
        } else {
            navigate('/seller')
        }
    }

    useEffect(() => {
        if (id) {
            const controller = new AbortController();

            // trigger both requests and allow abort on cleanup
            fetchProductDetails(id, controller.signal);
            fetchProductList(id, controller.signal);

            return () => controller.abort();
        }
    }, [id, fetchProductDetails, fetchProductList]);

    return (
        <>
            {isLoading ? "" :
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col w-full h-full">
                        <HeaderComponent />
                        <div className="flex w-full gap-2 items-center justify-center">
                            {menuClick &&
                                <div className='flex-col lg:block hidden w-[10vw] h-full shrink-0'>
                                    <div className="flex flex-col w-full gap-3 mt-[10vh]">
                                        <ul className="flex justify-between h-[6vh] items-center text-base p-2 font-semibold header-title">
                                            <div className={`${loggedInUser && 'hidden'}`}>
                                                <li className="flex gap-4 items-center justify-center cursor-pointer" onClick={() => {
                                                    navigate('/auth/login')
                                                }}>
                                                    <FaUserCircle size={33} />Login / Register
                                                </li>
                                            </div>
                                            {(loggedInUser?.role !== 'customer' && loggedInUser !== null) &&
                                                <div onClick={handleRouting} className={`${loggedInUser?.role === 'admin' && 'cursor-pointer visible flex gap-2 items-center'}`}>
                                                    <MdDashboard size={45} /> DASHBOARD
                                                </div>
                                            }
                                            {(loggedInUser?.role === 'customer') &&
                                                <h1 className="flex w-full h-[7vh] items-center p-2 cursor-pointer" onClick={() => {
                                                    setViewUser(true)
                                                }}>Profile</h1>
                                            }                                </ul>
                                        <span className="flex grow border border-t border-rose-50"></span>
                                        <ul className="flex w-full flex-col p-2 gap-6 px-4 text-base">
                                            <li className="flex justify-between items-center cursor-pointer">
                                                Trending
                                                <AiOutlineRight />
                                            </li>
                                            <li className="flex justify-between items-center cursor-pointer">New Arrival</li>
                                            <li className="flex justify-between items-center cursor-pointer">
                                                Women
                                                <AiOutlineRight />
                                            </li>
                                            <li className="flex justify-between items-center cursor-pointer">
                                                Men
                                                <AiOutlineRight />
                                            </li>
                                            <li className="flex justify-between items-center cursor-pointer">
                                                Accessories
                                                <AiOutlineRight />
                                            </li>
                                            <li className="flex justify-between items-center cursor-pointer">
                                                Sale
                                                <AiOutlineRight />
                                            </li>
                                        </ul>
                                        <ul className="flex flex-col gap-2 p-2 px-6 text-base">
                                            <li className="flex items-center cursor-pointer">
                                                Customer Service
                                            </li>
                                            <li className="flex items-center cursor-pointer">
                                                FAQ
                                            </li>
                                            <li className="flex items-center cursor-pointer">
                                                Contact Us
                                            </li>
                                            <li className="flex items-center cursor-pointer">
                                                Sizing Guide
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            }
                            <div className={`${menuClick ? "lg:flex w-full lg:items-center lg:justify-center" : "w-full lg:w-[90vw]"}`}>
                                <div className={`${searchValue ? 'flex visible transition-all duration-300 h-full w-full items-center justify-center mt-[17vh]' : "hidden"}`}>
                                    <SearchPage />
                                </div>
                                <div className={`flex flex-col items-center justify-center 
                                        ${searchValue ? 'hidden' : 'visible'} 
                                        ${searchClick ? '' : 'mt-[7vh] md:mt-[10vh]'} 
                                        ${menuClick ? 'lg:w-[80vw] w-full' : 'w-full'}
                                    `}>
                                    <div className="flex flex-col md:items-center md:justify-center md:gap-10 h-auto bg-black/5 rounded-md md:w-[90vw] w-full">
                                        <div className={`flex h-full w-full lg:w-[80vw] lg:h-[83vh] relative items-center justify-center`}>
                                            <div className="flex w-auto h-[45vh] md:h-auto items-center justify-center overflow-clip">
                                                <img src={productDetails.images[imagesIndex].secure_url} alt="" className="md:h-[75vh] md:w-auto " />
                                            </div>
                                            <div className="flex items-center justify-center absolute bottom-0 w-full h-[8vh] bg-gray-200/50 rounded-b-xl gap-3 md:h-[10vh] lg:h-[12vh] md:rounded-md overflow-clip">
                                                {productDetails.images.map((items, index) => (
                                                    <div
                                                        key={items.secure_url}
                                                        className="flex w-[15vw] gap-2 lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh] h-[10vh] items-center justify-center"
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
                                                <FaCaretLeft className="text-4xl md:text-4xl text-white border bg-black/50 rounded-md place-items-center h-[4vh] lg:h-[6vh]" />
                                            </div>
                                            <div onClick={() => setImagesIndex(prev => (prev + 1) % maxIndexValue)} className="flex absolute right-0 top-1/2 -translate-y-1/2">
                                                <FaCaretRight className="text-4xl md:text-4xl text-white border bg-black/50 rounded-md place-items-center h-[4vh] lg:h-[6vh]" />
                                            </div>
                                        </div>
                                        <div className={`flex flex-col ${menuClick ? 'w-[75vw]' : 'w-full'} h-auto shrink-0 items-center md:gap-2`}>
                                            <div className={`flex flex-col p-2 rounded-xl ${menuClick ? 'w-[75vw]' : 'w-full md:w-[90vw]'} md:bg-gray-200`}>
                                                <div className="flex flex-col lg:h-[15vh] md:shirnk-0 md:bg-gray-200">
                                                    <div className="flex flex-col w-full h-auto header-title bg-gray-200 px-2 pt-2 text-sm rounded-t-xl md:text-sm">
                                                        {productDetails.title}
                                                    </div>
                                                    <div className="flex bg-gray-200 px-2 text-sm header-title md:text-sm">
                                                        {productDetails.category.length > 0 ? productDetails.category[0].name : ""}
                                                    </div>
                                                    <div className="flex w-full h-[5vh] items-center bg-gray-200 p-2 gap-2 text-base text-gray-700 md:text-sm">
                                                        <Rate className="custom-rate" value={productDetails.rating} />
                                                        ({productDetails.totalReviews} Reviewers)
                                                    </div>
                                                </div>
                                                <div className="flex w-full h-[5vh] items-center bg-gray-200 md:h-[7vh]">
                                                    <div className="flex w-auto p-2 text-sm bg-gray-200 items-center justify-center header-title">
                                                        {productDetails.currency}
                                                        {`  `}
                                                        {productDetails.price}
                                                    </div>
                                                    <div className="bg-green-600 h-[4vh] items-center text-sm flex p-2 rounded-md header-title">
                                                        Save
                                                    </div>
                                                </div>
                                                <div className="flex w-full h-[10vh] bg-gray-200 p-2 items-center justify-between md:justify-center rounded-b-xl header-title md:text-sm md:gap-5">
                                                    {(loggedInUser?.role === 'admin' || loggedInUser?.role === 'seller') &&
                                                        <>
                                                            <div className="flex w-full h-[5vh] cursor-default bg-amber-500 rounded-md items-center justify-center text-white md:text-sm md:w-[40%]">
                                                                <h2 className="text-sm">
                                                                    Qty: {productDetails.stock}
                                                                </h2>
                                                            </div>
                                                        </>
                                                    }

                                                    {(loggedInUser?.role === 'customer' || loggedInUser === null) &&
                                                        <div className="flex w-full gap-10 items-center justify-center">
                                                            {
                                                                productDetails.stock === 0 ?
                                                                    <div className="flex w-[45vw] h-[7vh] cursor-default bg-amber-300 rounded-md items-center justify-center text-red-900 md:text-sm">
                                                                        <h2 className="text-sm">
                                                                            OUT OF STOCK
                                                                        </h2>
                                                                    </div>
                                                                    :
                                                                    <button onClick={() => {
                                                                        if (!loggedInUser) {
                                                                            navigate('/auth/login')
                                                                        } else {
                                                                            setCartClicked(true)
                                                                            navigate(`?id=${productDetails._id}&type=cart`)
                                                                        }
                                                                    }} className="flex w-[45vw] h-[7vh] cursor-pointer hover:scale-105 lg:w-[30vw] bg-orange-400 p-2 items-center justify-center rounded-md text-white md:text-sm">
                                                                        ADD TO CART
                                                                    </button>
                                                            }
                                                            < button onClick={() => {
                                                                if (!loggedInUser) {
                                                                    navigate('/auth/login')
                                                                } else {
                                                                    directPayment();
                                                                }
                                                            }} className="flex w-[45vw] h-[7vh] cursor-pointer hover:scale-105 lg:w-[30vw] bg-gray-400/40 p-2 items-center justify-center rounded-md text-gray-700">
                                                                BUY NOW
                                                            </button>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className={`flex ${menuClick ? 'w-full' : 'w-full lg:w-[90vw] '} md:rounded-md h-[7vh] bg-gray-200 p-2 items-center px-4 gap-4 text-gray-700 md:text-sm lg:text-sm`}>
                                                <GoPlus size={25} onClick={() => setShowDescription(true)} className={`${showDescription ? "hidden rounded-t-xl" : "rounded-xl"}`} />
                                                Description
                                            </div>
                                            {showDescription ?
                                                <div className="flex flex-col text-justify p-2 lg:w-[90vw] lg:rounded-md bg-gray-200 w-full h-auto gap-5 items-center justify-center px-4 md:text-lg">
                                                    <div className="flex flex-col gap-2 lg:text-sm w-full">
                                                        <p className="flex flex-col gap-2 w-full">
                                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{productDetails.description}</ReactMarkdown>
                                                        </p>
                                                    </div>
                                                    <GoFoldUp size={35} className="animate-bounce" onClick={() => setShowDescription(false)} />
                                                </div>
                                                : <></>}
                                        </div>
                                    </div>
                                    <div className="w-full mt-5 md:w-[90%] lg:w-full">
                                        <div className="lg:w-full mx-auto">
                                            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2 md:p-8">
                                                <ProductReviewSection />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex flex-col px-4 items-center justify-center h-auto w-full`}>
                                        <div className={`flex flex-col gap-3 ${menuClick ? 'lg:w-[75vw]' : 'w-[95vw]'}`}>
                                            <h1 className="flex header-title text-lg md:text-lg">
                                                BEST SELLER
                                            </h1>
                                            <div className={`flex flex-col gap-5 ${menuClick ? 'lg:w-[75vw] lg:items-center lg:justify-center' : 'w-full'}`}>
                                                <div className={`flex flex-col gap-2 items-center justify-center overflow-hidden md:grid md:grid-cols-3 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5 w-full'}`}>
                                                    {productList.length > 0 ? (
                                                        productList.map((item) => (
                                                            <div key={item._id}
                                                                onClick={() => {
                                                                    handleProductId(item._id)
                                                                }}
                                                                className="flex border-2 w-93 rounded-md border-violet-300 md:w-full"
                                                            >
                                                                <div className="flex flex-col w-full h-[50vh] md:h-[30vh] lg:h-[50vh] gap-2 rounded-xl border-gray-500 mb-4 bg-gray-200/70 relative">
                                                                    <div className="flex w-full h-full items-center justify-center">
                                                                        <img src={item.images[0]?.secure_url} className="rounded-xl w-auto h-full" alt="dress-01" />
                                                                    </div>
                                                                    <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-sm md:text-sm  rounded-xl font-semibold text-black h-auto overflow-hidden z-2 p-2">
                                                                        {item.title}
                                                                    </div>
                                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-2">
                                                                        {(loggedInUser?.role === 'admin' || loggedInUser?.role === 'seller') &&
                                                                            <>
                                                                                <div className="flex w-[27vw] h-[5vh] cursor-default bg-amber-500 rounded-md items-center justify-center text-white md:text-sm lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
                                                                                    <h2 className="text-sm">
                                                                                        Qty: {item.stock}
                                                                                    </h2>
                                                                                </div>
                                                                            </>
                                                                        }

                                                                        {(loggedInUser?.role === 'customer' || loggedInUser === null) && (item.stock === 0 ?
                                                                            <>
                                                                                <div className="flex w-[27vw] h-[6vh] cursor-default bg-amber-300 rounded-md items-center justify-center text-red-900 lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
                                                                                    <h2 className="text-sm">
                                                                                        OUT OF STOCK
                                                                                    </h2>
                                                                                </div>
                                                                            </>
                                                                            :
                                                                            (cartProductIds?.includes(item._id) ?
                                                                                <h2 className="flex w-[27vw] border-gray-400 bg-teal-400 text-sm rounded-md lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh] text-white p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh] header-title">ADDED TO CART</h2>
                                                                                :
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        addToCartClick(item._id)
                                                                                    }}
                                                                                    className="flex w-[27vw] cursor-pointer hover:scale-110 border-gray-400 bg-orange-400 text-sm rounded-md text-white p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh] header-title lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
                                                                                    ADD TO CART
                                                                                </button>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))) : (
                                                        <div>
                                                            <Empty />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex w-full'>
                                                    <span className='flex border border-t grow border-gray-500/30'></span>
                                                </div>
                                                <div className='flex w-full items-center justify-center mb-6'>
                                                    <button onClick={() => navigate('/product/more')} className='border-2 cursor-pointer border-gray-500 p-2 rounded-xl w-[25vw] md:w-[15vw]'>
                                                        More
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-900 text-gray-300 py-10 px-5">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                            {/* Column 1 */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="cursor-pointer hover:text-white">Help & FAQs</li>
                                    <li className="cursor-pointer hover:text-white">Shipping Information</li>
                                    <li className="cursor-pointer hover:text-white">Returns & Refunds</li>
                                    <li className="cursor-pointer hover:text-white">Track Order</li>
                                </ul>
                            </div>

                            {/* Column 2 */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="cursor-pointer hover:text-white">About Us</li>
                                    <li className="cursor-pointer hover:text-white">Careers</li>
                                    <li className="cursor-pointer hover:text-white">Press</li>
                                    <li className="cursor-pointer hover:text-white">Affiliate Program</li>
                                </ul>
                            </div>

                            {/* Column 3 */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="cursor-pointer hover:text-white">Contact Us</li>
                                    <li className="cursor-pointer hover:text-white">Store Locator</li>
                                    <li className="cursor-pointer hover:text-white">Support</li>
                                    <li className="cursor-pointer hover:text-white">Partner With Us</li>
                                </ul>
                            </div>

                            {/* Column 4 */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="cursor-pointer hover:text-white">Privacy Policy</li>
                                    <li className="cursor-pointer hover:text-white">Terms & Conditions</li>
                                    <li className="cursor-pointer hover:text-white">Cookie Policy</li>
                                    <li className="cursor-pointer hover:text-white">Disclaimer</li>
                                </ul>
                            </div>

                        </div>

                        {/* Bottom section */}
                        <div className="border-t border-gray-700 mt-8 pt-5 text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} YourCompany. All rights reserved.
                        </div>
                    </div>
                    <div className="lg:hidden">
                        {menuClick && (
                            <div
                                onClick={() => setMenuClick(false)}
                                className="fixed inset-0 bg-black/70 z-2 w-full h-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                            >

                            </div>
                        )}
                        {menuClick && (
                            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-3 -translate-x-1/2 text-justify p-4 pt-10 h-[60vh] w-[75vw] md:h-[50vh] md:w-[60vw] text-white font-bold text-sm title-header bg-black/50">
                                <Sidebar />
                            </div>
                        )}
                    </div>
                    {cartClicked &&
                        <div>
                            <div
                                onClick={() => setCartClicked(false)}
                                className="fixed inset-0 w-full h-full bg-black/50 z-2"
                            >

                                {/* Bottom section */}
                                <div className="border-t border-gray-700 mt-8 pt-5 text-center text-sm text-gray-500">
                                    © {new Date().getFullYear()} YourCompany. All rights reserved.
                                </div>
                            </div>
                        </div>
                    }

                    {cartClicked && (
                        <>
                            <div
                                onClick={() => setCartClicked(false)}
                                className="fixed inset-0 w-full h-full bg-black/50 z-2"
                            ></div>

                            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-3 -translate-x-1/2 text-justify p-4 h-[60vh] w-[90vw] md:w-[60vw] lg:w-[30vw] md:h-auto font-bold text-sm title-header bg-black/20 rounded-xl">
                                <ProductRecommendAddToCartPage setCartClicked={setCartClicked} />
                            </div>
                        </>
                    )}

                    {viewUser && (
                        <div
                            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-md p-2"
                            onClick={() => setViewUser(false)}
                        >
                            {/* Stop click from closing when clicking inside the box */}
                            <div
                                className="bg-white text-black p-4 rounded-xl shadow-xl w-[400px]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <AiOutlineUser size={45} />
                                    <h2 className="text-xl font-semibold mb-2 header-title">{loggedInUser?.name}</h2>
                                    <h3 className="text-xl font-semibold mb-2 header-title">{loggedInUser?.email}</h3>
                                </div>
                                <div className="flex flex-col w-full gap-1 p-2">
                                    <h3 className="flex w-full header-title text-xl">Logout</h3>
                                    <div className="flex gap-5">
                                        {/* YES button */}
                                        <button
                                            onClick={() => {
                                                setYesLoading(true);
                                                setViewUser(false);
                                                localStorage.clear();
                                                setLoggedInUser(null);

                                                setTimeout(() => {
                                                    navigate('/');
                                                    setYesLoading(false);
                                                }, 1000);
                                            }}
                                            className="mt-[3vh] relative bg-green-700 text-white px-3 py-1 rounded-lg w-[50%] h-[5vh] cursor-pointer flex items-center justify-center"
                                        >
                                            {yesLoading ? (
                                                <ImSpinner9 className="animate-spin text-white text-xl" />
                                            ) : (
                                                "YES"
                                            )}
                                        </button>

                                        {/* NO button */}
                                        <button
                                            onClick={() => {
                                                setNoLoading(true);
                                                setViewUser(false);
                                                setTimeout(() => setNoLoading(false), 600);
                                            }}
                                            className="mt-[3vh] relative bg-green-700 text-white px-3 py-1 rounded-lg w-[50%] h-[5vh] cursor-pointer flex items-center justify-center"
                                        >
                                            {noLoading ? (
                                                <ImSpinner9 className="animate-spin text-white text-xl" />
                                            ) : (
                                                "NO"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {messageClick ? (
                        <div className="fixed bottom-10 right-10 z-40 text-black font-semibold text-shadow-sm">
                            <div className="gap-2 flex items-center bg-gray-300 justify-center w-full text-sm lg:text-base p-2 rounded-md">
                                <MessagePage setMessageClick={setMessageClick} productDetails={productDetails}/>
                            </div>
                        </div>
                    ) : (
                        <div className="fixed bottom-10 right-10 z-30 text-white font-semibold text-shadow-sm">
                            <div
                                className="flex gap-2 items-center bg-green-600 justify-center w-full text-sm lg:text-base p-2 rounded-md cursor-pointer hover:scale-110 duration-300 transition-all"
                                onClick={setMessageClick}
                            >
                                <AiOutlineMessage className="text-xl lg:text-2xl" />Seller
                            </div>
                        </div>
                    )}
                </div>
            }
        </>
    )
}

export default ProductViewPage;
