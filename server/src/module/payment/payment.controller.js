const cartSvc = require("../cart/cart.service");
const orderItemsSvc = require("../orderItems/orderItems.service");
const paymentSvc = require("./payment.service");

class PaymentController {
    savePayment = async (req, res, next) => {
        try {
            const data = req.body;
            let filter = {}
            const keys = [ "pidx", "transaction_id", "tidx", "txnId", "amount", "total_amount", "mobile", "status", "purchase_order_id", "purchase_order_name"]

            keys.forEach((items) => {
                filter[items] = data[items]
            })

            const orderItemsDetails = await orderItemsSvc.getItemOrderById({
                _id: filter.purchase_order_id
            })

            const cartDetails = await cartSvc.getCartById({
                _id: orderItemsDetails.items.cartId
            })

            const paymentDetails = await paymentSvc.savePayment(filter);

            cartDetails.isActive = false;
            await cartDetails.save();

            orderItemsDetails.paymentStatus = 'paid';
            await orderItemsDetails.save();

            res.json({
                data: paymentDetails,
                code: 200, 
                status: "Payment success",
                message: "Payment success"
            })
        } catch (error) {
            throw error
        }
    }
}

const paymentCtrl = new PaymentController;

module.exports = paymentCtrl