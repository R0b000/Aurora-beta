const authValidator = require('../../middleware/validation.middleware');
const cartCtrl = require('./cart.controller');
const cartValidation = require('./cart.validation');

const cartRouter = require('express').Router();

cartRouter.post('/items', authValidator(cartValidation), cartCtrl.addToCart);
cartRouter.get('/list', cartCtrl.listCart)

cartRouter.route('/items/:id')
    .put(cartCtrl.updateCart)
    .delete(cartCtrl.deleteCart)
    .get(cartCtrl.getSingleCartById)

module.exports = cartRouter