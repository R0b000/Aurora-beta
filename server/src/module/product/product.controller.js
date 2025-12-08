const productSvc = require("./product.service");

class ProductController {
    createProduct = async (req, res, next) => {
        try {
            if (req.loggedInUser.isVerified === false) {
                throw {
                    code: 402,
                    status: "Verify you account first",
                    message: "Since your account is not verified, you cannot create the product"
                }
            }

            if (req.loggedInUser.isBan === true) {
                throw {
                    code: 402,
                    status: "Account is banned",
                    message: "Contact customer service and unban you account first to create the product."
                }
            }

            const transformedData = await productSvc.transformSellerData(req);

            const productDetails = await productSvc.createProduct(transformedData)

            res.json({
                data: productDetails,
                code: 200,
                status: "Product Created Successfully",
                message: "Seller successfully created the product"
            })
        } catch (error) {
            throw error
        }
    }

    listProduct = async (req, res, next) => {
        try {
            let { id } = req.query;

            // Build filter by merging conditions instead of overwriting
            // so that the passed `id` exclusion remains applied.
            let filter = {}

            if (id) {
                // exclude the provided id from results
                filter._id = { $ne: id }
            }

            // Merge visibility / role-based constraints without resetting filter
            if (!req.loggedInUser || req.loggedInUser === null || req.loggedInUser === undefined) {
                // public users should only see published products
                filter.isPublished = true
            } else if (req.loggedInUser.role === 'admin') {
                // admin should be able to see all products; do not reset filter
            } else {
                // sellers should only see their own products (still keep _id exclusion)
                filter.seller = req.loggedInUser._id
            }

            let { title, seller, category, minPrice, maxPrice, minRating, maxRating } = req.query

            if (title) filter.title = { $regex: title, $options: 'i' }
            if(seller) filter.seller = seller
            if (category) filter.category = category
            // Price filter
            if (minPrice && maxPrice) {
                filter.price = { $gte: Number(minPrice) * 100, $lte: Number(maxPrice) * 100 };
            } else if (minPrice) {
                filter.price = { $gte: Number(minPrice) * 100 };
            } else if (maxPrice) {
                filter.price = { $lte: Number(maxPrice) * 100 };
            }

            // Rating filter
            if (minRating && maxRating) {
                filter.rating = { $gte: Number(minRating), $lte: Number(maxRating) };
            } else if (minRating) {
                filter.rating = { $gte: Number(minRating) };
            } else if (maxRating) {
                filter.rating = { $lte: Number(maxRating) };
            }

            const { productList, options } = await productSvc.listProduct(req, filter)

            res.json({
                data: productList,
                code: 200,
                status: "Product fetched Successfully",
                message: "All list of the product has been fetched successfully",
                options: options

            })
        } catch (error) {
            throw error
        }
    }

    getSingleProductById = async (req, res, next) => {
        try {
            const { id } = req.params

            const productDetails = await productSvc.getSingleProductById({
                _id: id
            })

            if (!productDetails) {
                throw {
                    code: 422,
                    status: "Product Id Error",
                    message: "Product is either deleted or invalid id"
                }
            }

            res.json({
                data: productDetails,
                code: 200,
                status: "Product fetched successfully",
                message: "Product fetched successfully",
            })
        } catch (error) {
            throw error
        }
    }

    updateProductById = async (req, res, next) => {
        try {
            const { id } = req.params

            const productDetails = await productSvc.getSingleProductById({
                _id: id
            })

            if (!productDetails) {
                throw {
                    code: 422,
                    status: "Product Id Error",
                    message: "Product is either deleted or invalid id"
                }
            }

            const transformedProductData = await productSvc.transformProductDetails(req, productDetails)

            const updatedData = await productSvc.updatedProdctSave(
                id
                , { $set: transformedProductData });

            res.json({
                data: updatedData,
                code: 200,
                status: "Product updated successfully",
                message: "Product has been updated successfully"
            })
        } catch (error) {
            throw error
        }
    }

    deleteProductById = async (req, res, next) => {
        try {
            const { id } = req.params;

            const productDetails = await productSvc.getSingleProductById({
                _id: id
            })

            if (!productDetails) {
                throw {
                    code: 422,
                    status: "Product Id Error",
                    message: "Product is either deleted or invalid id"
                }
            }

            const deletedProductDetails = await productSvc.deleteProductById({ _id: id })

            res.json({
                data: deletedProductDetails,
                code: 200,
                status: "Product successfully deleted",
                message: "Product has been successfully deleted"
            })
        } catch (error) {
            throw error
        }
    }

}

const productCtrl = new ProductController();

module.exports = productCtrl