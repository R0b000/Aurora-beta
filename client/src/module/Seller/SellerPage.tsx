import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineMinusCircle, AiOutlinePlusCircle, AiOutlineSmile } from "react-icons/ai";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import sellerSvc from "../../service/seller.service";
import { type CategoryResponse, type ProductResponse } from "../Admin/admin.validator";
import SellerProductCreatePage from "./SellerCreatePage";
import publicSvc from "../../service/public.service";
import { Pagination } from "antd";

export interface sellerPageProps {
    setAddClick: React.Dispatch<React.SetStateAction<boolean>>
    categoryList: CategoryResponse | null
}

export interface sellerUpdatePageProps {
    categoryList: CategoryResponse | null
    productList: ProductResponse | null
}

const SellerPage = () => {
    const { loggedInUser } = useAppContext();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [addClick, setAddClick] = useState<boolean>(false)
    const [productList, setProductList] = useState<ProductResponse | null>(null)
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null)
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate()
    const isSellerUpdate = location.pathname.includes('update')
    const isProductView = location.pathname.includes('view')

    const productListFetch = useCallback(async () => {
        try {
            if (loggedInUser) {
                const listProduct = await sellerSvc.listProducts(loggedInUser._id, limit, page)
                setProductList(listProduct)
            }

            const listCategory = await publicSvc.listCategories()
            setCategoryList(listCategory.data)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [page, limit])

    const handleChange = (pageNumber: number, pageSize: number) => {
        setPage(pageNumber)
        setLimit(pageSize)
    }

    const DeleteById = useCallback(async (id: string) => {
        await sellerSvc.deleteCategory(id)
        productListFetch();
    }, [productListFetch, page, limit])


    useEffect(() => {
        productListFetch();
    }, [addClick, page, limit, location.pathname])

    return (
        <>
            {!isLoading &&

                <div className="flex w-full h-full shrink-0">
                    {isProductView ? <Outlet /> :
                        <div className="flex w-full h-full">
                            {isSellerUpdate ?
                                <div className="flex flex-col w-full h-full p-4 gap-4 bg-gray-100 rounded-md ">
                                    <h2 className="text-base header-title md:text-base">
                                        Update Coupon
                                    </h2>
                                    <div className="flex flex-col bg-gray-200 rounded-md p-4 border border-violet-300">
                                        <Outlet context={{ categoryList, productList }} />
                                    </div>
                                </div> :
                                <div className="flex flex-col w-full h-full">
                                    <div className="flex flex-col relative">
                                        <div className="flex flex-col w-full h-auto shrink-0 p-4 gap-2 text-base bg-gray-100 rounded-md">
                                            <h2 className="flex header-title text-base md:text-base">
                                                Products
                                            </h2>
                                            <div
                                                className={`flex flex-col text-gray-700 gap-5 border border-violet-200 overflow-x-clip p-4 rounded-xl h-auto shrink-0 items-center justify-center
                                                            ${addClick ? 'visible' : 'hidden'}`}>
                                                <SellerProductCreatePage setAddClick={setAddClick} categoryList={categoryList} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col px-4 pt-2 gap-4">
                                            <div className="flex items-center w-full justify-between">
                                                <p className="header-title md:text-base">
                                                    Existing Products
                                                </p>
                                                <div className="text-green-800 font-semibold">
                                                    <AiOutlinePlusCircle onClick={() => setAddClick((prev) => !prev)} className={`text-base cursor-pointer md:text-2xl ${addClick && 'hidden'}`} />
                                                    <AiOutlineMinusCircle onClick={() => setAddClick((prev) => !prev)} className={`text-base cursor-pointer md:text-2xl ${!addClick && 'hidden'}`} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col w-full h-auto rounded-md gap-4 bg-gray-50 py-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                                                {productList?.data.map((items, index) => (
                                                    <div key={index} onClick={() => navigate(`view/${items._id}`)} className="flex border-violet-400 cursor-pointer border rounded-md">
                                                        <div className="flex gap-2 h-[10vh] w-full shrink-0 items-center justify-between bg-gray-100 p-2 rounded-md">
                                                            <p className="flex text-sm md:text-base">
                                                                {items.title}
                                                            </p>
                                                            <div className="flex gap-4 text-white">
                                                                <AiOutlineEdit size={30} onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    navigate(`update/${items._id}`)
                                                                }} className="bg-blue-800 rounded-md w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw] p-2" />
                                                                <AiOutlineDelete size={30} onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    DeleteById(items._id)
                                                                }} className="bg-red-700 rounded-md p-2 w-[10vw] h-[10vw] md:w-[5vw] md:h-[5vw] lg:w-[2vw] lg:h-[2vw]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {productList?.data.length === 0 &&
                                                    <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-center">
                                                        <p className="flex text-sm">
                                                            No  Found
                                                        </p>
                                                        <AiOutlineSmile size={25} />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full flex items-center justify-center h-[7vh] shrink-0">
                                        <Pagination current={page} pageSize={limit} total={productList?.options.total} onChange={handleChange} />
                                    </div>
                                </div>
                            }
                        </div>
                    }
                </div>
            }
        </>
    )
}

export default SellerPage