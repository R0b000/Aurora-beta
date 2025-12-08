import { useCallback, useEffect, useState } from "react"
import customerSvc from "../../../service/customer.service"
import { useNavigate } from "react-router-dom"
import { AiOutlineCar } from "react-icons/ai"
import { Empty } from "antd"

const CustomerOrderItemsPage = () => {
    const [orderItemsDetails, setOrderItemsDetails] = useState<any>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const navigate = useNavigate();

    const fetchOrderList = useCallback(async () => {
        try {
            const response = await customerSvc.getOrderItems()
            setOrderItemsDetails(response)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, []);

    useEffect(() => {
        fetchOrderList();
    }, [fetchOrderList])

    return (
        <>
            {!isLoading &&
                <>
                    <div className={`flex flex-col w-full h-full gap-5`}>
                        <div className="flex w-full p-2 px-4 text-xl">
                            <h1>My Orders</h1>
                        </div>
                        <div className="flex flex-col p-3 gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
                            {orderItemsDetails.data.length === 0 ? <Empty/> :                            
                            orderItemsDetails?.data.map((items: any, index: number) => (
                                <div key={index} onClick={() => {
                                    navigate(`cartView/${items.items.product._id}`)
                                }} className="flex flex-col w-full h-[74vh] lg:h-[75vh] shrink-0 border border-violet-300 rounded-md gap-1 p-2">
                                    <div className="flex flex-col w-full h-[74vh] gap-2">
                                        <div className="flex flex-col w-full h-full shrink-0 gap-1">
                                            <div className="flex flex-col w-full h-auto shrink-0">
                                                <div className="flex w-auto h-[35vh] items-center justify-center p-2 truncate">
                                                    <img src={items.items.product.images[0].secure_url} alt="cart-image" className="flex w-full h-auto" />
                                                </div>
                                                <div className="flex flex-col items-start w-full h-[37vh] shrink-0 px-2 gap-1 bg-gray-100 rounded-md pb-2">
                                                    <h1 className="flex text-base h-[8vh] shrink-0 w-full items-center justify-center p-2 rounded-md ">
                                                        {items.items.product.title}
                                                    </h1>
                                                    <span className="flex w-full grow broder border-t border-gray-400"></span>
                                                    <div className="flex p-2 flex-col items-center w-full text-sm">
                                                        <div className="flex w-full">
                                                            <p className="flex w-full">
                                                                Qty: {items.items.quantity}
                                                            </p>
                                                            <p className="w-full flex justify-between">
                                                                <p>
                                                                    Price:
                                                                </p>
                                                                <p>
                                                                    {items.items.price / 100}
                                                                </p>
                                                            </p>
                                                        </div>
                                                        <p className="flex w-full h-[4vh] gap-2 items-center justify-between">
                                                            <p>
                                                                Shipping Cost:
                                                            </p>
                                                            <p>
                                                                {items.shippingCost / 100}
                                                            </p>
                                                        </p>
                                                        <p className="flex w-full h-[4vh] gap-2 items-center justify-between">
                                                            <p>
                                                                Grand Total:</p>
                                                            <p>
                                                                {items.items.price / 100 + items.shippingCost / 100}
                                                            </p>
                                                        </p>
                                                    </div>
                                                    <span className="flex w-full grow broder border-t border-gray-400"></span>
                                                    <div className="p-2 flex w-full flex-col text-sm">
                                                        <p className="flex w-full h-[4vh] gap-2 items-center justify-between">
                                                            <p>
                                                                Payment:
                                                            </p>
                                                            <div className="flex gap-5">
                                                                <p className="font-semibold bg-green-400/30 p-1 rounded-md px-4 text-green-800 text-sm">
                                                                    {items.paymentStatus === 'paid' ? 'Paid' : "Pending"}
                                                                </p>
                                                                <p className="bg-teal-800/80 p-1 rounded-md px-4 ">
                                                                    {items.orderStatus === 'placed' ? 'Placed' : 'On the way'}
                                                                </p>
                                                            </div>
                                                        </p>
                                                        <p className="flex h-[4vh] gap-2 items-center justify-between w-full">
                                                            <p>
                                                                Provider:
                                                            </p> <p className="flex gap-3">Pathao <AiOutlineCar color="" size={25} /> </p>
                                                        </p>
                                                        <p className="flex h-[4vh] gap-2 items-center justify-between w-full">
                                                            <p>
                                                                Tracking No.:
                                                            </p>
                                                            <p>
                                                                Xer23TT
                                                            </p>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default CustomerOrderItemsPage