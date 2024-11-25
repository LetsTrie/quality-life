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

const allowedDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timeFormatRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/;

const timeRangeSchema = Joi.object({
  from: Joi.string().pattern(timeFormatRegex).required().messages({
    "string.pattern.base": '"from" must be in the format hh:mmAM/PM',
  }),
  to: Joi.string().pattern(timeFormatRegex).required().messages({
    "string.pattern.base": '"to" must be in the format hh:mmAM/PM',
  }),
});

const availableTimeSchema = Joi.object({
  day: Joi.string()
    .valid(...allowedDays)
    .required()
    .messages({
      "any.only": `"day" must be one of ${allowedDays.join(", ")}`,
    }),
  timeRange: Joi.array().items(timeRangeSchema).required(),
});

const registerProfessionalStep3 = {
  body: Joi.object().keys({
    availableTime: Joi.array().items(availableTimeSchema).required().messages({
      "array.includes":
        'Each item in "availableTime" must have a valid day and timeRange',
    }),
  }),
};

const clientOptions = [
  "০-৫ জন",
  "৬-১০ জন",
  "১১-১৫ জন",
  "১৬-২০ জন",
  "২১ বা তার উর্ধে",
];

const registerProfessionalStep4 = {
  body: Joi.object().keys({
    maxClient: Joi.string()
      .valid(...clientOptions)
      .required()
      .messages({
        "any.only": `"maxClient" must be one of ${clientOptions.join(", ")}`,
        "any.required": '"maxClient" is required',
      }),

    avgClient: Joi.string()
      .valid(...clientOptions)
      .required()
      .messages({
        "any.only": `"avgClient" must be one of ${clientOptions.join(", ")}`,
        "any.required": '"avgClient" is required',
      }),

    numOfClient: Joi.array()
      .items(
        Joi.alternatives()
          .try(Joi.string(), Joi.number().integer().min(0))
          .allow("")
      )
      .length(9)
      .required()
      .messages({
        "array.length": '"numOfClient" must contain exactly 9 items',
      }),
    ref: Joi.string()
      .max(255)
      .messages({
        "string.base": '"ref" must be a string',
        "string.max": '"ref" must not exceed 255 characters',
        "any.required": '"ref" is required',
      })
      .allow(""),
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
  registerProfessionalStep3,
  registerProfessionalStep4,
  profVisibility,
};
