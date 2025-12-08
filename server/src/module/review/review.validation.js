const Joi = require("joi");

const reviewValidation = Joi.object({
  rating: Joi.number().min(0).max(5).optional().default(0),
  body: Joi.string().trim().min(3).optional().default(""),
});

module.exports = reviewValidation;
