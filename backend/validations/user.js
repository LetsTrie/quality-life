const Joi = require('joi');

module.exports = (body) => {
  return Joi.object({
    googleId: Joi.string(),
    facebookId: Joi.string(),
    imageUrl: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.number().required(),
    gender: Joi.string().required(),
    isMarried: Joi.boolean().required(),
    location: {
      zila: Joi.string().required(),
      upazila: Joi.string().required(),
      union: Joi.string(),
    },
  }).validate(body);
};
