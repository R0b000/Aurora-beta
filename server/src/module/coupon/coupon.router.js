const authValidator = require('../../middleware/validation.middleware');
const couponCtrl = require('./coupon.controller');
const CouponValidationDTO = require('./coupon.validation');

const couponRouter  = require('express').Router();

couponRouter.post('/create', authValidator(CouponValidationDTO), couponCtrl.createCoupon)

couponRouter.get('/list', couponCtrl.listCoupon)

couponRouter.route('/:id')
    .put(couponCtrl.updatCoupon)
    .delete(couponCtrl.deleteCoupon)
    .get(couponCtrl.getSingleCoupon)

module.exports = couponRouter