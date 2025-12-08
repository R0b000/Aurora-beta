const CartModel = require("./cart.model");

class CartService {
    transformCartDetails = async (req, oldData, id) => {
        try {
            let data = req.body;

            data.user = req.loggedInUser._id;
            data.items.product = id;
            data.items.price = oldData.price * 100 * data.items.quantity

            if (data.coupon === '' || data.coupon === null) {
                data.coupon = null
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    saveCart = async (data) => {
        const cartDetails = new CartModel(data);
        return await cartDetails.save();
    }

    listCart = async (data) => {
        const cartList = await CartModel.find(data)
            .populate('items.product')
            .populate('user')
            .populate('coupon')

        return cartList
    }

    getCartById = async (data) => {
        const cartDetails = await CartModel.findById(data)
            .populate('items.product')
            .populate('user')
            .populate('coupon')
        return cartDetails
    }

    updateTransformCartDetails = async (req, oldData, productDetails) => {
        try {
            let data = req.body;

            let actualQuantity = 0

            if (data.items) {
                actualQuantity = data.items.quantity - oldData.items.quantity
                data.items.price = productDetails.price * 100 * data.items.quantity;
                data.items.product = productDetails._id

                if (actualQuantity > productDetails.stock) {
                    throw {
                        code: 422,
                        status: "Out of Stock",
                        message: `Reaining stock: ${productDetails.stock}}`
                    }
                }
            }

            return ({
                data,
                actualQuantity
            });
        } catch (error) {
            throw error
        }
    }

    updateCart = async (data, filter) => {
        try {
            const cartDetails = await CartModel.findByIdAndUpdate(data, filter, { new: true });

            return cartDetails
        } catch (error) {
            console.log(error)
        }
    }

    deleteCart = async (data) => {
        const cartDetails = await CartModel.findByIdAndDelete(data);
        return cartDetails
    }
}

const cartSvc = new CartService()

module.exports = cartSvc