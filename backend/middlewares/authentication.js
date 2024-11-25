const jwt = require("jsonwebtoken");
const Professional = require("../models/prof");
const User = require("../models/user");
const { sendErrorResponse } = require("../utils");

/**
 * Middleware to verify JWT token and authorize based on role.
 * @param {string} role - The role to authorize ("user" or "prof").
 */
exports.verifyToken = (role) => async (req, res, next) => {
  if (!["user", "prof"].includes(role)) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Invalid role specified",
    });
  }

  // Validate Authorization header
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
    return sendErrorResponse(res, 400, "ValidationError", {
      message: "Authorization token is missing or invalid",
    });
  }

  // Extract token from header
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

    const Model = role === "user" ? User : Professional;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return sendErrorResponse(res, 401, "InvalidToken", {
        message: "User not found",
      });
    }

    req.user = user;
    if (role === "prof") req.prof = user;

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

    // Handle unexpected errors
    return sendErrorResponse(res, 500, "ServerError", {
      success: false,
      message: "An error occurred while processing the token",
      error: error.message,
    });
  }
};
