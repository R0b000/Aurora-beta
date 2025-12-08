const { randomNumberGeneration } = require("../../utility/helper");
const CouponModel = require("./coupon.model");

class CouponService {
    transformedCouponDetails = (req) => {
        try {
            let data = req.body;

            data.code = randomNumberGeneration(10);

            return data
        } catch (error) {
            throw error
        }
    }

    saveCoupon = async (data) => {
        const couponDetails = new CouponModel(data);
        return await couponDetails.save();
    }

    getCouponById = async (data) => {
        const couponDetails = await CouponModel.findById(data);
        return couponDetails
    }

    updateTransformedCouponDetails = async (req, oldData) => {
        try {
            let data = req.body;

            let keys = ['discountType', 'discountValue', 'validFrom', 'validUntil', 'isActive', 'applicableCategories']

            if (!data) {
                data = oldData
            } else {
                keys.forEach((items) => {
                    if (!data[items] || data[items] === "" || data[items] === null) {
                        data[items] = oldData[items]
                    }
                })
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    saveUpdatedCouponDetails = async (data, filter) => {
        const updatedDetails = await CouponModel.findByIdAndUpdate(data, filter, {new: true})
        return updatedDetails
    }

    deleteCoupon = async (data) => {
        const deletedCoupon = await CouponModel.findByIdAndDelete(data);
        return deletedCoupon
    }

    listCoupon = async (data) => {
        const listCoupon = await CouponModel.find(data)
        const total = await CouponModel.countDocuments(data)
        return {listCoupon, options: {
            total: total
        }}
    }
}

const couponSvc = new CouponService();

module.exports = couponSvc