const cloudinarySvc = require("../../services/cloudinary.service");
const ProductModel = require("./product.model");

class ProductService {
    createProduct = async (data) => {
        try {
            const userDetails = new ProductModel(data);
            return await userDetails.save();
        } catch (error) {
            console.log('Error', error)
            throw error
        }
    }

    transformSellerData = async (req) => {
        try {
            let data = req.body

            data.seller = req.loggedInUser._id

            data.slug = data.title.toLowerCase();
            data.price = data.price * 100

            const imagePromise = req.files.map((items) => {
                return cloudinarySvc.uploadFile(items.path, '/Product');
            })

            if (req.files && req.files.length > 0) {
                data.images = await Promise.all(imagePromise)
            }


            return data;
        } catch (error) {
            throw error
        }
    }

    listProduct = async (req, data) => {
        let page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 6
        let offset = (page - 1) * limit

        const productList = await ProductModel.find(data)
            .populate('category')
            .limit(limit)
            .skip(offset)

        let total = await ProductModel.countDocuments(data)
        return {
            productList, options: {
                page: page,
                limit: limit,
                total: total
            }
        };
    }

    getSingleProductById = async (data) => {
        const productDetails = await ProductModel.findById(data)
            .populate('category')
        return productDetails
    }

    transformProductDetails = async (req, oldData) => {
        try {
            let data = req.body;

            const imagePromise = req.files.map(items => {
                return cloudinarySvc.uploadFile(items.path, "/Product")
            })

            if (req.files && req.files.length > 0) {
                data.images = await Promise.all(imagePromise)
            } else {
                data.images = oldData.images
            }

            return data
        } catch (error) {
            throw error
        }
    }

    updatedProdctSave = async (data, filter) => {
        try {
            const updatedData = await ProductModel.findByIdAndUpdate(data, filter, { new: true });
            return updatedData
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    deleteProductById = async (data) => {
        const deletedData = await ProductModel.findByIdAndDelete(data);
        return deletedData;
    }
}

const productSvc = new ProductService();

module.exports = productSvc