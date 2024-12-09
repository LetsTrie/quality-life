const Joi = require('joi');
const { password } = require('./custom.validation');
const { constants } = require('../utils');

const verifyEmail = {
  query: Joi.object().keys({
    email: Joi.string().required().email().trim().lowercase(),
    accountType: Joi.string()
      .valid(...[constants.ROLES.USER, constants.ROLES.PROFESSIONAL])
      .required(),
    useCase: Joi.string()
      .valid(...[constants.FORGET_PASSWORD, constants.VERIFY_EMAIL])
      .required(),
  }),
};

const verifyOtp = {
  query: Joi.object().keys({
    email: Joi.string().required().email().trim().lowercase(),
    otp: Joi.number().required(),
    accountType: Joi.string()
      .valid(...[constants.ROLES.USER, constants.ROLES.PROFESSIONAL])
      .required(),
    useCase: Joi.string()
      .valid(...[constants.FORGET_PASSWORD, constants.VERIFY_EMAIL])
      .required(),
  }),
};

const updatePasswordWithOtp = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    email: Joi.string().required().email().trim().lowercase(),
    accountType: Joi.string()
      .valid(...[constants.ROLES.USER, constants.ROLES.PROFESSIONAL])
      .required(),
  }),
};

module.exports = {
  verifyEmail,
  verifyOtp,
  updatePasswordWithOtp,
};
