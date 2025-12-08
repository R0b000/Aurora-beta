import { AiOutlineCloseCircle, AiOutlineRight, AiOutlineUser } from "react-icons/ai"
import { FaUserCircle } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { MdDashboard } from "react-icons/md"
import { useState } from "react"
import { ImSpinner9 } from "react-icons/im"

const Sidebar = () => {
    const { setMenuClick, loggedInUser, setLoggedInUser } = useAppContext()
    const [viewUser, setViewUser] = useState<boolean>(false)
    const [yesLoading, setYesLoading] = useState(false);
    const [noLoading, setNoLoading] = useState(false);

    const navigate = useNavigate()

    const handleRouting = () => {
        if (loggedInUser?.role === 'admin') {
            navigate('/admin')
        } else {
            navigate('/seller')
        }
    }

    return (
        <>
            <div className="flex flex-col w-full gap-3 justify-center">
                <div className="flex justify-between h-[6vh] items-center text-base md:text-base p-2 font-semibold header-title">
                    <div className={`${loggedInUser && 'hidden'}`}>
                        <div className="flex gap-4 items-center justify-center cursor-pointer" onClick={() => {
                            navigate('/auth/login')
                        }}>
                            <FaUserCircle size={33} />Login / Register
                        </div>
                    </div>
                    {(loggedInUser?.role !== 'customer' && loggedInUser !== null) &&
                        <div onClick={handleRouting} className={`${loggedInUser?.role === 'admin' && 'cursor-pointer visible flex gap-2 items-center'}`}>
                            <MdDashboard size={45} /> DASHBOARD
                        </div>
                    }
                    {(loggedInUser?.role === 'customer') &&
                        <h1 className="flex w-full h-[7vh] items-center p-2 cursor-pointer" onClick={() => {
                            setViewUser(true)
                        }}>Profile</h1>
                    }
                    <div><AiOutlineCloseCircle className="cursor-pointer" size={45} onClick={() => setMenuClick(false)} /></div>
                </div>
                <span className="flex grow border border-t border-rose-50"></span>
                <ul className="flex w-full flex-col p-2 gap-6 px-4 text-sm md:text-base">
                    <li className="flex justify-between items-center cursor-pointer">
                        Trending
                        <AiOutlineRight />
                    </li>
                    <li className="flex justify-between items-center cursor-pointer">New Arrival</li>
                    <li className="flex justify-between items-center cursor-pointer">
                        Women
                        <AiOutlineRight />
                    </li>
                    <li className="flex justify-between items-center cursor-pointer">
                        Men
                        <AiOutlineRight />
                    </li>
                    <li className="flex justify-between items-center cursor-pointer">
                        Accessories
                        <AiOutlineRight />
                    </li>
                    <li className="flex justify-between items-center cursor-pointer">
                        Sale
                        <AiOutlineRight />
                    </li>
                </ul>
                <ul className="flex flex-col gap-2 p-2 px-6 md:text-sm text-sm">
                    <li className="flex items-center cursor-pointer">
                        Customer Service
                    </li>
                    <li className="flex items-center cursor-pointer">
                        FAQ
                    </li>
                    <li className="flex items-center cursor-pointer">
                        Contact Us
                    </li>
                    <li className="flex items-center cursor-pointer">
                        Sizing Guide
                    </li>
                </ul>
            </div>

            {viewUser && (
                <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-md p-2"
                    onClick={() => setViewUser(false)}
                >
                    {/* Stop click from closing when clicking inside the box */}
                    <div
                        className="bg-white text-black p-4 rounded-xl shadow-xl w-[400px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <AiOutlineUser size={45} />
                            <h2 className="text-sm font-semibold mb-2 header-title">{loggedInUser?.name}</h2>
                            <h3 className="text-sm font-semibold mb-2 header-title">{loggedInUser?.email}</h3>
                        </div>
                        <div className="flex flex-col w-full gap-1 p-2">
                            <h3 className="flex w-full header-title text-sm">Logout</h3>
                            <div className="flex gap-5">
                                {/* YES button */}
                                <button
                                    onClick={() => {
                                        setYesLoading(true);
                                        setViewUser(false);
                                        localStorage.clear();
                                        setLoggedInUser(null);

                                        setTimeout(() => {
                                            navigate('/');
                                            setYesLoading(false);
                                        }, 1000);
                                    }}
                                    className="mt-[3vh] relative bg-green-700 text-white px-3 py-1 rounded-lg w-[50%] h-[5vh] cursor-pointer flex items-center justify-center"
                                >
                                    {yesLoading ? (
                                        <ImSpinner9 className="animate-spin text-white text-sm" />
                                    ) : (
                                        "YES"
                                    )}
                                </button>

                                {/* NO button */}
                                <button
                                    onClick={() => {
                                        setNoLoading(true);
                                        setViewUser(false);
                                        setTimeout(() => setNoLoading(false), 600);
                                    }}
                                    className="mt-[3vh] relative bg-green-700 text-white px-3 py-1 rounded-lg w-[50%] h-[5vh] cursor-pointer flex items-center justify-center"
                                >
                                    {noLoading ? (
                                        <ImSpinner9 className="animate-spin text-white text-sm" />
                                    ) : (
                                        "NO"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Sidebar