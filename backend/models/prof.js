const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { constants } = require('../utils');
const { MODEL_NAME } = require('./model_name');
const { StringOfMaxLength } = require('../utils/string');

const profSchema = new mongoose.Schema(
    {
        name: {
            ...StringOfMaxLength(50),
            required: true,
            minlength: 2,
        },
        email: {
            ...StringOfMaxLength(254),
            required: true,
            unique: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Others'],
        },
        password: {
            ...StringOfMaxLength(128),
        },
        designation: {
            ...StringOfMaxLength(50),
        },
        batch: {
            ...StringOfMaxLength(20),
        },
        bmdc: {
            ...StringOfMaxLength(50),
        },
        workplace: {
            ...StringOfMaxLength(100),
        },
        profession: {
            ...StringOfMaxLength(50),
        },
        zila: {
            ...StringOfMaxLength(25),
        },
        upazila: {
            ...StringOfMaxLength(25),
        },
        union: {
            ...StringOfMaxLength(25),
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        step: {
            type: Number,
            min: 1,
            max: 4,
            default: 1,
        },
        experience: {
            ...StringOfMaxLength(100),
        },
        eduQualification: {
            ...StringOfMaxLength(100),
        },
        specializationArea: {
            ...StringOfMaxLength(100),
        },
        otherSpecializationArea: {
            ...StringOfMaxLength(100),
        },
        fee: {
            ...StringOfMaxLength(20),
        },
        telephone: {
            ...StringOfMaxLength(20),
        },
        availableTime: [
            {
                day: {
                    ...StringOfMaxLength(20),
                },
                timeRange: [
                    {
                        from: {
                            ...StringOfMaxLength(20),
                        },
                        to: {
                            ...StringOfMaxLength(20),
                        },
                    },
                ],
            },
        ],
        maximumWeeklyClient: {
            ...StringOfMaxLength(20),
        },
        averageWeeklyClient: {
            ...StringOfMaxLength(20),
        },
        numberOfClients: [
            {
                location: { ...StringOfMaxLength(20) },
                count: { ...StringOfMaxLength(5) },
            },
        ],
        reference: {
            ...StringOfMaxLength(100),
        },
        visibility: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            ...StringOfMaxLength(10),
        },
        otpExpiredAt: {
            type: Date,
        },
        otpUseCase: {
            type: String,
            enum: [constants.FORGET_PASSWORD, constants.VERIFY_EMAIL],
        },
        canResetPassword: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

profSchema.methods.generateTokens = async id => {
    const accessToken = await jwt.sign(
        { id, role: constants.ROLES.PROFESSIONAL },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: process.env.JWT_EXPIRATION },
    );
    const refreshToken = await jwt.sign(
        { id, role: constants.ROLES.PROFESSIONAL },
        process.env.JWT_REFRESH_TOKEN,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION },
    );

    return [accessToken, refreshToken];
};

const Prof = mongoose.model(MODEL_NAME.PROFESSIONAL, profSchema);

module.exports = Prof;
