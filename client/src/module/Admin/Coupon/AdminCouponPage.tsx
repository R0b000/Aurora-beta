import { useCallback, useEffect, useState } from "react"
import { AiOutlineDelete, AiOutlineEdit, AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineSmile } from "react-icons/ai"
import { useNavigate, Outlet } from "react-router-dom"
import AdminCouponCreatePage from "./AdminCouponCreatePage"
import { type CategoryResponse, type CouponResponse } from "../admin.validator"
import adminSvc from "../../../service/admin.service"

export interface AdminCouponPageProps { 
    setAddClick: React.Dispatch<React.SetStateAction<boolean>> 
    categoryList: CategoryResponse | null 
}

const AdminCouponPage = () => {
    const isCoupon = location.pathname.includes("update");
    const [addClick, setAddClick] = useState<boolean>(false);
    const [couponList, setCouponList] = useState<CouponResponse | null>(null);
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const fetchCouponList = useCallback(async () => {
        try {
            const response = await adminSvc.listActiveCoupons(true);
            setCouponList(response);

            const categories = await adminSvc.listCategory();
            setCategoryList(categories);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteCouponById = useCallback(async (id: string) => {
        await adminSvc.deleteCouponById(id);
        fetchCouponList();
    }, [fetchCouponList]);

    useEffect(() => {
        fetchCouponList();
    }, [addClick, location.pathname]);

    return (
        <>
            {!isLoading &&
                <>
                    {isCoupon ?
                        (
                            <div className="flex flex-col p-4 gap-4 bg-gray-100 rounded-md">
                                <h2 className="text-base header-title md:text-base">
                                    Update Coupon
                                </h2>
                                <div className="flex flex-col bg-gray-200 rounded-md p-4 border border-violet-300">
                                    <Outlet context={{ setAddClick, categoryList }} />
                                </div>
                            </div>
                        ) :
                        (
                            <>
                                <div className="flex flex-col lg:grid lg:grid-cols-2 w-full lg:gap-10 relative">

                                    {/* MOBILE Create Section */}
                                    <div className="lg:hidden flex flex-col w-full h-auto shrink-0 p-4 gap-2 text-sm bg-gray-100 rounded-md items-center justify-center">
                                        <h2 className="flex header-title text-base md:text-base">
                                            Coupons
                                        </h2>
                                        <div
                                            className={`
                                                flex flex-col text-gray-700 gap-5 border border-violet-200 p-4 rounded-xl 
                                                w-full h-[55vh] lg:w-[30vw] lg:h-[78vh] shrink-0 items-center justify-center
                                                ${addClick ? "visible" : "hidden"}
                                            `}
                                        >
                                            <AdminCouponCreatePage
                                                setAddClick={setAddClick}
                                                categoryList={categoryList}
                                            />
                                        </div>
                                    </div>

                                    {/* Right: List Section */}
                                    <div className="flex flex-col px-4 w-full h-full pt-2 gap-4">
                                        <div className="flex items-center w-full justify-between">
                                            <p className="header-title md:text-base">
                                                Existing Coupons
                                            </p>

                                            {/* Toggle Button Mobile Only */}
                                            <div className="text-green-800 font-semibold lg:hidden">
                                                <AiOutlinePlusCircle
                                                    onClick={() => setAddClick(prev => !prev)}
                                                    className={`text-base md:text-2xl ${addClick && "hidden"}`}
                                                />
                                                <AiOutlineMinusCircle
                                                    onClick={() => setAddClick(prev => !prev)}
                                                    className={`text-base md:text-2xl ${!addClick && "hidden"}`}
                                                />
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="flex flex-col w-full h-full rounded-md gap-2 md:gap-4 bg-gray-50 py-2">
                                            {couponList?.data.map((items, index) => (
                                                <div key={index}>
                                                    <div className="flex gap-2 h-[7vh] md:h-[10vh] w-full shrink-0 items-center justify-between bg-gray-100 p-2 rounded-md">
                                                        <p className="flex text-sm md:text-base">
                                                            {items.code}
                                                        </p>
                                                        <div className="flex gap-4 text-white">
                                                            <AiOutlineEdit
                                                                size={30}
                                                                onClick={() => navigate(`update/${items._id}`)}
                                                                className="bg-blue-800 rounded-md cursor-pointer w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw] p-2"
                                                            />
                                                            <AiOutlineDelete
                                                                size={30}
                                                                onClick={() => deleteCouponById(items._id)}
                                                                className="bg-red-700 rounded-md cursor-pointer p-2 w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {couponList?.data.length === 0 &&
                                                <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-center">
                                                    <p className="flex text-sm">
                                                        No Coupon Found
                                                    </p>
                                                    <AiOutlineSmile size={25} />
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    {/* DESKTOP Create Section */}
                                    <div className="gap-7 flex-col lg:block hidden fixed right-30 text-black">
                                        <div
                                            className={`
                                                flex-col text-gray-700 gap-5 border border-violet-200 p-4 rounded-xl 
                                                w-full lg:h-[59vh] shrink-0 items-center justify-center
                                            `}
                                        >
                                            <AdminCouponCreatePage
                                                setAddClick={setAddClick}
                                                categoryList={categoryList}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </>
            }
        </>
    );
};

export default AdminCouponPage;
