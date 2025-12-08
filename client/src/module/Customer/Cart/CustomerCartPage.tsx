import React, { useCallback, useEffect, useState } from "react"
import type { CartResponse } from "./cart.validation"
import customerSvc from "../../../service/customer.service"
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { useNavigate, useSearchParams } from "react-router-dom"
import CartUpdatePage from "./CartUpdatePage"
import { Empty, Spin } from "antd"
import type { ListProductDetails } from "../../HomePage/homepage.validation"
import publicSvc from "../../../service/public.service"
import { useAppContext } from "../../../context/AppContext"
import SearchPage from "../../SearchPage/SearchPage"
import CustomerAddCartPage from "./CustomerAddCartPage"

export interface CustomerCartPageProps {
    setAddCartClick: React.Dispatch<React.SetStateAction<boolean>>
}

const CustomerCartPage = () => {
    const [cartList, setCartList] = useState<CartResponse | null>(null)
    const [cartClicked, setCartClicked] = useState<boolean>(false)
    const [orderItemClick, setOrderItemsClick] = useState<boolean>(false)
    const [orderItemsDetails, setOrderItemsDetails] = useState<any>([])
    const [orderItemsCartIds, setOrderItemsCartIds] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [onlinePayClick, setOnlinePayClick] = useState<boolean>(false)
    const [listProductDetails, setListProductDetails] = useState<ListProductDetails[]>([])
    const [searchParams] = useSearchParams();
    const { loggedInUser, searchValue, menuClick } = useAppContext();
    const Id = searchParams.get('id')
    const navigate = useNavigate();
    const orderItem = searchParams.get('orderItem')
    const query = Object.fromEntries([...searchParams])
    const isSuccess = location.pathname.includes('khalti-success')
    const [cartProductIds, setCartProductIds] = useState<any | null>(null)
    const [addCartClick, setAddCartClick] = useState<boolean>(false)

    const listProducts = useCallback(async (id?: string) => {
        try {
            setIsLoading(true)
            const response = await publicSvc.listProduct(id);
            setListProductDetails(response.data.data);
        } catch (error) {
            console.log("Error listing products")
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchCartList = useCallback(async () => {
        try {
            const response = await customerSvc.listCart();
            setCartList(response.data)

            const orderResponse = await customerSvc.orderItem();
            setOrderItemsDetails(orderResponse)
            setOrderItemsCartIds(() => orderResponse.data.map((items: any) => items.items.cartId))

            if (loggedInUser?.role === 'customer') {
                const response = await customerSvc.listCart();
                setCartProductIds(() => response.data.data.map((items: any) => items?.items?.product?._id))
            } else {
                setCartProductIds(null)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, []);

    const cartDeleteById = async (id: string) => {
        try {
            await customerSvc.deleteCartById(id)
            await fetchCartList();
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchCartList();
        listProducts();
    }, [Id, fetchCartList, isSuccess])

    const updateCart = async (id: string) => {
        navigate(`?id=${id}`)
        setCartClicked(true)
    }

    const buyItem = async (id: string) => {
        setOrderItemsClick(true);
        navigate(`?orderItem=${id}`)
    }

    const cashPay = async () => {
        await customerSvc.checkout(orderItem!)
        navigate('/customer/cart')
        setOrderItemsClick(false)
    }

    const onlinePay = async (id: string) => {
        setOnlinePayClick(true)
        navigate(`?orderItem=${id}&onlinePay=khalti-pay`)
        try {
            const response = await customerSvc.onlinePayment(id)
            window.location.href = (`${response.data.data.payment_url}`);
        } catch (error) {
            console.log(error)
        }
    }

    const savePayment = async (query: any) => {
        try {
            await customerSvc.savePayment(query);
            navigate('/customer/cart')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const handleProductId = (id: string) => {
        try {
            navigate(`/product/${id}`)
        } catch (error) {
            console.log("Something is wrong here")
            throw error
        }
    }

    const addToCartClick = (id: string) => {
        try {
            if (!loggedInUser) {
                navigate('/auth/login');
            }
            setAddCartClick(true)
            navigate(`?id=${id}`)
        } catch (error) {
            throw error
        }
    }

    useEffect(() => {
        if (isSuccess && query) {
            const save = async () => {
                try {
                    await savePayment(query);
                } catch (error) {
                    console.log(error)
                    throw error
                }
            };

            save();
        }
    }, [isSuccess, query])

    const directPayment = async () => {
        const response = await customerSvc.checkout(orderItem!)
        console.log(response);

        const id = response.data._id
        if (id) {
            navigate(`?orderItem=${id}&onlinePay=khalti-pay`)
            const response = await customerSvc.onlinePayment(id)
            window.location.href = (`${response.data.data.payment_url}`);
        }
    }

    return (
        <>
            {!isLoading &&
                <>
                    <div className={`${searchValue ? 'visible lg:mt-[17vh]' : 'hidden'}`}>
                        <SearchPage />
                    </div>
                    <div className={`flex flex-col w-full h-full gap-5 p-2 ${searchValue ? "hidden" : 'visible'}`}>
                        <div className="flex p-2">
                            <h2 className="flex text-sm">
                                Carts List
                            </h2>
                        </div>
                        {cartList?.data.length === 0 ?
                            <div className={`flex flex-col gap-5 w-full items-center justify-center`}>
                                <div className="flex flex-col w-full h-[35vh] shrink-0 items-center justify-center">
                                    <Empty />
                                </div>

                                <div className="flex w-full flex-col p-2">
                                    <h2 className="flex text-sm">
                                        Recommended Product
                                    </h2>
                                    <div className="flex flex-col w-full gap-5">
                                        <div className={`flex flex-col w-full gap-2 items-center justify-center overflow-hidden md:grid md:grid-cols-3 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} `}>
                                            {listProductDetails.length > 0 ? (
                                                listProductDetails.map((item) => (
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
                                                            <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-sm md:text-sm  rounded-xl font-semibold text-black h-auto overflow-hidden z-10 p-2 pointer-event-none">
                                                                {item.title}
                                                            </div>
                                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
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
                            :
                            <div className={`flex flex-col md:grid md:grid-cols-2 md:gap-3 shrink-0 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
                                {
                                    cartList?.data.map((items, index) => (
                                        <div key={index} onClick={() => {
                                            navigate(`cartView/${items.items.product._id}`)
                                        }} className="flex flex-col w-full h-[67vh] md:h-[47vh] lg:h-[65vh] shrink-0 border border-violet-300 rounded-md gap-1 p-2">
                                            <div className="flex flex-col w-full h-auto gap-3">
                                                <div className="flex flex-col w-full h-[50vh] md:h-[35vh] lg:h-[46vh] shrink-0">
                                                    <h1 className="flex text-sm h-[8vh] shrink-0 bg-amber-500 w-full items-center justify-center p-2 rounded-md ">
                                                        {items.items.product.title}
                                                    </h1>
                                                    <div className="flex w-auto h-[42vh] md:h-[25vh] lg:h-[40vh] shrink-0 relative overflow-hidden">
                                                        <div className="flex items-center justify-center w-full h-full overflow-hidden bg-amber-300">
                                                            <img src={items.items.product.images[0].secure_url} alt="cart-image" className="flex w-auto h-[42vh] md:h-full" />
                                                        </div>
                                                        <div className="absolute left-0 z-4">
                                                            <div className="flex flex-col w-full">
                                                                <h2 className="flex text-sm">
                                                                    Quantity: {items.items.quantity}
                                                                </h2>
                                                                <h2 className="text-sm">
                                                                    Price @13% VAT: {items.items.price / 100}
                                                                </h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-white w-full h-[7vh] md:mt-2 md:h-[6vh] md:w-full items-center justify-center">
                                                    <AiOutlineEdit onClick={(e) => {
                                                        e.stopPropagation()
                                                        updateCart(items._id)
                                                    }} className="bg-blue-800 cursor-pointer rounded-md w-[50%] h-[10vw] md:h-[5vw] lg:h-[2vw] p-2" />
                                                    <AiOutlineDelete onClick={(e) => {
                                                        e.stopPropagation();
                                                        cartDeleteById(items._id)
                                                    }} className="bg-red-700 cursor-pointer rounded-md p-2 w-[50%] h-[10vw] md:h-[5vw] lg:h-[2vw]" />
                                                </div>
                                                <div className="flex items-center justify-center w-full h-[6vh] shrink-0 rounded-md">
                                                    {orderItemsCartIds?.includes(items._id) ?
                                                        (
                                                            orderItemsDetails.data
                                                                .filter((data: any) => data.items.cartId === items._id)
                                                                .map((data: any, index: number) => (
                                                                    <h2 key={index} onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onlinePay(data._id)
                                                                    }} className="text-sm bg-amber-400 w-full h-[6vh] items-center justify-center rounded-md p-2 flex">
                                                                        {data.paymentStatus !== 'paid' ? "Online Pay" : 'Order Paid'}
                                                                    </h2>
                                                                ))
                                                        )
                                                        :
                                                        <>
                                                            <h2
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    buyItem(items._id)
                                                                }}
                                                                className="text-sm bg-amber-400 cursor-pointer w-full h-[5vh] items-center justify-center rounded-md p-2 flex">
                                                                Order Item
                                                            </h2>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        }
                    </div>

                    {cartClicked &&
                        <>
                            <div
                                onClick={() => setCartClicked(false)}
                                className="fixed inset-0 w-full h-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                            >
                            </div>

                            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-30 -translate-x-1/2 text-justify p-4 h-[60vh] w-[90vw] md:w-[50%] md:h-[50%] lg:w-[25%] lg:h-[65%] font-bold text-sm title-header bg-black/20 rounded-xl">
                                <CartUpdatePage setCartClicked={setCartClicked} />
                            </div>
                        </>
                    }

                    {orderItemClick &&
                        <>
                            <div className="flex w-full h-full inset-0 bg-black/20 fixed" onClick={() => setOrderItemsClick(false)}>

                            </div>
                            <div className="w-[90vw] h-[16vh] md:w-[50%] lg:w-[30%] bg-gray-100 rounded-md fixed top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
                                <div className="w-full flex-col h-[7vh] flex p-2 px-4 items-end justify-between">
                                    <div
                                        onClick={() => {
                                            setOrderItemsClick(false)
                                            navigate('/customer/cart')
                                        }}
                                        className="flex border border-violet-300 p-1 h-[5vh] w-[5vh] items-center justify-center rounded-md ">
                                        <AiOutlineClose className="text-xl md:text-3xl" />
                                    </div>
                                    <div className="flex w-full text-sm">
                                        <h2>
                                            Payment Method
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex w-full h-[8vh] gap-2 items-center justify-center p-3 mt-2 text-sm">
                                    <button className="w-full cursor-pointer bg-amber-500 h-[5vh]" onClick={() => {
                                        directPayment()
                                    }}>
                                        <h2>
                                            Online Pay
                                        </h2>
                                    </button>
                                    <button className="w-full cursor-pointer bg-amber-500 h-[5vh]" onClick={() => cashPay()}>
                                        <h2>
                                            Cash Pay
                                        </h2>
                                    </button>
                                </div>
                            </div>
                        </>
                    }
                    {onlinePayClick &&
                        <>
                            <div className="flex w-full h-full inset-0 bg-black/20 fixed">

                            </div>
                            <div className="w-[90vw] h-[16vh] bg-gray-100 rounded-md fixed top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
                                <div className="flex flex-col w-full h-full items-center justify-center gap-2">
                                    <h2 className="text-sm">
                                        Procedding to Khalti Pay
                                    </h2>
                                    <Spin />
                                    <div className="flex w-full items-center justify-center h-[6vh]">
                                        <button onClick={() => {
                                            setOnlinePayClick(false)
                                            navigate("/customer/cart")
                                        }} className="flex w-[50vw] h-[5vh] bg-gray-400 rounded-md items-center justify-center">
                                            <h2 className="text-sm">
                                                Cancel
                                            </h2>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {isSuccess &&
                        <>
                            <div className="flex w-full h-full inset-0 bg-black/20 fixed">

                            </div>
                            <div className="w-[90vw] h-[16vh] bg-gray-100 rounded-md fixed top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
                                <div className="flex flex-col w-full h-full items-center justify-center gap-2">
                                    <h2 className="text-sm">
                                        Wait a second
                                    </h2>
                                    <Spin />
                                </div>
                            </div>
                        </>
                    }
                    {
                        addCartClick &&
                        <>
                            <div
                                onClick={() => setCartClicked(false)}
                                className="fixed inset-0 w-full h-full bg-black/50 z-40"
                            >
                            </div>

                            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-50 -translate-x-1/2 text-justify p-4 h-auto w-[90vw] md:w-[60vw] lg:w-[30vw] font-bold text-sm title-header bg-black/20 rounded-xl">
                                <CustomerAddCartPage setAddCartClick={setAddCartClick} />
                            </div>
                        </>
                    }
                </>
            }
        </>
    )
}

export default CustomerCartPage