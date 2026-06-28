import React, { useCallback, useEffect, useState } from 'react';
import publicSvc from '../../service/public.service';
import customerSvc from '../../service/customer.service';
import type { ListCategoryDetails, ListProductDetails } from './homepage.validation';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from "../../context/AppContext";
import HeaderComponent from '../../component/Header';
import { Empty, Skeleton } from 'antd';
import { FaHeart, FaShoppingCart, FaEye, FaStar, FaFire, FaShippingFast, FaCreditCard, FaHeadset, FaTag, FaBoxOpen } from 'react-icons/fa';

export interface HomePageCartProps {
    setCartClicked: React.Dispatch<React.SetStateAction<boolean>>
}

const HomePage = () => {
    const { searchClick, searchValue, setAntdSearchClick, menuClick, loggedInUser } = useAppContext();
    const [listCategoriesDetails, setListCategoriesDetails] = useState<ListCategoryDetails[]>([])
    const [listProductDetails, setListProductDetails] = useState<ListProductDetails[]>([])
    const [cartProductIds, setCartProductIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isCartLoading, setIsCartLoading] = useState<boolean>(false)
    const navigate = useNavigate();

    const listProducts = useCallback(async (id?: string) => {
        try {
            setIsLoading(true)
            const response = await publicSvc.listProduct(id);
            setListProductDetails(response.data.data || []);

            const categoryList = await publicSvc.listCategories()
            setListCategoriesDetails(categoryList.data.data || [])

            if (loggedInUser?.role === 'customer') {
                const response = await fetchCartItems();
                setCartProductIds(response || [])
            } else {
                setCartProductIds([])
            }
        } catch (error) {
            console.log("Error loading homepage data")
        } finally {
            setIsLoading(false)
        }
    }, [loggedInUser])

    const fetchCartItems = async () => {
        try {
            const response = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('actualToken')}` }
            });
            const data = await response.json();
            return data.data?.map((item: any) => item?.items?.product?._id) || [];
        } catch {
            return [];
        }
    };

    const handleProductId = (id: string) => {
        navigate(`/product/${id}`)
    }

    const addToCartClick = (id: string) => {
        if (!loggedInUser) {
            navigate('/auth/login');
            return;
        }
        setIsCartLoading(true)
        navigate(`?id=${id}`)
        setTimeout(() => setIsCartLoading(false), 500)
    }

    useEffect(() => {
        listProducts();
    }, [localStorage.getItem('actualToken'), loggedInUser])

    const getCategoryImage = (item: ListCategoryDetails) => {
        return item?.image?.secure_url || '/placeholder-category.png';
    }

    const getProductImage = (item: ListProductDetails) => {
        return item?.images?.[0]?.secure_url || '/placeholder-product.png';
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderComponent />
            {isLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading amazing products...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Hero Banner Section */}
                    <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
                        <div className="container mx-auto px-4 py-12 md:py-20 lg:py-28">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="text-center lg:text-left">
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                                        Summer Sale Collection
                                    </h1>
                                    <p className="text-lg md:text-xl mb-6 text-blue-100">
                                        Discover our premium quality products with amazing discounts
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        <button 
                                            onClick={() => navigate('/product/more')}
                                            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            Shop Now
                                        </button>
                                        <button 
                                            onClick={() => navigate('/product/more')}
                                            className="border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                        >
                                            View Collection
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <img 
                                        src="https://images.unsplash.com/photo-1441986300917-ca0527cc0021?w=600&h=400&fit=crop" 
                                        alt="Hero Banner"
                                        className="rounded-lg shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="bg-white py-8 border-b border-gray-200">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3 justify-center p-4">
                                    <FaShippingFast className="text-3xl text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base">Free Shipping</h3>
                                        <p className="text-xs text-gray-600">On orders over $99</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 justify-center p-4">
                                    <FaCreditCard className="text-3xl text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base">Secure Payment</h3>
                                        <p className="text-xs text-gray-600">100% secure payment</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 justify-center p-4">
                                    <FaHeadset className="text-3xl text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base">24/7 Support</h3>
                                        <p className="text-xs text-gray-600">Dedicated support</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 justify-center p-4">
                                    <FaTag className="text-3xl text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base">Best Offers</h3>
                                        <p className="text-xs text-gray-600">Special offers daily</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Categories Section */}
                    <section className="container mx-auto px-4 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <FaBoxOpen className="text-blue-600" />
                                Shop by Category
                            </h2>
                        </div>
                        
                        {listCategoriesDetails.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                {listCategoriesDetails.map((item: ListCategoryDetails) => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => navigate('/product/more')}
                                        className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={getCategoryImage(item)}
                                                alt={item.name || 'Category'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-category.png';
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 text-center">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {item.name}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-16">
                                <Empty description="No categories found" />
                            </div>
                        )}
                    </section>

                    {/* Best Sellers Section */}
                    <section className="bg-gray-100 py-12">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaFire className="text-orange-500" />
                                    Best Sellers
                                </h2>
                                <button 
                                    onClick={() => navigate('/product/more')}
                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                    View All
                                </button>
                            </div>

                            {listProductDetails.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {listProductDetails.map((item: ListProductDetails) => (
                                        <div 
                                            key={item._id}
                                            onClick={() => handleProductId(item._id)}
                                            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                        >
                                            <div className="relative aspect-square overflow-hidden">
                                                <img 
                                                    src={getProductImage(item)}
                                                    alt={item.title || 'Product'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                                    }}
                                                />
                                                {item.stock === 0 && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                        Out of Stock
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProductId(item._id);
                                                    }}
                                                    className="absolute top-2 left-2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaEye className="text-gray-700" />
                                                </button>
                                            </div>
                                            
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar 
                                                            key={i}
                                                            className={`text-sm ${i < Math.floor(item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-gray-500 ml-1">
                                                        ({item.totalReviews || 0})
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div>
                                                        <span className="text-lg font-bold text-gray-800">
                                                            ${item.price}
                                                        </span>
                                                        {item.stock !== 0 && loggedInUser?.role !== 'admin' && loggedInUser?.role !== 'seller' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addToCartClick(item._id);
                                                                }}
                                                                disabled={isCartLoading || item.stock === 0}
                                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <FaShoppingCart className={isCartLoading ? 'animate-spin' : ''} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <FaHeart />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-16">
                                    <Empty description="No products found" />
                                </div>
                            )}

                            <div className="flex justify-center mt-12">
                                <button 
                                    onClick={() => navigate('/product/more')}
                                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    Load More Products
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Newsletter Section */}
                    <section className="bg-blue-600 text-white py-16">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                                Get the latest updates on new products and upcoming sales
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
                                />
                                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="bg-gray-900 text-gray-300 py-12">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li><a href="#" className="hover:text-white transition-colors">Men's Fashion</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Women's Fashion</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Electronics</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Home & Garden</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Sports & Outdoors</a></li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">About Us</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm">
                                <p>&copy; {new Date().getFullYear()} Your E-commerce Store. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </>
            )}

            {/* Search Modal */}
            {searchClick && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center pt-20">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setAntdSearchClick(true)}
                            placeholder="Search products..."
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default HomePage