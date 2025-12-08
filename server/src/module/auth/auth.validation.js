const Joi = require('joi');
const { userRoles } = require('../../config/const.config');

const registerValidationDTO = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[\W_]).{8,20}$/)
        .required(),
    role: Joi.string()
        .valid(...Object.values(userRoles))
        .default(userRoles.CUSTOMER)
        .allow('', null)
        .optional(),
    phone: Joi.string().allow('', null).optional(),
    avatar: Joi.string().allow('', null).optional(),
});

const sellerProfileDTO = Joi.object({
  companyName: Joi.string().required(),
  gstNumber: Joi.string().required(),
  bio: Joi.string().allow('', null).optional(),
  address: Joi.string().required(),
});

const sellerAddressDTO = Joi.object({
  label: Joi.string().required(),
  fullName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).required(), // optional pattern for phone numbers
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null), // allow optional empty line2
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required(),
});

module.exports = {
    registerValidationDTO,
    sellerProfileDTO,
    sellerAddressDTO
}