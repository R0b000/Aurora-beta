const { khaltiConfig } = require("../../config/const.config");
const cartSvc = require("../cart/cart.service");
const productSvc = require("../product/product.service");
const orderItemsSvc = require("./orderItems.service");

class OrderItemsController {
    checkout = async (req, res, next) => {
        try {
            const { id } = req.params

            const cartDetails = await cartSvc.getCartById({
                _id: id
            })

            if (!cartDetails) {
                throw {
                    code: 422,
                    status: "Invalid Id",
                    message: "Invalid Id"
                }
            }

            const productDetails = await productSvc.getSingleProductById({
                _id: cartDetails.items.product._id
            })

            const transformCartDetails = orderItemsSvc.transformOrderItems(req, cartDetails, productDetails);
            const orderDetails = await orderItemsSvc.saveOrderItems(transformCartDetails);

            res.json({
                data: orderDetails,
                code: 200,
                status: "Order placed",
                message: "Order placed"
            })

        } catch (error) {
            throw error
        }
    }

    checkoutList = async (req, res, next) => {
        try {
            let id = req.loggedInUser._id;

            const orderItemsDetails = await orderItemsSvc.orderList({
                user: id
            });

            res.json({
                data: orderItemsDetails,
                code: 200,
                status: "Order list",
                message: "Order listed"
            })
        } catch (error) {
            throw error
        }
    }

    khaltPaymentCheckout = async (req, res, next) => {
        try {
            const { id } = req.params

            const data = await orderItemsSvc.getItemOrderById({
                _id: id
            });

            if (!data) {
                throw {
                    code: 200,
                    status: "No cart found",
                    message: "No cart found"
                }
            }

            const khaltiInitialization = await fetch(
                khaltiConfig.url,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `KEY ${khaltiConfig.key}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        return_url: `https://aurorashop.free.nf/customer/cart/khalti-success`,
                        website_url: `https://aurorashop.free.nf`,
                        amount: 1000,
                        purchase_order_id: data._id,
                        purchase_order_name: data.user.name,
                        customer_info: {
                            name: data.user.name,
                            email: data.user.email,
                            phone: data.user.phone,
                        },
                    }),
                }
            )

            const khaltiPaymentDetails = await khaltiInitialization.json();

            res.json({
                data: khaltiPaymentDetails,
                code: 200,
                stauts: "Payment Successful",
                message: "Payement Success"
            })
        } catch (error) {
            throw error
        }
    }

    cancelCheckout = async (req, res, next) => {
        try {
            const { id } = req.params;

            const orderItemsDetails = await orderItemsSvc.getItemOrderById({
                _id: id
            })

            if (!orderItemsDetails) {
                throw {
                    code: 422,
                    status: "No order details found",
                    message: "No order details found"
                }
            }

            if (orderItemsDetails.paymentStatus !== "paid" && orderItemsDetails.orderStatus !== 'shipped') {
                const deleteOrderItems = await orderItemsSvc.deleteOrderItemsById(
                    { _id: id }
                )

                res.json({
                    data: deleteOrderItems,
                    status: "Order deleted and cancelled",
                    message: "Order deleted and cancelled",
                })
            } else {
                throw {
                    code: 422,
                    status: "Payment already paid or the order is already shipped",
                    message: "Contact our customer supporter for refund and cancel the order"
                }
            }
        } catch (error) {
            throw error
        }
    }
}

const orderItemsCtrl = new OrderItemsController();

module.exports = orderItemsCtrl