const Joi = require("joi");
const { password } = require("./custom.validation");

const registerUserStep1 = {
  body: Joi.object().keys({
    email: Joi.string().required().email().trim().lowercase(),
    password: Joi.string().required().custom(password),
  }),
};

const additionalInfoValidationSchema = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(1).max(255).required().messages({
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 1 character long.",
      "string.max": "Name cannot exceed 255 characters.",
    }),

    age: Joi.number().integer().min(1).max(120).required().messages({
      "number.base": "Age must be a valid number.",
      "number.empty": "Age is required.",
      "number.min": "Age must be at least 1.",
      "number.max": "Age cannot exceed 120.",
    }),

    gender: Joi.string().valid("Male", "Female", "Others").required().messages({
      "any.only": "Gender must be Male, Female, or Others.",
      "string.empty": "Gender is required.",
    }),

    isMarried: Joi.boolean().required().messages({
      "boolean.base": "Marital status must be a boolean value.",
      "any.required": "Marital status is required.",
    }),

    location: Joi.object({
      zila: Joi.string().trim().min(1).required().messages({
        "string.empty": "Zila is required.",
        "string.min": "Zila must be at least 1 character long.",
      }),

      upazila: Joi.string().trim().min(1).allow("").messages({
        "string.empty": "Upazila is optional but must be a string.",
      }),

      union: Joi.string().trim().min(1).allow("").messages({
        "string.empty": "Union is optional but must be a string.",
      }),
    })
      .required()
      .messages({
        "object.base": "Location must be a valid object.",
        "any.required": "Location is required.",
      }),
  }),
};

module.exports = {
  registerUserStep1,
  additionalInfoValidationSchema,
};
