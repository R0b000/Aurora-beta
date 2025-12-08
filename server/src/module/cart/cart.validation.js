const Joi = require('joi')

const cartValidation = Joi.object({
    items: Joi.object({
        quantity: Joi.number().required(),
    }).required(),
    coupon: Joi.string().allow(null, "").optional().default(null)
        .custom((value) => value === "" ? null : value)
})

module.exports = cartValidation