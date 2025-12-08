const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    pidx: String,
    transaction_id: String,
    tidx: String,
    txnId: String,
    amount: String,
    total_amount: String,
    mobile: String,
    status: String,
    purchase_order_id:String,
    purchase_order_name: String
}, { timestamps: true });

const TransactionModel = mongoose.model('Transaction', TransactionSchema)

module.exports = TransactionModel