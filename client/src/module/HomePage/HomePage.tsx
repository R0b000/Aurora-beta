import React, { useCallback, useEffect, useState } from 'react';
import publicSvc from '../../service/public.service';
import type { ListCategoryDetails, ListProductDetails } from './homepage.validation';
import { useNavigate } from 'react-router-dom';
import HeaderComponent from '../../component/Header';
import { useAppContext } from "../../context/AppContext";
import SearchPage from "../SearchPage/SearchPage";
import Sidebar from "../../component/Sidebar";
import CustomerAddToCartPage from "../Customer/CustomerAddToCartPage";
import customerSvc from "../../service/customer.service";
import Logo from '../../assets/mobile_logo.png'
import { Empty } from 'antd';
import { AiOutlineRight, AiOutlineUser } from 'react-icons/ai';
import { MdDashboard } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { ImSpinner9 } from 'react-icons/im';

export interface HomePageCartProps {
    setCartClicked: React.Dispatch<React.SetStateAction<boolean>>
}

const HomePage = () => {
    const { searchClick, searchValue, menuClick, setMenuClick, loggedInUser, setLoggedInUser } = useAppContext();
    const [listCategoriesDetails, setListCategoriesDetails] = useState<ListCategoryDetails[]>([])
    const [listProductDetails, setListProductDetails] = useState<ListProductDetails[]>([])
    const [cartProductIds, setCartProductIds] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [cartClicked, setCartClicked] = useState<boolean>(false)
    const navigate = useNavigate();
    const [viewUser, setViewUser] = useState<boolean>(false)
    const [yesLoading, setYesLoading] = useState(false);
    const [noLoading, setNoLoading] = useState(false);

    const handleRouting = () => {
        if (loggedInUser?.role === 'admin') {
            navigate('/admin')
        } else {
            navigate('/seller')
        }
    }

    const listProducts = useCallback(async (id?: string) => {
        try {
            setIsLoading(true)
            const response = await publicSvc.listProduct(id);
            setListProductDetails(response.data.data);

            const categoryList = await publicSvc.listCategories()
            setListCategoriesDetails(categoryList.data.data)

            if (loggedInUser?.role === 'customer') {
                const response = await customerSvc.listCart();
                setCartProductIds(() => response.data.data.map((items: any) => items?.items?.product?._id))
            } else {
                setCartProductIds(null)
            }
        } catch (error) {
            console.log("Error listing products")
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [loggedInUser])

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
            setCartClicked(true)
            navigate(`?id=${id}`)
        } catch (error) {
            throw error
        }
    }

    useEffect(() => {
        setMenuClick(false)
        listProducts();
    }, [localStorage.getItem('actualToken'), loggedInUser])

    return (
        isLoading ?
            <div className="flex flex-col w-screen h-screen items-center justify-center">
                <img src={Logo} alt="" className='w-50 h-10 animate-pulse' />
            </div> :
            <>
                <HeaderComponent />
                <div className={`${menuClick && ''} flex w-full h-full`}>
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
                    <div className={`${menuClick ? "w-full lg:w-[80vw] lg:items-center lg:justify-center" : ""}`}>
                        {/*Main Content*/}
                        <div className={`flex flex-col p-2 lg:mt-2`}>
                            <div className={`${searchValue ? 'flex visible transition-all duration-300 h-full w-full items-center justify-center lg:mt-[14vh] md:-mt-[1vh]' : "hidden"}`}>
                                <SearchPage />
                            </div>
                            <div className='flex flex-col w-full h-auto lg:gap-3 lg:items-center lg:justify-center'>
                                <div className={`${searchValue ? 'hidden' : "transition-all duration-300"}`}>
                                    <div className={`flex flex-col w-full lg:h-[50vh] md:h-[45vh] h-[29vh] overflow-clip ${searchClick ? "-mt-[4vh] md:-mt-[6vh] lg:mt-[1vh]" : "mt-[6vh]"} `}>
                                        <div className="flex w-full h-[30vh] md:h-[50vh] relative items-center justify-center shrink-0 overflow-clip">
                                            <img className='w-full h-auto lg:w-[60vw] md:w-full' src="https://cdn.shopify.com/app-store/listing_images/9b9f5ef0a0c2024bfb66ec52f962f4da/promotional_image/CI7ykufjqo0DEAE=.png?height=720&width=1280" alt="banner-img" />
                                            <button className={`flex absolute bottom-5 md:bottom-20 lg:bottom-3 left-1/2 -translate-x-1/2 bg-green-900/90 p-2 rounded-xl text-white text-xl`}>Shop Now</button>
                                        </div>
                                    </div >
                                </div>
                                <div className={`flex h-[20vh] shrink-0 lg:h-[25vh] md:h-[21vh] overflow-x-visible border rounded-md border-gray-50 justify-center ${menuClick ? 'w-full' : "w-full"}`}>
                                    <div className={`flex h-full overflow-x-auto md:gap-2 gap-2 no-scrollbar md:items-center ${menuClick ? 'w-[63vw]' : 'lg:justify-center  w-[97vw] '}`}>
                                        {listCategoriesDetails.length > 0 ? (
                                            listCategoriesDetails.map((item, index) => (
                                                <div key={index} className={`cursor-pointer ${menuClick ? 'lg:w-[10vw]' : "lg:w-[10vw]"} flex flex-col w-[31vw] md:w-[24vw] lg:h-full md:h-[20vh] rounded-xl shrink-0 border border-violet-300 items-center justify-center overflow-hidden`}>
                                                    <div className='flex h-[16vh] shrink-0'>
                                                        <img
                                                            src={item.image?.secure_url}
                                                            alt={item.name}
                                                            className="h-[15vh] w-auto rounded-xl object-cover"
                                                        />
                                                    </div>
                                                    <div className='flex w-full items-center justify-center h-[12v] text-base'>{item.name}</div>
                                                </div>
                                            ))
                                        ) : <>
                                            <div className='flex w-full h-full items-center justify-center'>
                                                <Empty />
                                            </div>
                                        </>}
                                    </div>
                                </div>
                                <div className={`flex flex-col items-center justify-center h-auto ${menuClick ? 'lg:w-[75vw]' : 'w-full'}`}>
                                    <div className={`flex flex-col gap-3 ${menuClick ? 'lg:w-[75vw]' : 'w-[95vw]'}`}>
                                        <h1 className="flex header-title text-xl md:text-xl">
                                            BEST SELLER
                                        </h1>
                                        <div className={`flex flex-col gap-5 ${menuClick ? 'lg:w-[75vw] lg:items-center lg:justify-center' : 'w-full'}`}>
                                            <div className={`flex flex-col gap-2 items-center justify-center overflow-hidden md:grid md:grid-cols-3 ${menuClick ? 'lg:grid-cols-4' : 'lg:grid-cols-5 w-full'}`}>
                                                {listProductDetails.length > 0 ? (
                                                    listProductDetails.map((item) => (
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
                                                    <div className='flex h-full items-center justify-center w-screen'>
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
                    </div >
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
            </>
    )
}

export default HomePage