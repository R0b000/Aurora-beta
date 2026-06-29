import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

export interface SidebarItem {
  label: string
  path: string
  icon: React.ReactNode
}

const SidebarSeller: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { loggedInUser, setLoggedInUser } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: SidebarItem[] = [
    { label: 'Dashboard', path: '/seller', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: 'My Products', path: '/seller/product', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label: 'Categories', path: '/seller/category/view', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 21V5c0-1.104.896-2 2-2z" /></svg> },
    { label: 'Orders', path: '/customer/orders', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  ]

  const handleLogout = () => {
    localStorage.clear()
    setLoggedInUser(null)
    navigate('/')
    onClose()
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:z-auto
      `.trim()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Seller Panel</h2>
              <p className="text-xs text-gray-500">{loggedInUser?.sellerProfile?.companyName || loggedInUser?.email}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-140px)]">
          {menuItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <span className={active ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default SidebarSeller
