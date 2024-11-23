const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const profSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    gender: String,
    password: String,
    designation: String,
    batch: String,
    bmdc: String,
    workplace: String,
    profession: String,
    zila: String,
    upazila: String,
    union: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasRejected: {
      type: Boolean,
      default: false,
    },
    step: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    experience: String,
    eduQualification: String,
    specializationArea: String,
    otherSpecializationArea: String,
    fee: String,
    telephone: String,
    availableTime: [
      {
        day: String,
        timeRange: [
          {
            from: String,
            to: String,
          },
        ],
      },
    ],
    maxClient: String,
    avgClient: String,
    numOfClient: [String],
    ref: String,
    visibility: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

profSchema.methods.generateTokens = async (id) => {
  const accessToken = await jwt.sign(
    { id, role: "professional" },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
  const refreshToken = await jwt.sign(
    { id, role: "professional" },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  return [accessToken, refreshToken];
};

const Prof = mongoose.model("qlife_prof", profSchema);

module.exports = Prof;
