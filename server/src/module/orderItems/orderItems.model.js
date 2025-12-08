const mongoose = require('mongoose')

const OrderItemSchema = new mongoose.Schema({
    cartId: {type: mongoose.Schema.Types.ObjectId, ref: 'Cart'},
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    quantity: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: OrderItemSchema,
    shippingAddress: Object,
    billingAddress: Object,
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'placed'
    },
    shippingProvider: String,
    shippingTrackingNumber: String,
    subtotal: Number,
    shippingCost: Number,
    tax: Number,
    discount: Number,
    total: Number,
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    sellerSettlement: {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    },
    meta: {}
}, { timestamps: true });

const OrderModel = new mongoose.model("Order", OrderSchema)

module.exports = OrderModel