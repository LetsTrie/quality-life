const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/user");
const { Professional } = require("../models");
const bcrypt = require("bcrypt");
const { sendErrorResponse, sendJSONresponse, constants } = require("../utils");
const jwt = require("jsonwebtoken");

// POST /user/sign-up
exports.signUp = asyncHandler(async (req, res, _next) => {
  const user = await User.findOne({
    email: req.body.email,
  }).lean();

  if (user) {
    return sendErrorResponse(res, 401, "UNAUTHORIZED", {
      message: "এই পরিচয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে",
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newUser = new User(req.body);
  await newUser.save();

  const [accessToken, refreshToken] = await newUser.generateTokens(newUser._id);

  return sendJSONresponse(res, 201, {
    data: {
      user: newUser,
      accessToken,
      refreshToken,
    },
  });
});

// POST /user/sign-in
// TODO: Write Request Body Validation...
exports.signIn = asyncHandler(async (req, res, _next) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return sendJSONresponse(res, 401, "UNAUTHORIZED", {
      message: "ইমেইল/পাসওয়ার্ডটি ভুল",
    });
  }

  const isMatch = bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return sendJSONresponse(res, 401, "UNAUTHORIZED", {
      message: "ইমেইল/পাসওয়ার্ডটি ভুল",
    });
  }

  const [accessToken, refreshToken] = await user.generateTokens(user._id);
  const isNewUser = !user.age;

  return sendJSONresponse(res, 200, {
    data: {
      user,
      accessToken,
      refreshToken,
      isNewUser,
    },
  });
});

// TODO: Forget Password
// TODO: Reset Password

// Token Refresher API :: POST /auth/refresh-token
exports.tokenRefresher = asyncHandler(async (req, res, _next) => {
  const { refreshToken } = req.body;

  // Validate the refresh token
  if (!refreshToken) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Refresh token is required",
    });
  }

  try {
    const decoded = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN
    );

    const { id, role } = decoded;

    let tokenUser;

    if (role === constants.ROLES.USER) {
      tokenUser = await User.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, "UnAuthorized", {
          message: "Invalid refresh token",
        });
      }
    } else if (role === constants.ROLES.PROFESSIONAL) {
      tokenUser = await Professional.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, "UnAuthorized", {
          message: "Invalid refresh token",
        });
      }
    }

    const [newAccessToken, newRefreshToken] = await tokenUser.generateTokens(
      id
    );

    return sendJSONresponse(res, 200, {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, 401, "UnAuthorized", {
      message: "দয়া করে আবার লগইন করুন।",
    });
  }
});
