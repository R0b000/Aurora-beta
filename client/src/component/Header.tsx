import { IoMdSearch } from "react-icons/io"
import { LuShoppingCart } from "react-icons/lu"
import MobileLogo from '../assets/mobile_logo.png'
import { useEffect, useState } from "react"
import { Input } from "antd"
import { useAppContext } from "../context/AppContext"
import { AiOutlineCloseCircle, AiOutlineMenuFold, AiOutlineMenuUnfold, AiOutlineMessage, AiOutlineShopping } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import ViewMessagePage from "../module/Message/ViewMessagePage"

const { Search } = Input;

const HeaderComponent = () => {
    const { searchClick, setSearchClick, searchValue, setSearchValue, setAntdSearchClick, menuClick, setMenuClick, loggedInUser } = useAppContext();
    const [hidden, setHidden] = useState<boolean>(false);
    const navigate = useNavigate();
    const isShop = location.pathname.includes('orders')
    const [messageClick, setMessageClick] = useState<boolean>()

    const handleSearchClick = () => {
        setSearchClick(true)
    }

    const handleCartClick = () => {
        if (loggedInUser) {
            navigate('/customer/cart')
        } else {
            navigate('/auth/login')
        }
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

    return (
        <>
            {/*Header*/}
            <div className={`
                flex fixed top-0 left-0 w-full h-[8vh] z-50 items-center justify-between gap-4 px-4
                transition-transform duration-300 md:h-[10vh] md:shrink-0
                ${hidden ? "-translate-y-full" : "translate-y-0"}
            `}>
                <AiOutlineMenuUnfold className={`text-2xl cursor-pointer  ${menuClick ? "hidden transition-all duration-300" : 'visible transition-all duration-300'}`} onClick={() => setMenuClick(true)} />
                <AiOutlineMenuFold className={`text-2xl cursor-pointer  ${menuClick ? "visible transition-all duration-300" : 'hidden transition-all duration-300'}`} onClick={() => setMenuClick(false)} />
                <img src={MobileLogo} onClick={() => {
                    navigate('/')
                }} alt="aurora-logo" className='h-[3vh] w-[27vw] md:w-auto md:h-[2vh] cursor-pointer' />
                <div className="flex gap-4">
                    {!isShop &&
                        <>
                            <IoMdSearch onClick={handleSearchClick}
                                className={` text-2xl cursor-pointer
                                ${searchClick ? "hidden" : ""}   
                            `}
                            />
                            <AiOutlineMessage onClick={() => {
                                if(!loggedInUser) {
                                    navigate('/auth/login')
                                } 
                                setMessageClick(prev => !prev) 
                                }} className="text-2xl cursor-pointer" />
                        </>
                    }

                    {loggedInUser === null &&
                        <>
                            <LuShoppingCart className='text-2xl cursor-pointer'
                                onClick={handleCartClick}
                            />
                            <AiOutlineShopping className='text-2xl cursor-pointer'
                                onClick={() => {
                                    if (!loggedInUser) {
                                        navigate('/auth/login')
                                    } else navigate('/customer/orders')
                                }}
                            />
                        </>
                    }

                    {loggedInUser?.role === 'customer' &&
                        <>
                            <LuShoppingCart className='text-2xl cursor-pointer'
                                onClick={handleCartClick}
                            />
                            <AiOutlineShopping className='text-2xl cursor-pointer'
                                onClick={() => {
                                    if (!loggedInUser) {
                                        navigate('/auth/login')
                                    } else navigate('/customer/orders')
                                }}
                            />
                        </>
                    }

                </div>
            </div>
            {!isShop &&
                <div className={`flex items-center justify-center mt-[6vh] lg:mt-[10vh] gap-2  ${searchClick ? "h-[9vh] shrink-0" : "hidden"} `}>
                    <div className="flex w-[70vw] z-30">
                        <Search
                            allowClear
                            size="large"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onSearch={() => setAntdSearchClick(true)}
                            placeholder="input search default"
                        />
                    </div>
                    <div className="flex lg:p-1 p-2 border rounded-md border-gray-300">
                        <AiOutlineCloseCircle onClick={() => {
                            setSearchClick(false)
                            setSearchValue('')
                        }} className="text-xl lg:text-3xl text-red-800 cursor-pointer" />
                    </div>
                </div>
            }

            {messageClick &&
                <ViewMessagePage />
            }
        </>
    )
}

export default HeaderComponent