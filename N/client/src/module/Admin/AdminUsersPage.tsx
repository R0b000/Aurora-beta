import { AiOutlineDelete, AiOutlineSmile } from "react-icons/ai"
import { FaUserCircle } from "react-icons/fa";
import { FaUserLarge, FaUserLargeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import AdminUserViewPage from "./AdminUserViewPage";
import { useCallback, useEffect, useState } from "react";
import adminSvc from "../../service/admin.service";
import { type UserResponse } from "./admin.validator";

const AdminUserPage = () => {
    const navigate = useNavigate();
    const isView = location.pathname.includes('view')
    const [isloading, setIsLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<UserResponse | null>(null);

    const fetchUserList = useCallback(async () => {
        try {
            const response = await adminSvc.listUsers();
            setUserList(response)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const banUser = useCallback(async (id: string) => {
        await adminSvc.updateUserBan(id, true)
        fetchUserList();
    }, [])

    const unBanUser = useCallback(async (id: string) => {
        await adminSvc.updateUserBan(id, false)
        fetchUserList();
    }, [])

    const deleteUserById = useCallback(async (id: string) => {
        await adminSvc.deleteUser(id);
        fetchUserList()
    }, [])

    useEffect(() => {
        fetchUserList();
    }, [])

    return (
        <>
            {
                !isloading &&
                <>
                    {
                        isView ?
                            <>
                                <div className="flex w-full h-full items-center justify-center p-2">
                                    <AdminUserViewPage />
                                </div>
                            </>
                            :
                            <>
                                <div className="flex flex-col w-full h-full">
                                    <div className="flex flex-col w-full h-auto shrink-0 p-4 gap-2 text-base bg-gray-100 rounded-md">
                                        <h2 className="flex header-title text-base">
                                            Users
                                        </h2 >
                                    </div >
                                    <div className="flex flex-col px-4 gap-4">
                                        <div className="flex items-center w-full justify-between">
                                            <p className="header-title text-sm md:text-base">
                                                Existing Users
                                            </p>
                                        </div>
                                        <div className="flex flex-col w-full h-auto rounded-md gap-2 bg-gray-50 py-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                                            {
                                                userList?.data.map((items, index) => (
                                                    <div key={index}>
                                                        <div
                                                            onClick={() => navigate(`view/${items._id}`)}
                                                            className="flex gap-2 h-auto w-full shrink-0 items-center justify-between cursor-pointer p-2 rounded-md border border-violet-300 ">
                                                            <div className="flex flex-col gap-2 w-[87%]">
                                                                <div className="flex text-sm gap-3 md:gap-10">
                                                                    {!items.avatar &&
                                                                        <div className="flex w-[28%] h-auto shrink-0 text-blue-400">
                                                                            <FaUserCircle size={80} />
                                                                        </div>
                                                                    }
                                                                    {items.avatar &&
                                                                        <div className="flex w-[28%] h-auto shrink-0 text-blue-400">
                                                                            <img className={items.avatar.optimizedUrl} alt="" />
                                                                        </div>
                                                                    }
                                                                    <div className="p-2">
                                                                        <p className="flex text-sm md:text-base">
                                                                            {items.name}
                                                                        </p>
                                                                        <p className="flex text-sm md:text-base">
                                                                            {items.role}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="flex text-sm md:text-base">
                                                                    {items.email}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col gap-4 text-white w-[13%] h-full shrink-0 items-center justify-center">
                                                                {!items.isBan &&
                                                                    <FaUserLarge onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        banUser(items._id)
                                                                    }} size={30} className="bg-blue-800 rounded-md cursor-pointer w-[10vw] h-[10vw] md:w-[5vw] lg:w-[2vw] md:h-[5vw] lg:h-[2vw] p-2" />
                                                                }
                                                                {items.isBan &&
                                                                    <FaUserLargeSlash onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        unBanUser(items._id)
                                                                    }} size={30} className="bg-blue-800 rounded-md cursor-pointer w-[10vw] h-[10vw] md:w-[5vw] lg:w-[2vw] md:h-[5vw] lg:h-[2vw] p-2" />
                                                                }
                                                                <AiOutlineDelete onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    deleteUserById(items._id)
                                                                }} size={30} className="bg-red-700 rounded-md cursor-pointer p-2 w-[10vw] h-[10vw] md:w-[5vw] lg:w-[2vw] md:h-[5vw] lg:h-[2vw]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }

                                            {userList?.data.length === 0 &&
                                                <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-center">
                                                    <p className="flex text-sm">
                                                        No User Found
                                                    </p>
                                                    <AiOutlineSmile size={25} />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div >
                            </>
                    }
                </>
            }
        </>
    )
}

export default AdminUserPage 