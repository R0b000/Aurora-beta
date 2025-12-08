const couponSvc = require("../coupon/coupon.service");
const OrderModel = require("../orderItems/orderItems.model");
const orderItemsSvc = require("../orderItems/orderItems.service");
const productSvc = require("../product/product.service");
const cartSvc = require("./cart.service");

class CartController {
    addToCart = async (req, res, next) => {
        try {
            //product id
            const { id } = req.query

            //check for the verified user
            if (req.loggedInUser.isVerified === false) {
                throw {
                    code: 422,
                    status: "User not verified",
                    message: "Activate your account to use this api"
                }
            }

            const productDetails = await productSvc.getSingleProductById({
                _id: id
            });

            if (!productDetails) {
                throw {
                    code: 422,
                    status: "Invalid Code",
                    message: "No product found of that id"
                }
            };

            if (productDetails.stock === 0) {
                throw {
                    code: 422,
                    status: "Out of stock",
                    message: "Product is out of stock"
                }
            }

            if (productDetails.stock < req.body.items.quantity) {
                throw {
                    code: 422,
                    status: "Out of stock",
                    message: `"Product is out of stock": ${productDetails.stock} product remaining`
                }
            }

            if (req.body.coupon) {
                const couponDetails = await couponSvc.getCouponById({
                    _id: req.body.coupon
                })

                if (!couponDetails) {
                    throw {
                        code: 422,
                        status: "Invalid Code",
                        message: "No coupon found of that id"
                    }
                };
            }

            const transformedProductDetails = await cartSvc.transformCartDetails(req, productDetails, id);

            const cartDetails = await cartSvc.saveCart(transformedProductDetails);

            productDetails.stock = productDetails.stock - transformedProductDetails.items.quantity;
            await productDetails.save()

            res.json({
                data: cartDetails,
                code: 200,
                status: "Cart Added",
                message: "Thank you for adding to cart"
            })
        } catch (error) {
            throw error
        }
    }

    listCart = async (req, res, next) => {
        try {
            let filter = {
                isActive: true,
                user: req.loggedInUser._id
            };

            const cartList = await cartSvc.listCart(filter);

            res.json({
                data: cartList,
                code: 200,
                status: "Cart Listed",
                message: "Thank you for listing the cart"
            })
        } catch (error) {
            throw error
        }
    }

    updateCart = async (req, res, next) => {
        try {
            const { id } = req.params

            const cartDetails = await cartSvc.getCartById({
                _id: id
            })

            if (!cartDetails) {
                throw {
                    code: 422,
                    status: "No cart found",
                    message: "No cart found",
                }
            }

            const productDetails = await productSvc.getSingleProductById({
                _id: cartDetails.items.product._id
            })

            const { data: transformCartDetails, actualQuantity } = await cartSvc.updateTransformCartDetails(req, cartDetails, productDetails);

            const updatedCartDetails = await cartSvc.updateCart({ _id: id }, { $set: transformCartDetails })

            productDetails.stock -= actualQuantity
            await productDetails.save();

            res.json({
                data: updatedCartDetails,
                code: 200,
                status: "Cart updated",
                message: "Cart updated",
            })
        } catch (error) {
            throw error
        }
    }

    deleteCart = async (req, res, next) => {
        try {
            const { id } = req.params

            const cartDetails = await cartSvc.getCartById({
                _id: id
            })

            if (!cartDetails) {
                throw {
                    code: 422,
                    status: "No cart found",
                    message: "No cart found",
                }
            }

            const orderDetails = await OrderModel.findOne({
                "items.cartId": id
            })

            const productDetails = await productSvc.getSingleProductById(cartDetails.items.product._id)

            try {
                const deletedCart = await cartSvc.deleteCart({ _id: id });
                productDetails.stock += cartDetails.items.quantity
                await productDetails.save();

                if (orderDetails) {
                    await OrderModel.findByIdAndDelete({ _id: orderDetails.id })
                }

                res.json({
                    data: deletedCart,
                    code: 200,
                    status: "Cart deleted",
                    message: "Cart deleted"
                })
            } catch (error) {
                console.log(error)

                return res.status(500).json({
                    code: 500,
                    status: "Failed",
                    message: "Unable to delete cart",
                    error,
                });
            }

        } catch (error) {
            throw error
        }
    }

    getSingleCartById = async (req, res, next) => {
        try {
            const { id } = req.params

            const cartDetails = await cartSvc.getCartById(id)

            res.json({
                data: cartDetails,
                message: "Success",
                code: 200,
                options: null
            })
        } catch (error) {
            throw error
        }
    }
}

const cartCtrl = new CartController();

module.exports = cartCtrl