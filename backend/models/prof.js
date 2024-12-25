const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { constants } = require('../utils');
const { MODEL_NAME } = require('./model_name');
const { StringOfMaxLength } = require('../utils/string');

const profSchema = new mongoose.Schema(
    {
        name: {
            ...StringOfMaxLength(100),
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
            enum: ['Male', 'Female', 'Other'],
        },
        password: {
            ...StringOfMaxLength(128),
        },
        designation: {
            ...StringOfMaxLength(50),
        },
        batch: {
            ...StringOfMaxLength(10),
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
                    ...StringOfMaxLength(10),
                },
                timeRange: [
                    {
                        from: {
                            ...StringOfMaxLength(10),
                        },
                        to: {
                            ...StringOfMaxLength(10),
                        },
                    },
                ],
            },
        ],
        maxClient: {
            ...StringOfMaxLength(20),
        },
        avgClient: {
            ...StringOfMaxLength(20),
        },
        numOfClient: [String], // TODO: Update the structure
        ref: {
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
