import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import MobileLogo from '../../assets/mobile_logo.png'

export interface HeaderProps {
  className?: string
}

type NavItem = { label: string; path: string; icon?: React.ReactNode }

const navItems: NavItem[] = [
  { label: 'Products', path: '/product/more' },
  { label: 'Categories', path: '/product/more' },
  { label: 'Deals', path: '/product/more' },
  { label: 'Contact', path: '/product/more' },
]

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const {
    searchClick, setSearchClick,
    menuClick, setMenuClick,
    loggedInUser, setLoggedInUser,
    authModal, setAuthModal
  } = useAppContext()
  const [hidden, setHidden] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isShop = location.pathname.includes('orders')

  useEffect(() => {
    let lastY = 0
    const handleScroll = () => {
      setHidden(window.scrollY > lastY && window.scrollY > 80)
      lastY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setLoggedInUser(null)
    navigate('/')
  }

  const handleDashboard = () => {
    if (loggedInUser?.role === 'admin') navigate('/admin')
    if (loggedInUser?.role === 'seller') navigate('/seller')
  }

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
      <header className={`
        flex fixed top-0 left-0 w-full h-[8vh] z-50 items-center justify-between gap-4 px-4
        bg-white shadow-sm border-b border-gray-200
        transition-transform duration-300 md:h-[10vh] md:shrink-0
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
        ${className}
      `}>
        <div className="flex items-center gap-4">
          {!menuClick ? (
            <button onClick={() => setMenuClick(true)} className="text-2xl text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          ) : (
            <button onClick={() => setMenuClick(false)} className="text-2xl text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          <img src={MobileLogo} onClick={() => navigate('/')} alt="Aurora Logo" className='h-[3vh] w-[27vw] md:w-auto md:h-[2vh] cursor-pointer' />
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.path} href={item.path} className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isShop && (
            <>
              <button onClick={() => setSearchClick(true)} className="text-2xl text-gray-700 hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              {loggedInUser && (
                <button className="text-2xl text-gray-700 hover:text-blue-600 hidden md:block">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
              )}
            </>
          )}

          {loggedInUser?.role === 'customer' ? (
            <button onClick={() => navigate('/customer/cart')} className="text-2xl text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            </button>
          ) : loggedInUser ? (
            <button onClick={() => navigate('/customer/orders')} className="text-2xl text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </button>
          ) : (
            <button onClick={() => { setAuthModal('login'); setSearchClick(false); }} className="text-2xl text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            </button>
          )}

          {loggedInUser ? (
            <div className="relative">
              <button
                onClick={handleDashboard}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="hidden md:inline">{loggedInUser.name.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setAuthModal('login')} className="text-sm font-medium text-gray-700 hover:text-blue-600">Login</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setAuthModal('register')} className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700">Register</button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default Header
