const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/user");
const { Professional } = require("../models");
const bcrypt = require("bcrypt");
const { sendErrorResponse, sendJSONresponse } = require("../utils");

// API List
// 1. User Registration :: POST /user/sign-up
// 2. User Login :: POST /user/sign-in

// Last updated: 19.03.2024 (Tested)
// Author: MD. Sakib Khan
exports.signUp = asyncHandler(async (req, res, next) => {
  // TODO: Write Request Body Validation...

  const user = await User.findOne({
    email: req.body.email,
  }).lean();

  if (user) {
    console.error(`User already exists: ${req.body.email}`);
    return res.status(401).json({
      success: false,
      message: "User already exists",
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newUser = new User(req.body);
  await newUser.save();

  const [accessToken, refreshToken] = await newUser.generateTokens(newUser._id);

  console.log("After Register: ", {
    success: true,
    data: {
      user: newUser,
      accessToken,
      refreshToken,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      user: newUser, // TODO: Reduce Informations.
      accessToken,
      refreshToken,
    },
  });
});

// Last updated: 19.03.2024 (Tested)
// Author: MD. Sakib Khan
exports.signIn = asyncHandler(async (req, res, _next) => {
  // TODO: Write Request Body Validation...
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    // TODO: Handle Errors differently... log and send error from there
    console.error(`No user found: ${req.body.email}`);
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isMatch = bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    console.error("Password - not matching!!");
    return res.status(401).json({
      success: true,
      message: "Invalid credentials",
    });
  }

  const [accessToken, refreshToken] = await user.generateTokens(user._id);

  const todaysDate = new Date();
  const lastTestTakenDate = new Date(user.lastIntroTestDate);
  const differences = (todaysDate - lastTestTakenDate) / (1000 * 3600 * 24);

  const didIntroTest = differences > 7;
  const isNewUser = !user.age;

  console.log("After Login: ", {
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
      didIntroTest,
      isNewUser,
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      user, // TODO: Reduce Informations.
      accessToken,
      refreshToken,
      didIntroTest,
      isNewUser,
    },
  });
});

// TODO: Forget Password
// TODO: Reset Password

const ROLES = {
  USER: "user",
  PROFESSIONAL: "professional",
};

// Token Refresher API :: POST /auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res, next) => {
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

    if (role === ROLES.USER) {
      tokenUser = await User.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, "UnAuthorized", {
          message: "Invalid refresh token",
        });
      }
    } else if (role === ROLES.PROFESSIONAL) {
      tokenUser = await Professional.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, "UnAuthorized", {
          message: "Invalid refresh token",
        });
      }
    }

    const [accessToken, refreshToken] = await tokenUser.generateTokens(id);

    console.log("Tokens refreshed for user:", {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
    });

    return sendJSONresponse(res, 200, {
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error refreshing tokens:", error);

    return sendErrorResponse(res, 401, "UnAuthorized", {
      message: "Please log in again",
    });
  }
});
