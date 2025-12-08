const Joi = require('joi');

const BannerValidationDTO = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().optional().allow("", null),
    type: Joi.string().optional().allow("", null),
    image: Joi.string().optional().allow("", null),
    startAt: Joi.date().optional().allow("", null),
    endAt: Joi.date().optional().allow("", null),
    isActive: Joi.boolean().optional().allow("", null),
    priority: Joi.number().optional().allow("", null)
});

module.exports = BannerValidationDTO