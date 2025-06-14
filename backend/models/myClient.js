const mongoose = require('mongoose');
const { MODEL_NAME } = require('./model_name');
const Schema = mongoose.Schema;

const profsClient = Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: MODEL_NAME.USER,
            required: true,
        },
        prof: {
            type: Schema.Types.ObjectId,
            ref: MODEL_NAME.PROFESSIONAL,
            required: true,
        },
        customId: {
            type: String,
            default: () =>
                Math.floor(1000000 + Math.random() * 9000000).toString(),
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

profsClient.index({ user: 1, prof: 1, isActive: 1 }, { unique: true });

const ProfsClient = mongoose.model(
    MODEL_NAME.PROFESSIONALS_CLIENT,
    profsClient,
);

module.exports = ProfsClient;
