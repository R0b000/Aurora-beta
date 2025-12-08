const paymentCtrl = require('./payment.controller');
const paymentRoute = require('express').Router();

paymentRoute.post('/payment-success', paymentCtrl.savePayment)

module.exports = paymentRoute