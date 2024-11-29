const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const { constants } = require("../utils");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    name: String,
    age: {
      type: Number,
      min: 5,
      max: 100,
    },
    gender: String,
    isMarried: Boolean,
    location: {
      zila: String,
      upazila: String,
      union: String,
    },

    // Associate
    lastIntroTestDate: String,
    mentalHealthProfile: [String],
    shownVideo: [String],
    suggestedScale: [String],

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateTokens = async (id) => {
  const accessToken = await jwt.sign(
    { id, role: constants.ROLES.USER },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
  const refreshToken = await jwt.sign(
    { id, role: constants.ROLES.USER },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  return [accessToken, refreshToken];
};

const User = mongoose.model(MODEL_NAME.USER, userSchema);

module.exports = User;
