const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: Number
    },
    isActive: {
        type: Boolean, 
        default: true
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    meta: {}
}, { timestamps: true });

const CartModel = new mongoose.model('Cart', CartSchema);

module.exports = CartModel