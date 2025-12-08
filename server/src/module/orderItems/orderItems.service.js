const OrderModel = require("./orderItems.model");

class OrderItemsService {
    transformOrderItems = (req, cartData, productData) => {
        try {
            let orderDetails = {};

            orderDetails.user = cartData.user._id
            orderDetails.items = {
                cartId: cartData._id,
                product: cartData.items.product._id,
                title: cartData.items.product.title,
                price: cartData.items.product.price,
                quantity: cartData.items.quantity,
                seller: cartData.items.product.seller,
            }
            orderDetails.shippingAddress = {
                name: req.loggedInUser.name,
                phone: req.loggedInUser.phone || null,
                address: req.loggedInUser.addresses ||null
            }
            orderDetails.billingAddress = orderDetails.shippingAddress
            orderDetails.paymentMethod = 'not defined'
            orderDetails.orderStatus = 'placed'
            orderDetails.shippingProvider = 'Name of the shipper'
            orderDetails.shippingTrackingNumber = 'trackingNumber'
            orderDetails.subtotal = cartData.items.price
            orderDetails.shippingCost = 100 * 100
            orderDetails.tax = cartData.items.price * 0.13
            if (cartData.coupon) {
                if (cartData.coupon.discountType === 'percentage') {
                    orderDetails.discount = (orderDetails.subtotal + orderDetails.tax) * (cartData.coupon.discountValue / 100)
                    orderDetails.total = (orderDetails.subtotal + orderDetails.tax) - orderDetails.discount
                } else {
                    orderDetails.discount = cartData.coupon.discountValue
                    orderDetails.total = (orderDetails.subtotal + orderDetails.tax) - orderDetails.discount
                }
                orderDetails.coupon = cartData.coupon._id
            }

            return orderDetails
        } catch (error) {
            throw error
        }
    }

    saveOrderItems = async(data) => {
        const orderItems = new OrderModel(data);
        return await orderItems.save();
    }

    orderList = async (data) => {
        const orderList = await OrderModel.find(data)
            .populate('items.product')
        
        return orderList
    }

    getItemOrderById = async (data) => {
        const itemOrder = await OrderModel.findById(data)
            .populate('user')
        return itemOrder
    }

    deleteOrderItemsById = async (data) => {
        const deleteOrderDetails = await OrderModel.findByIdAndDelete(data);
        return deleteOrderDetails
    }
}

const orderItemsSvc = new OrderItemsService();

module.exports = orderItemsSvc