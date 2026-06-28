import { IoMdSearch, IoMdPerson } from "react-icons/io"
import { LuShoppingCart } from "react-icons/lu"
import MobileLogo from '../assets/mobile_logo.png'
import { useEffect, useState } from "react"
import { Input } from "antd"
import { useAppContext } from "../context/AppContext"
import { AiOutlineMenuFold, AiOutlineMenuUnfold, AiOutlineMessage, AiOutlineShopping, AiOutlineUser } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import { FaBox, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { LoginModal, RegisterModal } from './AuthModals';
import SearchModal from './SearchModal';

const { Search } = Input;

interface HeaderProps {
    className?: string;
}

const HeaderComponent: React.FC<HeaderProps> = ({ className = '' }) => {
    const { 
        searchClick, 
        setSearchClick, 
        searchValue, 
        setSearchValue, 
        setAntdSearchClick, 
        menuClick, 
        setMenuClick, 
        loggedInUser,
        setLoggedInUser,
        authModal,
        setAuthModal
    } = useAppContext();
    const [hidden, setHidden] = useState<boolean>(false);
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const navigate = useNavigate();
    const isShop = location.pathname.includes('orders');

    const handleSearchClick = () => {
        setSearchClick(true)
    }

    const handleCartClick = () => {
        if (loggedInUser) {
            navigate('/customer/cart')
        } else {
            setAuthModal('login');
        }
    }

    const handleLogout = () => {
        localStorage.clear();
        setLoggedInUser(null);
        navigate('/');
        setShowUserMenu(false);
    }

    const handleDashboard = () => {
        if (loggedInUser?.role === 'admin') {
            navigate('/admin')
        } else if (loggedInUser?.role === 'seller') {
            navigate('/seller')
        }
        setShowUserMenu(false);
    }

    useEffect(() => {
        let lastY = 0;
        const handleScroll = () => {
            const currentY = window.scrollY;
            setHidden(currentY > lastY);
            lastY = currentY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const UserMenu = () => (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <p className="font-semibold">{loggedInUser?.name}</p>
                <p className="text-xs text-gray-500">{loggedInUser?.email}</p>
            </div>
            <button
                onClick={handleDashboard}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                <FaChartLine className="text-blue-600" />
                Dashboard
            </button>
            {loggedInUser?.role === 'customer' && (
                <button
                    onClick={() => {
                        navigate('/customer/orders');
                        setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <FaBox className="text-blue-600" />
                    My Orders
                </button>
            )}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
                <FaSignOutAlt />
                Logout
            </button>
        </div>
    );

    const AuthButtons = () => (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setAuthModal('login')}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
                <AiOutlineUser className="text-xl" />
                Login
            </button>
            <span className="text-gray-400">|</span>
            <button
                onClick={() => setAuthModal('register')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
                Register
            </button>
        </div>
    );

    const UserSection = () => (
        <div className="relative">
            <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
                <IoMdPerson className="text-xl" />
                <span className="hidden md:inline">{loggedInUser?.name}</span>
            </button>
            {showUserMenu && <UserMenu />}
        </div>
    );

    return (
        <>
            {/* Top Bar */}
            <div className={`bg-gray-900 text-white text-xs py-2 hidden lg:block ${hidden ? 'hidden' : ''}`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <span>Free Shipping on orders over $99</span>
                        <span>30-day return policy</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-blue-300">Support</a>
                        <a href="#" className="hover:text-blue-300">Track Order</a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className={`
                flex fixed top-0 left-0 w-full h-[8vh] z-50 items-center justify-between gap-4 px-4
                bg-white shadow-sm border-b border-gray-200
                transition-transform duration-300 md:h-[10vh] md:shrink-0
                ${hidden ? "-translate-y-full" : "translate-y-0"}
                ${className}
            `}>
                <div className="flex items-center gap-4">
                    <AiOutlineMenuUnfold 
                        className={`text-2xl cursor-pointer ${menuClick ? "hidden" : 'visible'}`} 
                        onClick={() => setMenuClick(true)} 
                    />
                    <AiOutlineMenuFold 
                        className={`text-2xl cursor-pointer ${menuClick ? "visible" : 'hidden'}`} 
                        onClick={() => setMenuClick(false)} 
                    />
                    <img 
                        src={MobileLogo} 
                        onClick={() => navigate('/')}
                        alt="aurora-logo" 
                        className='h-[3vh] w-[27vw] md:w-auto md:h-[2vh] cursor-pointer' 
                    />
                </div>

                <nav className="hidden lg:flex items-center gap-8">
                    <a href="/" className="font-medium text-gray-700 hover:text-blue-600">Home</a>
                    <a href="/product/more" className="font-medium text-gray-700 hover:text-blue-600">Products</a>
                    <a href="#" className="font-medium text-gray-700 hover:text-blue-600">Categories</a>
                    <a href="#" className="font-medium text-gray-700 hover:text-blue-600">Deals</a>
                    <a href="#" className="font-medium text-gray-700 hover:text-blue-600">Contact</a>
                </nav>

                <div className="flex items-center gap-4">
                    {!isShop && (
                        <>
                            <IoMdSearch 
                                onClick={handleSearchClick}
                                className={`text-2xl cursor-pointer ${searchClick ? "hidden" : ""} text-gray-700 hover:text-blue-600`}
                            />
                            <AiOutlineMessage 
                                onClick={() => {
                                    if (!loggedInUser) setAuthModal('login')
                                }} 
                                className="text-2xl cursor-pointer text-gray-700 hover:text-blue-600 hidden md:block" 
                            />
                        </>
                    )}

                    {loggedInUser?.role === 'customer' ? (
                        <LuShoppingCart 
                            onClick={handleCartClick}
                            className='text-2xl cursor-pointer text-gray-700 hover:text-blue-600'
                        />
                    ) : loggedInUser ? (
                        <AiOutlineShopping 
                            className='text-2xl cursor-pointer text-gray-700 hover:text-blue-600'
                            onClick={() => navigate('/customer/orders')}
                        />
                    ) : (
                        <>
                            <LuShoppingCart 
                                onClick={() => setAuthModal('login')}
                                className='text-2xl cursor-pointer text-gray-700 hover:text-blue-600'
                            />
                            <AiOutlineShopping 
                                className='text-2xl cursor-pointer text-gray-700 hover:text-blue-600'
                                onClick={() => setAuthModal('login')}
                            />
                        </>
                    )}

                    {loggedInUser ? <UserSection /> : <AuthButtons />}
                </div>
            </div>

            {/* Auth Modals */}
            <LoginModal type={authModal} onClose={() => setAuthModal(null)} />
            <RegisterModal type={authModal} onClose={() => setAuthModal(null)} />

            {/* Search Modal */}
            {searchClick && <SearchModal />}
        </>
    )
}

export default HeaderComponent