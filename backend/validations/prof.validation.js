const Joi = require('joi');
const { password } = require('./custom.validation');

const registerProfessionalStep1 = {
    body: Joi.object().keys({
        email: Joi.string().required().email().trim().lowercase(),
        password: Joi.string().required().custom(password),
        confirmPassword: Joi.any()
            .valid(Joi.ref('password'))
            .required()
            .messages({ 'any.only': 'Passwords do not match' }),
        name: Joi.string().required(),
        gender: Joi.number().valid('Male', 'Female', 'Others').required(),
        designation: Joi.string().allow(''),
        batch: Joi.string().allow(''),
        bmdc: Joi.string().allow(''),
        profession: Joi.number()
            .valid(
                'Clinical psychologist',
                'Assistant clinical psychologist',
                'Psychiatrist',
            )
            .required(),
        workplace: Joi.string().allow(''),
        zila: Joi.string().required(),
        upazila: Joi.string().required(),
        union: Joi.string().allow(''),
    }),
};

const registerProfessionalStep2 = {
    body: Joi.object().keys({
        experience: Joi.string().required().messages({
            'string.empty': 'অভিজ্ঞতা ফিল্ড পূরণ করুন',
        }),
        eduQualification: Joi.string().required().messages({
            'string.empty': 'শিক্ষাগত যোগ্যতা ফিল্ড পূরণ করুন',
        }),
        specializationArea: Joi.string().required().messages({
            'string.empty': 'স্পেশ্যালাইজেশন এরিয়া ফিল্ড পূরণ করুন',
        }),
        otherSpecializationArea: Joi.when('specializationArea', {
            is: 'অন্যান্য',
            then: Joi.string().required().messages({
                'string.empty': 'এরিয়া উল্লেখ করুন',
            }),
            otherwise: Joi.string().allow(''),
        }),
        fee: Joi.number().required().messages({
            'number.base': 'ফি শুধুমাত্র সংখ্যা হতে হবে',
            'any.required': 'ফি ফিল্ড পূরণ করুন',
        }),
        telephone: Joi.string()
            .required()
            .pattern(/^[0-9]+$/)
            .messages({
                'string.empty': 'টেলিফোন নম্বর পূরণ করুন',
                'string.pattern.base': 'টেলিফোন নম্বর শুধুমাত্র সংখ্যা হতে হবে',
            }),
    }),
};

const allowedDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const timeFormatRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/;

const timeRangeSchema = Joi.object({
    from: Joi.string().pattern(timeFormatRegex).required().messages({
        'string.pattern.base': '"from" must be in the format hh:mmAM/PM',
    }),
    to: Joi.string().pattern(timeFormatRegex).required().messages({
        'string.pattern.base': '"to" must be in the format hh:mmAM/PM',
    }),
});

const availableTimeSchema = Joi.object({
    day: Joi.string()
        .valid(...allowedDays)
        .required()
        .messages({
            'any.only': `"day" must be one of ${allowedDays.join(', ')}`,
        }),
    timeRange: Joi.array().items(timeRangeSchema).required(),
});

const registerProfessionalStep3 = {
    body: Joi.object().keys({
        availableTime: Joi.array()
            .items(availableTimeSchema)
            .required()
            .messages({
                'array.includes':
                    'Each item in "availableTime" must have a valid day and timeRange',
            }),
    }),
};

const clientOptions = [
    '০-৫ জন',
    '৬-১০ জন',
    '১১-১৫ জন',
    '১৬-২০ জন',
    '২১ বা তার উর্ধে',
];

const registerProfessionalStep4 = {
    body: Joi.object().keys({
        maximumWeeklyClient: Joi.string()
            .valid(...clientOptions)
            .required()
            .messages({
                'any.only': `"maximumWeeklyClient" must be one of ${clientOptions.join(
                    ', ',
                )}`,
                'any.required': '"maximumWeeklyClient" is required',
            }),

        averageWeeklyClient: Joi.string()
            .valid(...clientOptions)
            .required()
            .messages({
                'any.only': `"averageWeeklyClient" must be one of ${clientOptions.join(
                    ', ',
                )}`,
                'any.required': '"averageWeeklyClient" is required',
            }),

        numberOfClients: Joi.array()
            .items(
                Joi.object({
                    location: Joi.string().max(20).required().messages({
                        'string.max': 'Location must not exceed 20 characters',
                        'string.empty': 'Location is required',
                    }),
                    count: Joi.string()
                        .max(5)
                        .required()
                        .messages({
                            'string.max': 'Count must not exceed 5 characters',
                        })
                        .allow(''),
                }),
            )
            .min(1)
            .required()
            .messages({
                'array.base': '"numberOfClients" must be an array',
                'array.min': '"numberOfClients" must contain at least one item',
            }),

        reference: Joi.string()
            .max(255)
            .messages({
                'string.base': '"reference" must be a string',
                'string.max': '"reference" must not exceed 255 characters',
                'any.required': '"reference" is required',
            })
            .allow(''),
    }),
};

const profVisibility = {
    body: Joi.object().keys({
        visibility: Joi.boolean().required(),
    }),
};

module.exports = {
    registerProfessionalStep1,
    registerProfessionalStep2,
    registerProfessionalStep3,
    registerProfessionalStep4,
    profVisibility,
};
