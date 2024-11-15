const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema(
  {
    email: String,
    code: Number,
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const VerificationCode = mongoose.model(
  "qlife_verificationCode",
  verificationCodeSchema
);

module.exports = VerificationCode;
