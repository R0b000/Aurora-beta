import { AiOutlineSmile } from "react-icons/ai"
import { FaUserCircle } from "react-icons/fa"
import { FaUserLarge, FaUserLargeSlash } from "react-icons/fa6"
import {
    AiOutlinePhone,
    AiOutlineCheckCircle,
    AiOutlineHome,
    AiFillStar,
    AiOutlineUser,
    AiOutlineEnvironment,
    AiOutlineHeart,
    AiOutlineFileText,
    AiOutlineShop,
    AiOutlineNumber,
} from "react-icons/ai";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { listUserProps, ProductResponse } from "./admin.validator";
import adminSvc from "../../service/admin.service";

const AdminUserViewPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [userDetails, setUserList] = useState<listUserProps | null>(null)
    const [sellerProduct, setSellerProduct] = useState<ProductResponse | null>(null)

    const fetchUserDetails = useCallback(async (id: string) => {
        try {
            const response = await adminSvc.getSingleUserById(id);
            setUserList(response.data);

            const sellerProducts = await adminSvc.getSellerProduct(id);
            setSellerProduct(sellerProducts)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (id) {
            fetchUserDetails(id)
        }
    }, [id])

    const sellerTabs = [
        { id: "profile", label: "Profile" },
        { id: "products", label: "Products" },
        { id: "reviews", label: "Reviews" },
    ]

    const customerTabs = [
        { id: "profile", label: "Profile" },
        // { id: "order", label: "Order" },
        { id: "reviews", label: "Reviews" },
    ]

    const userAddresses = (userDetails?.addresses || [])

    return (
        <>
            {!isLoading &&
                <>
                    <div className="flex flex-col w-[90%] h-auto bg-gray-50 rounded-md p-2 gap-4 items-center">
                        <div className="w-[88vw] md:w-[75vw] h-auto items-center justify-center flex flex-col">
                            <div
                                className="flex gap-2 h-auto w-auto shrink-0 items-center justify-between p-2 rounded-md border border-violet-300 md:w-[90%]">
                                <div className="flex flex-col gap-2 w-[87%]">
                                    <div className="flex text-sm md:text-base gap-3 font-semibold">
                                        <div className="flex w-[28%] h-auto shrink-0 text-blue-400">
                                            <FaUserCircle size={80} />
                                        </div>
                                        <div className="p-2">
                                            <p className="flex text-sm md:text-base">
                                                {userDetails?.name}
                                            </p>
                                            <p className="flex text-sm md:text-base">
                                                {userDetails?.role}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="flex text-sm md:text-base font-semibold">
                                        Email: {userDetails?.email}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 text-white w-[13%] h-full shrink-0 items-center justify-center">
                                    {userDetails?.isBan ?
                                        <FaUserLargeSlash className="bg-blue-800 rounded-md w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw] p-2" />
                                        :
                                        <FaUserLarge className="bg-blue-800 rounded-md w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw] p-2" />
                                    }
                                </div>
                            </div>
                            <div className="flex gap-3 items-center justify-center h-[7vh] w-full shrink-0">
                                {userDetails?.role === 'customer' ? customerTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex border border-violet-300 p-2 w-[30%] cursor-pointer items-center justify-center rounded-xl header-title h-[5vh] text-sm md:text-base 
                                ${activeTab === tab.id ? "bg-green-700" : "bg-green-900/40"}`}
                                    >
                                        {tab.label}
                                    </button>
                                )) : sellerTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex border border-violet-300 p-2 w-[30%] cursor-pointer items-center justify-center rounded-xl header-title h-[5vh] text-sm md:text-base 
                                ${activeTab === tab.id ? "bg-green-700" : "bg-green-900/40"}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {activeTab === 'profile' &&
                                <div className="shrink-0 flex flex-col border border-gray-300 h-auto w-full rounded-md p-5 space-y-5 bg-white shadow-sm text-justify">
                                    <li className="flex items-center gap-2">
                                        <AiOutlinePhone className="text-gray-600" />
                                        <span>{userDetails?.phone || '----No phone number found----'}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <AiOutlineCheckCircle className="text-green-600" />
                                        <span>{userDetails?.isVerified === true ? "Verified User" : "Not Verified User"}</span>
                                    </li>
                                    {userDetails?.role === 'seller' &&
                                        <>
                                            {/* Seller Profile Section */}
                                            <div>
                                                <h1 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <AiOutlineShop />
                                                    Seller Profile
                                                </h1>
                                                <ul className="space-y-2 text-gray-700">

                                                    <li className="flex items-center gap-2">
                                                        <AiOutlineShop className="text-gray-600" />
                                                        <span><strong>Company</strong>: {userDetails?.sellerProfile?.companyName || "Not registered"}</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <AiOutlineNumber className="text-gray-600" />
                                                        <span><strong>GST Number</strong>: {userDetails?.sellerProfile?.gstNumber || "Not registered"}</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <AiOutlineUser className="text-gray-600" />
                                                        <span><strong>Bio</strong>: {userDetails?.sellerProfile?.bio || "Bio not found"}</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <AiOutlineEnvironment className="text-gray-600" />
                                                        <span><strong>Address</strong>: {userDetails?.sellerProfile?.address || "Not registered"}</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <AiFillStar className="text-yellow-500" />
                                                        <span><strong>Rating</strong>: {userDetails?.sellerProfile?.rating || "No data"}</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <AiOutlineFileText className="text-gray-600" />
                                                        <span><strong>Total Reviews</strong>: {userDetails?.sellerProfile?.totalReviews || "No data"}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </>
                                    }
                                    {/* Addresses Section */}
                                    <div className="border-t border-gray-200 pt-3">
                                        <h1 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <AiOutlineHome />
                                            Addresses
                                        </h1>
                                        <ul className="space-y-2 text-gray-700">
                                            <ul className="space-y-4 text-gray-700">
                                                {userAddresses.length > 0 ? (
                                                    userAddresses.map((addr, index) => (
                                                        <li key={index} className="space-y-2 border p-3 rounded-md">

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineEnvironment className="text-gray-600" />
                                                                <span><strong>Label</strong>: {addr.label || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineUser className="text-gray-600" />
                                                                <span><strong>Full Name</strong>: {addr.fullName || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlinePhone className="text-gray-600" />
                                                                <span><strong>Phone</strong>: {addr.phone || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineFileText className="text-gray-600" />
                                                                <span><strong>Line 1</strong>: {addr.line1 || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineFileText className="text-gray-600" />
                                                                <span><strong>Line 2</strong>: {addr.line2 || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineEnvironment className="text-gray-600" />
                                                                <span><strong>City</strong>: {addr.city || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineEnvironment className="text-gray-600" />
                                                                <span><strong>State</strong>: {addr.state || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineNumber className="text-gray-600" />
                                                                <span><strong>Postal Code</strong>: {addr.postalCode || 'No data'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <AiOutlineEnvironment className="text-gray-600" />
                                                                <span><strong>Country</strong>: {addr.country || 'No data'}</span>
                                                            </div>

                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>No addresses found</li>
                                                )}
                                            </ul>
                                        </ul>
                                    </div>

                                    {/* Favourites Section */}
                                    <div className="border-t border-gray-200 pt-3">
                                        <h1 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <AiOutlineHeart />
                                            Favourites
                                        </h1>
                                        <ul className="space-y-2 text-gray-700">
                                            {userDetails?.favourites?.length ? (
                                                userDetails.favourites.map((index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <AiOutlineHeart className="text-red-500" />
                                                        <span><strong>Favourite</strong>: </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <span>No data</span>
                                                </li>
                                            )}

                                        </ul>
                                    </div>
                                </div>
                            }

                            {activeTab === 'products' &&
                                <>
                                    <div className="flex flex-col w-full items-center justify-center p-2 rounded-md gap-3 md:grid-cols-2 md:grid lg:grid-cols-4">
                                        {sellerProduct?.data.map((items, index) => (
                                            <div key={index} className="border rounded-xl p-2 w-full overflow-clip border-violet-300 md:h-[35vh] lg:h-[50vh]">
                                                <div className="gap-2 rounded-xl border-gray-500 mb-4 w-full h-full bg-gray-200 relative">
                                                    <div className="aboslute flex w-full h-full ">
                                                        <img
                                                            src={items.images[0]?.secure_url}
                                                            className="rounded-xl w-full max-h-auto object-cover"
                                                            alt="dress-01"
                                                        />
                                                    </div>
                                                    <div className="absolute top-0 w-full bg-gray-100 flex flex-col gap-2 text-base px-10 rounded-xl font-semibold text-black h-auto overflow-hidden z-2 p-2">
                                                        {items.title}
                                                    </div>
                                                    <div className="flex w-full h-[5vh]">
                                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full bg-green-100 flex flex-col text-base px-10 rounded-xl font-semibold text-black h-[5vh] overflow-hidden z-2 p-2 header-title">
                                                            {items.currency} {items.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {sellerProduct?.data.length === 0 &&
                                            <div className="flex w-full items-center justify-center gap-2 text-base">
                                                No Data Found. <AiOutlineSmile />
                                            </div>
                                        }
                                    </div>
                                </>
                            }

                            {activeTab === 'reviews' &&
                                <>
                                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 w-full items-center justify-center gap-2 p-5 py-10 rounded-md bg-gray-50">
                                        <div className="flex flex-col w-90 h-[45vh] gap-2 md:h-[30vh] md:w-full rounded-xl border-gray-500 mb-4 bg-gray-200 relative">
                                            <div className="aboslute flex w-full h-full place-items-center items-center justify-center">
                                                <img
                                                    src='data:image/jpeg;base64,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'
                                                    className="rounded-xl w-full h-auto"
                                                    alt="dress-01"
                                                />
                                            </div>
                                            <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-base px-10 rounded-xl font-semibold text-black h-auto overflow-hidden z-2 p-2">
                                                Camera: jsdfouek sjdfli ajsdf
                                            </div>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex w-[50vw] items-center justify-center z-2 ">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="flex w-full md:w-[15vw] border-gray-400 bg-gray-100 border-2 text-base rounded-xl p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh]">
                                                    <h3>View Review</h3>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-90 h-[45vh] gap-2 md:h-[30vh] md:w-full rounded-xl border-gray-500 mb-4 bg-gray-200 relative">
                                            <div className="aboslute flex w-full h-full place-items-center items-center justify-center">
                                                <img
                                                    src='data:image/jpeg;base64,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'
                                                    className="rounded-xl w-full h-auto"
                                                    alt="dress-01"
                                                />
                                            </div>
                                            <div className="absolute w-full bg-gray-100 flex flex-col gap-2 text-base px-10 rounded-xl font-semibold text-black h-auto overflow-hidden z-2 p-2">
                                                Camera: jsdfouek sjdfli ajsdf
                                            </div>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex w-[50vw] items-center justify-center z-2 ">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="flex w-full md:w-[15vw] border-gray-400 bg-gray-100 border-2 text-base rounded-xl p-2 font-semibold items-center justify-center transition-all duration-500 h-[6vh]">
                                                    <h3>View Review</h3>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div >
                </>
            }
        </>
    )
}

export default AdminUserViewPage