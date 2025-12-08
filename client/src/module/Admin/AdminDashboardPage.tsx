import { useCallback, useEffect, useState } from "react";
import { AiOutlineGift, AiOutlinePicture, AiOutlineTag, AiOutlineUser } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import adminSvc from "../../service/admin.service";
import type { BannerResponse, CategoryResponse, CouponResponse, UserResponse } from "./admin.validator";

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [userList, setUserList] = useState<UserResponse | null>(null)
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null)
    const [bannerList, setBannerList] = useState<BannerResponse | null>(null)
    const [couponList, setCouponList] = useState<CouponResponse | null>(null)

    const dashboardDetails = useCallback(async () => {
        try {
            const listUser = await adminSvc.listUsers();
            setUserList(listUser)

            const listCategory = await adminSvc.listCategory();
            setCategoryList(listCategory)

            const listBanner = await adminSvc.listActiveBanners(true);
            setBannerList(listBanner)

            const listCoupon = await adminSvc.listActiveCoupons(true);
            setCouponList(listCoupon);
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        dashboardDetails();
    }, [])

    return (
        <>
            {!isLoading &&
                <>
                    <div className="flex w-full flex-col lg:w-[90vw] lg:gap-5">
                        <div className="flex w-full flex-col gap-4">
                            <h1 className="flex header-title text-sm md:text-base bg-gray-100 rounded-md p-2 w-full h-[5vh] shrink-0">
                                Dashboard
                            </h1>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-none lg:flex-row lg:flex w-full h-[38vh] md:h-[19vh] p-2 gap-2 lg:items-center lg:justify-center">
                                <div className="flex flex-col w-full h-[17vh] shirnk-0 lg:w-[15vw] border border-violet-300">
                                    <div className="flex flex-col items-center justify-center h-full w-full text-lg gap-1">
                                        <p className="md:text-sm">
                                            {userList?.options.total}
                                        </p>
                                        <p className='header-title md:text-sm'>
                                            Total Users
                                        </p>
                                        <AiOutlineUser className=" text-xl md:text-3xl  text-blue-700" />
                                    </div>
                                </div>
                                <div className="flex flex-col w-full h-[17vh] shirnk-0 lg:w-[15vw] border border-violet-300">
                                    <div className="flex flex-col items-center justify-center h-full w-full text-lg gap-1">
                                        <p className="md:text-sm">
                                            {categoryList?.options.total}
                                        </p>
                                        <p className='header-title md:text-sm'>
                                            Total Categories
                                        </p>
                                        <AiOutlineTag className="text-xl md:text- text-blue-700" />
                                    </div>
                                </div>
                                <div className="flex flex-col w-full h-[17vh] shirnk-0 lg:w-[15vw] border border-violet-300">
                                    <div className="flex flex-col items-center justify-center h-full w-full text-lg gap-1">
                                        <p className="md:text-sm">
                                            {bannerList?.options.total}
                                        </p>
                                        <p className='header-title md:text-sm'>
                                            Active Banners
                                        </p>
                                        <AiOutlinePicture className="text-xl md:text-3xl text-blue-700" />
                                    </div>
                                </div>
                                <div className="flex flex-col w-full h-[17vh] shirnk-0 lg:w-[15vw] border border-violet-300">
                                    <div className="flex flex-col items-center justify-center h-full w-full text-lg gap-1">
                                        <p className="md:text-sm">
                                            {couponList?.options.total}
                                        </p>
                                        <p className='header-title md:text-sm'>
                                            Active Coupons
                                        </p>
                                        <AiOutlineGift className="text-blue-700 text-xl md:text-3xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full bg-gray-50">
                            <h1 className="flex header-title md:text-base p-2 bg-gray-200 rounded-md w-full text-xl">
                                QUICK MANAGEMENT LINKS
                            </h1>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full p-2 mt-[2vh] bg-gray-200 h-[15vh]">
                                <button onClick={() => navigate('/admin/banner')} className="flex p-2 cursor-pointer bg-green-950/80 rounded-md text-white text-sm header-title md:text-base items-center justify-center w-full">Manage Banner</button>
                                <button onClick={() => navigate('/admin/category')} className="flex p-2 cursor-pointer bg-green-950/80 rounded-md text-white text-sm header-title md:text-base items-center justify-center w-full">Manage Category</button>
                                <button onClick={() => navigate('/admin/coupon')} className="flex p-2 cursor-pointer bg-green-950/80 rounded-md text-white text-sm header-title md:text-base items-center justify-center w-full">Manage Coupon</button>
                                <button onClick={() => navigate('/admin/users')} className="flex p-2 cursor-pointer bg-green-950/80 rounded-md text-white text-sm header-title md:text-base items-center justify-center w-full">Manage User</button>
                            </div>
                        </div>
                    </div>
                </>}
        </>
    )
}

export default AdminDashboardPage