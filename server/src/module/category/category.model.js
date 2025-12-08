const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        unique: true, 
    },
    slug: {
        type: String, 
        required: true, 
        unique: true, 
    },
    image: {
        public_id: String,
        secure_url: String,
    },
}, {
    autoCreate: true, 
    autoIndex: true,
});

const CategoryModel = new mongoose.model("Category", CategorySchema);

module.exports = CategoryModel