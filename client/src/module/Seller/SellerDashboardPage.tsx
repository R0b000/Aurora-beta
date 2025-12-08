import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import type { CategoryResponse } from "../Admin/admin.validator";
import publicSvc from "../../service/public.service";
import { FaAngleRight } from "react-icons/fa";

const SellerDashboardPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null)

    const dashboardDetails = useCallback(async () => {
        try {
            const listCategory = await publicSvc.listCategories();
            setCategoryList(listCategory.data)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        dashboardDetails();
    }, [])

    return (
        <>
            {!isLoading &&
                <>
                    <div className="flex w-full flex-col gap-4 items-center">
                        <h1 className="flex header-title text-base bg-gray-100 rounded-md p-2 w-full h-[5vh] shrink-0 md:text-base md:h-[7vh] items-center">
                            Dashboard
                        </h1>
                        <div className="flex w-full flex-col gap-4 lg:w-[67%]">
                            <div className="flex flex-col w-full h-[32vh] gap-2 items-center justify-center mt-3">
                                <div className="flex h-[5vh] shirnk-0 header-title text-base md:text-base">
                                    Categories List
                                </div>
                                <div className='flex overflow-x-auto no-scrollbar px-3 mr-2 w-full'>
                                    <div className='flex gap-4 w-full place-items-center'>
                                        {categoryList?.data.map((item) => (
                                            <div key={item._id} className="flex flex-col rounded-xl shrink-0 cursor-pointer p-1 h-[25vh] w-[42vw] md:w-[28vw] lg:w-[10vw] lg:h-full no-scrollbar text-base font-semibold border-2 border-gray-500 place-items-center items-center justify-center">
                                                <div className='flex flex-col items-center justify-center'>
                                                    <img
                                                        src={item.image?.secure_url}
                                                        alt={item.name}
                                                        className="h-[19vh] w-auto rounded-xl object-cover"
                                                    />
                                                </div>
                                                <div className='flex w-full items-center justify-center h-[12v]'>{item.name}</div>
                                            </div>
                                        ))
                                        }
                                        {categoryList?.data.length === 0 &&
                                            <div className="header-title md:text-base">
                                                No Category Created
                                            </div>
                                        }
                                        <div>
                                            <FaAngleRight size={35} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full bg-gray-50 items-center justify-center">
                            <div className="flex gap-2 w-full p-2 mt-2 bg-gray-200 h-[7vh] md:w-1/2 items-center justify-center">
                                <button onClick={() => navigate('/seller/product')} className="flex p-2 bg-green-950/80 rounded-md text-white text-base header-title items-center cursor-pointer justify-center w-full md:text-base md:h-[7vh]">Manage Product</button>
                            </div>
                        </div>
                    </div>
                </>}
        </>
    )
}

export default SellerDashboardPage