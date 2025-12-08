import { useCallback, useEffect, useState } from "react"
import { type ProductResponse } from "../Admin/admin.validator"
import publicSvc from "../../service/public.service";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";
import { useAppContext } from "../../context/AppContext";
import HeaderComponent from "../../component/Header";
import Sidebar from "../../component/Sidebar";
import { AiOutlineRight, AiOutlineUser } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import customerSvc from "../../service/customer.service";
import CustomerAddToCartPage from "../Customer/CustomerAddToCartPage";
import SearchPage from "../SearchPage/SearchPage";

const MoreProductPage = () => {
    const [listProduct, setListProduct] = useState<ProductResponse | null>(null)
    const [cartProductIds, setCartProductIds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1)
    const { menuClick, loggedInUser, setMenuClick, setLoggedInUser, searchValue } = useAppContext();
    const [viewUser, setViewUser] = useState<boolean>(false)
    const [yesLoading, setYesLoading] = useState(false);
    const [noLoading, setNoLoading] = useState(false);
    const [cartClicked, setCartClicked] = useState<boolean>(false)
    const navigate = useNavigate();

    const handleRouting = () => {
        if (loggedInUser?.role === 'admin') {
            navigate('/admin')
        } else {
            navigate('/seller')
        }
    }

    const fetchProductList = useCallback(async (page: number) => {
        try {
            const response = await publicSvc.MoreProduct(page, 10);
            setListProduct(response.data)

            if (loggedInUser?.role === 'customer') {
                const response = await customerSvc.listCart();
                setCartProductIds(() => response.data.data.map((items: any) => items?.items?.product?._id))
            } else {
                setCartProductIds([])
            }

        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProductList(page!);
    }, [page]);

    const handleProductId = (id: string) => navigate(`/product/${id}`);

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

    console.log(listProduct)

    return (
        (!isLoading &&
            <div className="w-full h-full flex flex-col">
                <HeaderComponent />
                <div className={`flex w-full h-full gap-5 ${!menuClick && 'items-center justify-center'}`}>
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
                    <div className={`${menuClick ? "w-[80vw]" : 'w-full'} flex flex-col gap-2 h-full items-center justify-center p-2 mt-[12vw] lg:mt-[5vw]`}>
                        <div className={`${searchValue ? 'flex visible transition-all duration-300 h-full w-full -mt-[13vw] lg:mt-[1vw] items-center justify-center' : "hidden"}`}>
                            <SearchPage />
                        </div>
                        <h2 className={`flex text-xl p-2 ${menuClick ? 'w-[80vw] px-13' : 'w-[90vw]'}`}>
                            More Product
                        </h2>
                        <div className="flex flex-col w-[90vw] items-center justify-center gap-2">
                            <div className={`flex flex-col gap-5 ${menuClick ? 'lg:w-[75vw] lg:items-center lg:justify-center' : 'w-full'}`}>
                                <div className={`flex flex-col gap-2 items-center justify-center overflow-hidden md:grid md:grid-cols-3 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5 w-full'}`}>
                                    {listProduct!.data.length > 0 ? (
                                        listProduct?.data.map((item) => (
                                            <div key={item._id}
                                                onClick={() => {
                                                    handleProductId(item._id)
                                                }}
                                                className="flex border-2 w-93 rounded-md cursor-pointer border-violet-300 md:w-full"
                                            >
                                                <div className={`${menuClick ? '' : 'w-full'} lg:h-[50vh] flex flex-col h-[50vh] md:h-[30vh] gap-2 rounded-xl border-gray-500 mb-4 bg-gray-200/70 relative`}>
                                                    <div className="flex w-full h-full items-center justify-center">
                                                        <img src={item.images[0]?.secure_url} className="rounded-xl w-auto h-full" alt="dress-01" />
                                                    </div>
                                                    <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-sm md:text-sm  rounded-xl font-semibold text-black h-auto overflow-hidden z-10 p-2 pointer-event-none">
                                                        {item.title}
                                                    </div>
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                                                        {(loggedInUser?.role === 'admin' || loggedInUser?.role === 'seller') &&
                                                            <>
                                                                <div className="flex w-[27vw] h-[6vh] cursor-default bg-amber-500 rounded-md items-center justify-center text-white md:text-sm lg:w-[10vw] md:w-[20vw] md:h-[4vh] lg:h-[6vh]">
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
                                        <div className='flex items-center justify-center w-screen'>
                                            <Empty />
                                        </div>
                                    )}
                                </div>
                                <div className='flex w-full'>
                                    <span className='flex border border-t grow border-gray-500/30'></span>
                                </div>
                            </div>
                            <Pagination
                                current={page}
                                defaultCurrent={1}
                                onChange={(page) => setPage(page)}
                                pageSize={listProduct?.options.limit}
                                total={listProduct?.options.total}
                            />
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
                <div className='lg:hidden'>
                    {menuClick && (
                        <div
                            onClick={() => setMenuClick(false)}
                            className="fixed lg:hidden inset-0 bg-black/70 z-30 w-full h-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                        >

                        </div>
                    )
                    }
                    {
                        menuClick && (
                            <div className="fixed top-1/2 lg:hidden -translate-y-1/2 left-1/2 z-30 -translate-x-1/2 text-justify p-4 pt-10 h-[60vh] w-[75vw] md:h-[50vh] md:w-[60vw] text-white font-bold text-xl title-header bg-black/50">
                                <Sidebar />
                            </div>
                        )
                    }
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
            </div>
        )
    )
}

export default MoreProductPage