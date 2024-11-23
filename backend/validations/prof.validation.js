const Joi = require("joi");
const { password } = require("./custom.validation");

const registerProfessionalStep1 = {
  body: Joi.object().keys({
    email: Joi.string().required().email().trim().lowercase(),
    password: Joi.string().required().custom(password),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
    name: Joi.string().required(),
    gender: Joi.number().valid("Male", "Female", "Others").required(),
    designation: Joi.string().allow(""),
    batch: Joi.string().allow(""),
    bmdc: Joi.string().allow(""),
    profession: Joi.number()
      .valid(
        "Clinical psychologist",
        "Assistant clinical psychologist",
        "Psychiatrist"
      )
      .required(),
    workplace: Joi.string().allow(""),
    zila: Joi.string().required(),
    upazila: Joi.string().required(),
    union: Joi.string().allow(""),
  }),
};

const registerProfessionalStep2 = {
  body: Joi.object().keys({
    experience: Joi.string().required().messages({
      "string.empty": "অভিজ্ঞতা ফিল্ড পূরণ করুন",
    }),
    eduQualification: Joi.string().required().messages({
      "string.empty": "শিক্ষাগত যোগ্যতা ফিল্ড পূরণ করুন",
    }),
    specializationArea: Joi.string().required().messages({
      "string.empty": "স্পেশ্যালাইজেশন এরিয়া ফিল্ড পূরণ করুন",
    }),
    otherSpecializationArea: Joi.when("specializationArea", {
      is: "অন্যান্য",
      then: Joi.string().required().messages({
        "string.empty": "এরিয়া উল্লেখ করুন",
      }),
      otherwise: Joi.string().allow(""),
    }),
    fee: Joi.number().required().messages({
      "number.base": "ফি শুধুমাত্র সংখ্যা হতে হবে",
      "any.required": "ফি ফিল্ড পূরণ করুন",
    }),
    telephone: Joi.string()
      .required()
      .pattern(/^[0-9]+$/)
      .messages({
        "string.empty": "টেলিফোন নম্বর পূরণ করুন",
        "string.pattern.base": "টেলিফোন নম্বর শুধুমাত্র সংখ্যা হতে হবে",
      }),
  }),
};

const profVisibility = {
  body: Joi.object().keys({
    visibility: Joi.boolean().required(),
  }),
};

// const login = {
//   body: Joi.object().keys({
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//   }),
// };

// const logout = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const refreshTokens = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const forgotPassword = {
//   body: Joi.object().keys({
//     email: Joi.string().email().required(),
//   }),
// };

// const resetPassword = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
//   body: Joi.object().keys({
//     password: Joi.string().required().custom(password),
//   }),
// };

// const verifyEmail = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
// };

module.exports = {
  registerProfessionalStep1,
  registerProfessionalStep2,
  profVisibility,
};
