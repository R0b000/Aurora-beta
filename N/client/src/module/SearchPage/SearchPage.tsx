import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext"
import publicSvc from "../../service/public.service";
import type { ListProductDetails } from "../HomePage/homepage.validation";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";
import customerSvc from "../../service/customer.service";
import CustomerAddToCartPage from "../Customer/CustomerAddToCartPage";

const SearchPage = () => {
    const { searchValue, setAntdSearchClick, loggedInUser, setSearchClick, setSearchValue, menuClick } = useAppContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchDetails, setSearchDetails] = useState<ListProductDetails[]>([]);
    const [cartProductIds, setCartProductIds] = useState<any | null>(null)
    const [cartClicked, setCartClicked] = useState<boolean>(false)
    const navigate = useNavigate();

    const fetchSearchResult = useCallback(async (title: string, signal?: AbortSignal) => {
        try {
            const response = await publicSvc.searchProduct(title, signal)
            setSearchDetails(response.data.data)

            if (loggedInUser?.role === 'customer') {
                const response = await customerSvc.listCart();
                setCartProductIds(() => response.data.data.map((items: any) => items?.items?.product?._id))
            } else {
                setCartProductIds(null)
            }
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') {
                // Request was cancelled, ignore
                return
            }
            throw error
        } finally {
            setAntdSearchClick(false)
            setIsLoading(false)
        }
    }, [setAntdSearchClick])

    const handleProductId = (id: string) => {
        try {
            navigate(`/product/${id}`)
            setSearchValue('')
            setSearchClick(false)
        } catch (error) {
            console.log("Something is wrong here.")
            throw error
        }
    }

    const addToCartClick = (id: string) => {
        try {
            if (!loggedInUser) {
                navigate('/auth/login');
            }
            setCartClicked(true)
            navigate(`?id=${id}`)
        } catch (error) {
            throw error
        }
    }

    useEffect(() => {
        if (searchValue) {
            const controller = new AbortController();
            const timer = setTimeout(() => {
                fetchSearchResult(searchValue, controller.signal);
            }, 2000);

            return () => {
                clearTimeout(timer);
                controller.abort();
            };
        }
    }, [searchValue, fetchSearchResult])

    return (
        <>
            {!isLoading &&
                <div>
                    <div className="flex flex-col gap-4 w-full h-full items-center justify-center lg:-mt-25">
                        <div className="flex w-full">
                            <div className="flex font-semibold text-2xl px-5 underline w-full h-[5vh] items-center md:-mt-8">
                                Search Result: {searchValue}
                            </div>
                        </div>
                        <div className="flex flex-col w-full gap-5 px-5 ">
                            <div className={`flex flex-col w-full gap-2 items-center justify-center overflow-hidden md:grid md:grid-cols-3 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
                                {searchDetails.length > 0 ? (
                                    searchDetails.map((item) => (
                                        <div key={item._id}
                                            onClick={() => {
                                                handleProductId(item._id)
                                            }}
                                            className="flex border-2 w-93 rounded-md border-violet-300 md:w-full"
                                        >
                                            <div className="flex flex-col w-full h-[50vh] md:h-[30vh] cursor-pointer lg:h-[50vh] gap-2 rounded-xl border-gray-500 mb-4 bg-gray-200/70 relative">
                                                <div className="flex w-full h-full items-center justify-center">
                                                    <img src={item.images[0]?.secure_url} className="rounded-xl w-auto h-full" alt="dress-01" />
                                                </div>
                                                <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-sm md:text-sm  rounded-xl font-semibold text-black h-auto overflow-hidden z-10 p-2 pointer-event-none">
                                                    {item.title}
                                                </div>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                                                    {(loggedInUser?.role === 'admin' || loggedInUser?.role === 'seller') &&
                                                        <>
                                                            <div className="flex h-[5vh] bg-amber-500 cursor-default rounded-md items-center justify-center text-white md:text-sm lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
                                                                <h2 className="text-sm">
                                                                    Qty: {item.stock}
                                                                </h2>
                                                            </div>
                                                        </>
                                                    }

                                                    {(loggedInUser?.role === 'customer' || loggedInUser === null) && (item.stock === 0 ?
                                                        <>
                                                            <div className="flex h-[6vh] cursor-default bg-amber-300 rounded-md items-center justify-center text-red-900 lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
                                                                <h2 className="text-sm">
                                                                    OUT OF STOCK
                                                                </h2>
                                                            </div>
                                                        </>
                                                        :
                                                        (cartProductIds?.includes(item._id) ?
                                                            <h2 className="flex border-gray-400 bg-teal-400 text-sm rounded-md lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh] text-white p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh] header-title">ADDED TO CART</h2>
                                                            :
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addToCartClick(item._id)
                                                                }}
                                                                className="flex cursor-pointer hover:scale-110 border-gray-400 bg-orange-400 text-sm rounded-md text-white p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh] header-title lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
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
                                    Other Products
                                </button>
                            </div>
                        </div>
                        <div className="flex w-full mt-3 p-2 mb-4">

                        </div>
                    </div>
                    {
                        cartClicked &&
                        <>
                            <div
                                onClick={() => setCartClicked(false)}
                                className="fixed inset-0 w-full h-full bg-black/20 z-40"
                            >
                            </div>

                            <div className="fixed top-1/2 -translate-y-1/2 left-1/2 z-50 -translate-x-1/2 text-justify p-4 h-auto w-[90vw] md:w-[60vw] lg:w-[30vw] font-bold text-xl title-header bg-black/20 rounded-xl">
                                <CustomerAddToCartPage setCartClicked={setCartClicked} />
                            </div>
                        </>
                    }
                </div>

            }
        </>
    )
}

export default SearchPage