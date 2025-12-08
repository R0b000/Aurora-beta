const uploader = require('../../middleware/uploader.middleware');
const productCtrl = require('../product/product.controller');

const sellerRouter = require('express').Router();

sellerRouter.route('/products')
    .post(uploader().array('images', 5), productCtrl.createProduct)
    .get(productCtrl.listProduct)

sellerRouter.route('/products/:id')
    .get(productCtrl.getSingleProductById)
    .put(uploader().array('images', 5), productCtrl.updateProductById)
    .delete(productCtrl.deleteProductById)

module.exports = sellerRouter