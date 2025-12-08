const CouponModel = require("./coupon.model");
const couponSvc = require("./coupon.service");

class CouponController {
    createCoupon = async (req, res, next) => {
        try {
            const transformedCouponDetails = couponSvc.transformedCouponDetails(req);

            const couponDetails = await couponSvc.saveCoupon(transformedCouponDetails)

            res.json({
                data: couponDetails,
                status: "Coupon Created",
                code: 200,
                message: "Coupon Created Successfully"
            })
        } catch (error) {
            throw error
        }
    }

    updatCoupon = async (req, res, next) => {
        try {
            const { id } = req.params;

            const couponDetails = await couponSvc.getCouponById({
                _id: id
            })

            if (!couponDetails) {
                throw {
                    code: 402,
                    status: "Invalid coupon",
                    message: "Try with different coupon"
                }
            }

            const transformedCouponDetails = await couponSvc.updateTransformedCouponDetails(req, couponDetails)

            const updatedCouponDetails = await couponSvc.saveUpdatedCouponDetails({
                _id: id
            }, transformedCouponDetails);

            res.json({
                data: updatedCouponDetails,
                code: 200,
                status: "Coupon updated",
                message: "Coupon updated successfully"
            })

        } catch (error) {
            throw error
        }
    }

    deleteCoupon = async (req, res, next) => {
        try {
            const { id } = req.params;

            const couponDetails = await couponSvc.getCouponById({
                _id: id
            })

            if (!couponDetails) {
                throw {
                    code: 402,
                    status: "Invalid coupon",
                    message: "Try with different coupon"
                }
            }

            const deletedCoupon = await couponSvc.deleteCoupon({
                _id: id
            });

            res.json({
                data: deletedCoupon,
                status: "Coupon Delted",
                code: 200,
                message: "Coupon deleted successfully"
            })

        } catch (error) {
            throw error
        }
    }

    listCoupon = async (req, res, next) => {
        try {
            let data = req.query
            let filter = {};

            if (data.discountType) filter.discountType = data.discountType
            if (data.discountValue) filter.discountValue = data.discountValue
            if (data.validFrom) filter.validFrom = data.validFrom
            if (data.validUntil) filter.validUntil = data.validUntil
            if (data.isActive) filter.isActive = data.isActive
            if (data.applicableCategories) filter.applicableCategories = data.applicableCategories

            const { listCoupon: couponList, options } = await couponSvc.listCoupon(filter);

            res.json({
                data: (couponList.length === 0) ? "Data not found" : couponList,
                code: 200,
                status: "Fetched successfully",
                message: "Fetched successfully",
                options: options
            })
        } catch (error) {
            throw error
        }
    }

    getSingleCoupon = async (req, res, next) => {
        let { id } = req.params

        const couponDetails = await CouponModel.findById({ _id: id });

        res.json({
            data: couponDetails,
            code: 200,
            status: "Fetched successfully",
            message: "Fetched successfully",
            options: null
        })
    }

    // couponValidation = async (req, res, next) => {
    //     try {
    //         const {id} = req.params;

    //         const couponDetails = await couponSvc.getCouponById({
    //             _id: id
    //         })

    //         if(!couponDetails) {
    //             throw {
    //                 code: 402, 
    //                 status: "Invalid coupon",
    //                 message: "Try with different coupon"
    //             }
    //         }

    //         if(couponDetails.isActive === false) {
    //             throw {
    //                 code: 402, 
    //                 status: "Invalid Coupon",
    //                 message: "This coupon is not valid now"
    //             }
    //         }

    //         if(couponDetails.validUntil < Date.now()) {
    //             throw {
    //                 code: 402, 
    //                 status: "Coupon Expired",
    //                 message: "Use different token"
    //             }
    //         }


    //     } catch (error) {
    //         throw error
    //     }
    // }
}

const couponCtrl = new CouponController;

module.exports = couponCtrl