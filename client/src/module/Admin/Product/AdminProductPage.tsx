import { AiOutlineEye, AiOutlineSmile } from "react-icons/ai"

const AdminProductPage = () => {
    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex flex-col w-full h-auto shrink-0 p-4 gap-2 text-xl bg-gray-100 rounded-md">
                    <h2 className="flex header-title text-2xl">
                        Products
                    </h2>
                </div>
                <div className="flex flex-col px-4 pt-2 gap-4">
                    <div className="flex items-center w-full justify-between">
                        <p className="header-title">
                            Existing Products
                        </p>
                    </div>
                    <div className="flex flex-col w-full h-auto rounded-md gap-2 bg-gray-50 py-2">
                        <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-between bg-gray-100 p-2 rounded-md">
                            <p className="flex text-lg">
                                Electronics 
                            </p>
                            <AiOutlineEye size={30}/>
                        </div>
                        <div className="flex gap-2 h-[7vh] w-full shrink-0 items-center justify-center">
                            <p className="flex text-lg">
                                No Product Found
                            </p>
                            <AiOutlineSmile size={25} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminProductPage