import { AiOutlineHome, AiOutlineUser, AiOutlineLogout, AiOutlineShopping } from "react-icons/ai"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { MdCategory } from "react-icons/md";

const SellerLayoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedInUser, setLoggedInUser } = useAppContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const isActive = (path: string) => {
        if (path === '/seller') {
            return location.pathname === '/seller' || location.pathname === '/seller/';
        }
        return location.pathname.includes(path);
    };

    const navItems = [
        { path: '/seller', label: 'Dashboard', icon: AiOutlineHome },
        { path: '/seller/product', label: 'Products', icon: AiOutlineShopping },
        { path: '/seller/category/view', label: 'Categories', icon: MdCategory },
    ];

    useEffect(() => {
        const saved = localStorage.getItem('sb_collapsed');
        if (saved === '1') {
            setSidebarCollapsed(true);
        }
        if (loggedInUser?.role !== 'seller') {
            navigate('/');
        }
    }, [loggedInUser]);

    const handleToggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('sb_collapsed', newState ? '1' : '0');
    };

    const handleLogout = () => {
        localStorage.clear();
        setLoggedInUser(null);
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200
                    flex flex-col transition-all duration-200 ease-in-out
                    ${sidebarCollapsed ? 'w-14' : 'w-56'}
                `}
            >
                {/* Header */}
                <div className="h-12 flex items-center px-3 border-b border-slate-200 gap-2">
                    <div
                        className="flex items-center justify-center w-7 h-7 bg-emerald-500 rounded-md cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 4 5 4 9c0 3 1.5 5.5 4 7v2h8v-2c2.5-1.5 4-4 4-7 0-4-3.5-7-8-7z" />
                        </svg>
                    </div>
                    {!sidebarCollapsed && (
                        <span className="text-xs font-bold text-slate-800 truncate">
                            Seller Panel
                        </span>
                    )}
                    <button
                        onClick={handleToggleSidebar}
                        className="ml-auto w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    flex items-center gap-2.5 mx-1.5 px-2.5 py-1.5 rounded-md text-left transition-all
                                    text-[11px] font-semibold
                                    ${isActive(item.path)
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }
                                `}
                                style={{ opacity: sidebarCollapsed ? 0 : 1 }}
                            >
                                <Icon className={`text-[15px] flex-shrink-0 ${isActive(item.path) ? 'text-emerald-500' : 'text-slate-400'}`} />
                                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer - Logout */}
                <div className="p-2 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors text-[11px] font-semibold"
                    >
                        <AiOutlineLogout className="text-[15px]" />
                        {!sidebarCollapsed && <span className="truncate">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`
                    flex-1 transition-all duration-200
                    ${sidebarCollapsed ? 'ml-14' : 'ml-56'}
                `}
            >
                {/* Top Bar */}
                <header className="h-12 flex items-center justify-between px-4 lg:px-6 border-b border-slate-200 bg-white sticky top-0 z-30">
                    <h1 className="text-xs font-bold text-slate-800">
                        Seller Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:block text-[11px] font-semibold text-slate-700 truncate max-w-32">
                            {loggedInUser?.name}
                        </span>
                        <AiOutlineUser
                            className="text-lg text-slate-500 cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SellerLayoutPage