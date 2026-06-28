import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import type { CategoryResponse } from "../Admin/admin.validator";
import type { ListCategoryDetails } from "../HomePage/homepage.validation";
import publicSvc from "../../service/public.service";
import { FaAngleRight, FaBox, FaShoppingCart, FaPlus } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const SellerDashboardPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null)
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalCategories: 0
    })

    const dashboardDetails = useCallback(async () => {
        try {
            const listCategory = await publicSvc.listCategories();
            setCategoryList(listCategory.data)
            setStats(prev => ({
                ...prev,
                totalCategories: listCategory.data?.options?.total || 0
            }))
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        dashboardDetails();
    }, [])

    const getImageUrl = (item: ListCategoryDetails) => {
        return item?.image?.secure_url || '/placeholder-category.png';
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {!isLoading &&
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Seller Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your products and track your business performance</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaBox className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                                <p className="text-gray-600 text-sm">Total Products</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaShoppingCart className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                                <p className="text-gray-600 text-sm">Total Orders</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <MdCategory className="text-purple-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{stats.totalCategories}</p>
                                <p className="text-gray-600 text-sm">Categories</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
                            <button 
                                onClick={() => navigate('/seller/product')} 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                View All <FaAngleRight />
                            </button>
                        </div>
                        
                        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4">
                            {categoryList?.data && categoryList?.data.length > 0 ? (
                                categoryList.data.map((item) => (
                                    <div 
                                        key={item._id} 
                                        className="flex flex-col bg-gray-50 rounded-lg shrink-0 w-48 md:w-56 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate('/seller/product')}
                                    >
                                        <div className="h-36 md:h-44 overflow-hidden rounded-t-lg">
                                            <img
                                                src={getImageUrl(item)}
                                                alt={item.name || 'Category'}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-category.png';
                                                }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-gray-800 text-center truncate">{item.name}</h3>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-12">
                                    <p className="text-gray-500">No categories found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => navigate('/seller/product')} 
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
                            >
                                <FaBox />
                                Manage Products
                            </button>
                            <button 
                                onClick={() => navigate('/seller/create')} 
                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
                            >
                                <FaPlus />
                                Create New Product
                            </button>
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

export default SellerDashboardPage