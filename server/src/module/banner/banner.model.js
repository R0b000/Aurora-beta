const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    type: {
        type: String, 
        enum: ['homepage', 'category'],
        default: 'homepage'
    },
    image: {
        public_id: String, 
        secure_url: String
    },
    startAt: Date,
    endAt: Date,
    isActive: { 
        type: Boolean, 
        default: true 
    },
    priority: { 
        type: Number, 
        default: 0 
    },
    metadata: {}
}, { timestamps: true });

const BannerModel = mongoose.model('Banner', BannerSchema);

module.exports = BannerModel