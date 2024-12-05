const jwt = require("jsonwebtoken");
const Professional = require("../models/prof");
const User = require("../models/user");
const { sendErrorResponse } = require("../utils");

const INCOMPLETE_PROFILE = "INCOMPLETE_PROFILE:";

const ignoreApiForIncompleteProfileCheck = [
  "/user/add-info",
  "/prof/register/step-1",
  "/prof/register/step-2",
  "/prof/register/step-3",
  "/prof/register/step-4",
];

exports.verifyToken = (role) => async (req, res, next) => {
  if (!["user", "prof"].includes(role)) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Invalid role specified",
    });
  }

  const bearerHeader = req.headers.authorization;
  if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Authorization token is missing or invalid",
    });
  }

  const accessToken = bearerHeader.split(" ")[1];
  if (!accessToken) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Access token is required",
    });
  }

  try {
    const decoded = await jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
    if (!decoded || !decoded.id) {
      return sendErrorResponse(res, 401, "InvalidToken", {
        success: false,
        message: "Invalid or malformed token",
      });
    }

    const isUser = role === "user";
    const isProfessional = role === "prof";

    const Model = isUser ? User : Professional;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return sendErrorResponse(res, 401, "InvalidToken", {
        message: "User not found",
      });
    }

    // if (!user.isEmailVerified) {
    //   return sendErrorResponse(res, 401, "EmailNotVerified", {
    //     message: "Incomplete profile",
    //   });
    // }

    if (!ignoreApiForIncompleteProfileCheck.includes(req.originalUrl)) {
      if (isUser) {
        if (!user.age) {
          const _type = INCOMPLETE_PROFILE + "STEP:2";
          return sendErrorResponse(res, 401, _type, {
            message:
              "অনুগ্রহ করে প্রোফাইল সম্পূর্ণ করতে প্রয়োজনীয় ধাপগুলো সম্পন্ন করুন",
          });
        }
      } else if (isProfessional) {
        if (user.step < 4) {
          const _type = INCOMPLETE_PROFILE + "STEP:" + user.step;
          return sendErrorResponse(res, 401, _type, {
            message:
              "অনুগ্রহ করে প্রোফাইল সম্পূর্ণ করতে প্রয়োজনীয় ধাপগুলো সম্পন্ন করুন",
          });
        }
      }
    }

    req.user = user;
    req.isUser = isUser;
    req.isProfessional = isProfessional;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendErrorResponse(res, 401, "InvalidToken", {
        success: false,
        message: "Token has expired, please login again",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return sendErrorResponse(res, 401, "InvalidToken", {
        success: false,
        message: "Invalid token, authentication failed",
      });
    }

    return sendErrorResponse(res, 500, "ServerError", {
      success: false,
      message: "An error occurred while processing the token",
      error: error.message,
    });
  }
};
