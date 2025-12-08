const Joi = require('joi')

const CategoryValidationDTO = Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().allow('', null).optional(),
    image: Joi.string().allow('', null).optional(),
});

module.exports = CategoryValidationDTO