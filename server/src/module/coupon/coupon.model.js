const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: {
        type: String, 
        enum: ['percentage', 'fixed'], 
        default: 'percentage'
    },
    discountValue: Number, 
    validFrom: Date,
    validUntil: Date,
    isActive: { 
        type: Boolean, 
        default: true 
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }]
}, {
    autoCreate: true, 
    autoIndex: true,
})

const CouponModel = new mongoose.model('Coupon', CouponSchema);

module.exports = CouponModel