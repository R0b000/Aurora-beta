import { useCallback, useEffect, useState } from "react";
import { AiOutlineSmile } from "react-icons/ai";
import type { CategoryResponse } from "../Admin/admin.validator";
import publicSvc from "../../service/public.service";

const SellerViewCategoryPage = () => {
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchCategoryList = useCallback(async () => {
        try {
            const response = await publicSvc.listCategories()
            setCategoryList(response.data)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategoryList()
    }, [location.pathname])

    return (
        <>
            {!isLoading &&
                <div className="flex flex-col w-full h-full">
                    <div className="flex flex-col w-full h-auto shrink-0 p-4 gap-2 text-xl bg-gray-100 rounded-md">
                        <h2 className="flex header-title text-2xl">
                            Categories
                        </h2>
                    </div>
                    <div className="flex flex-col px-4 pt-2 gap-4">
                        <div className="flex items-center w-full justify-between">
                            <p className="header-title">
                                Existing Category
                            </p>
                        </div>
                        <div className="flex flex-col w-full h-auto rounded-md gap-2 bg-gray-50 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                {categoryList?.data?.map((item) => (
                                    <div key={item._id} className="flex flex-col rounded-xl shrink-0 p-1 h-[25vh] w-[43vw] text-xl font-semibold border-2 border-gray-500 place-items-center items-center justify-center">
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
                            </div>
                            {categoryList?.data.length === 0 &&
                                <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-center">
                                    <p className="flex text-lg">
                                        No Category Found
                                    </p>
                                    <AiOutlineSmile size={25} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default SellerViewCategoryPage