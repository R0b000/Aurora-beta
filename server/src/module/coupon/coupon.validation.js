const Joi = require('joi')

const CouponValidationDTO = Joi.object({
    discountType: Joi.string().equal('percentage', 'fixed').required(),
    discountValue: Joi.number().required(),
    validFrom: Joi.date().required(),
    validUntil: Joi.date().required(),
    applicableCategories: Joi.array().optional().default(null),
})

module.exports = CouponValidationDTO