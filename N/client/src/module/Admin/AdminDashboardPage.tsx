import { useCallback, useEffect, useState } from "react";
import { AiOutlineGift, AiOutlinePicture, AiOutlineTag, AiOutlineUser } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import { FaBox, FaChartBar, FaShoppingCart, FaUsers } from "react-icons/fa";
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

    const StatCard = ({ 
        title, 
        value, 
        icon: Icon, 
        color = 'blue' 
    }: { 
        title: string; 
        value: number | undefined; 
        icon: React.ElementType; 
        color?: string 
    }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
        };

        return (
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} p-4 rounded-full`}>
                    <Icon className="text-2xl" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-gray-800">{value ?? 0}</p>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                </div>
            </div>
        );
    };

    const QuickLinkButton = ({ 
        label, 
        path, 
        color = 'blue' 
    }: { 
        label: string; 
        path: string; 
        color?: string 
    }) => {
        const colorClasses = {
            blue: 'bg-blue-600 hover:bg-blue-700',
            green: 'bg-green-600 hover:bg-green-700',
            purple: 'bg-purple-600 hover:bg-purple-700',
            orange: 'bg-orange-600 hover:bg-orange-700'
        };

        return (
            <button 
                onClick={() => navigate(path)} 
                className={`flex items-center justify-center gap-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} text-white py-4 px-4 rounded-lg font-medium transition-colors`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {!isLoading &&
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Overview of your e-commerce platform</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        <StatCard 
                            title="Total Users" 
                            value={userList?.options?.total} 
                            icon={AiOutlineUser}
                            color="blue"
                        />
                        <StatCard 
                            title="Total Categories" 
                            value={categoryList?.options?.total} 
                            icon={AiOutlineTag}
                            color="green"
                        />
                        <StatCard 
                            title="Active Banners" 
                            value={bannerList?.options?.total} 
                            icon={AiOutlinePicture}
                            color="purple"
                        />
                        <StatCard 
                            title="Active Coupons" 
                            value={couponList?.options?.total} 
                            icon={AiOutlineGift}
                            color="orange"
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Management</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <QuickLinkButton label="Manage Banners" path="/admin/banner" color="blue" />
                            <QuickLinkButton label="Manage Categories" path="/admin/category" color="green" />
                            <QuickLinkButton label="Manage Coupons" path="/admin/coupon" color="purple" />
                            <QuickLinkButton label="Manage Users" path="/admin/users" color="orange" />
                        </div>
                    </div>
                </div>
            }
            {isLoading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboardPage