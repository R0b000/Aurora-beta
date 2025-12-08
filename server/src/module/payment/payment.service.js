const TransactionModel = require("./payment.model");

class PayemntService {
    savePayment = async (data) => {
        const paymentDetails = new TransactionModel(data);
        return await paymentDetails.save();
    }
}

const paymentSvc = new PayemntService();

module.exports = paymentSvc