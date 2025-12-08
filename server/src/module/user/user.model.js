const mongoose = require('mongoose');
const { userRoles } = require('../../config/const.config');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(userRoles),
        default: userRoles.CUSTOMER,
        set: v => v === '' ? undefined : v
    },
    isVerified: {
        type: Boolean,
        default: false,
        set: v => v === '' ? undefined : v
    },
    phone: String,
    avatar: {
        public_id: String,
        secure_url: String,
        optimizedUrl: String,
    },
    sellerProfile: {
        companyName: String,
        gstNumber: String,
        bio: String,
        address: String,
        rating: {
            type: Number,
            default: 0
        },
        totalReview: {
            type: Number,
            default: 0
        }
    },
    addresses: [{
        label: String,
        fullName: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    isBan : {
        type: Boolean, 
        default: false,
        set: v => v === '' ? undefined : v
    },
    favourites: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],
    meta: {
        lastLogin: Date,
        singupSource: String
    }
}, {
    autoCreate: true,
    autoIndex: true,
    timestamps: true
});

const UserModel = new mongoose.model("User", UserSchema);

module.exports = UserModel