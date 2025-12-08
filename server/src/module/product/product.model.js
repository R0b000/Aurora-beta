const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        index: true
    },
    description: String,
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NPR'
    },
    stock: {
        type: Number,
        default: 0
    },
    images: [{
        public_id: String,
        secure_url: String
    }],
    variants: String,
    attributes: String, // free-form object for filterable attributes
    weight: String,
    dimensions: String,
    shippingClass: String,
    isPublished: { 
        type: Boolean, 
        default: false 
    },
    isFeatured: { 
        type: Boolean, 
        default: false 
    },
    rating: { 
        type: Number, 
        default: 0 
    },
    totalReviews: { 
        type: Number, 
        default: 0 
    },
    meta: {},
});

const ProductModel = new mongoose.model('Product', ProductSchema);

module.exports = ProductModel