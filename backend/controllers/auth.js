const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/user');
const { Professional } = require('../models');
const bcrypt = require('bcrypt');
const {
  sendErrorResponse,
  sendJSONresponse,
  constants,
  generateOTP,
} = require('../utils');
const jwt = require('jsonwebtoken');

const Appointment = require('../models/appointment');
const ProfsClient = require('../models/myClient');
const ProfAssessment = require('../models/profAssessment');
const Rating = require('../models/rating');
const Test = require('../models/test');
const { Notification } = require('../models');
const { sendEmail } = require('../services/email');
const {
  otpVerificationEmailTemplate,
} = require('../services/email-templates/otp-verification');
const { toString } = require('../utils/string');

// POST /user/sign-up
exports.signUp = asyncHandler(async (req, res, _next) => {
  const user = await User.findOne({
    email: req.body.email,
  }).lean();

  if (user) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'এই পরিচয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে',
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newUser = await User.create(req.body);

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
exports.signIn = asyncHandler(async (req, res, _next) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'ইমেইল/পাসওয়ার্ডটি ভুল',
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'ইমেইল/পাসওয়ার্ডটি ভুল',
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

// POST /auth/refresh-token
exports.tokenRefresher = asyncHandler(async (req, res, _next) => {
  const { refreshToken } = req.body;

  // Validate the refresh token
  if (!refreshToken) {
    return sendErrorResponse(res, 400, 'ValidationError', {
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN,
    );

    const { id, role } = decoded;

    let tokenUser;

    if (role === constants.ROLES.USER) {
      tokenUser = await User.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, 'UnAuthorized', {
          message: 'Invalid refresh token',
        });
      }
    } else if (role === constants.ROLES.PROFESSIONAL) {
      tokenUser = await Professional.findById(id);
      if (!tokenUser) {
        return sendErrorResponse(res, 401, 'UnAuthorized', {
          message: 'Invalid refresh token',
        });
      }
    }

    const [newAccessToken, newRefreshToken] = await tokenUser.generateTokens(
      id,
    );

    return sendJSONresponse(res, 200, {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, 401, 'UnAuthorized', {
      message: 'দয়া করে আবার লগইন করুন।',
    });
  }
});

// POST /user/reset-password
exports.resetPassword = asyncHandler(async (req, res, _next) => {
  const { oldPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(oldPassword, req.user.password);
  if (!isMatch) {
    return sendErrorResponse(res, 401, 'Unauthorized', {
      message: 'পুরনো পাসওয়ার্ড সঠিক নয়।',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  req.user.password = hashedPassword;
  await req.user.save();

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

exports.deleteUserAccount = asyncHandler(async (req, res, _next) => {
  const userId = req.user._id;

  await Appointment.deleteMany({ user: userId });

  await ProfsClient.deleteMany({ user: userId });

  await ProfAssessment.deleteMany({ user: userId });
  await Rating.deleteMany({ user: userId });
  await Test.deleteMany({ userId: userId });

  await Notification.deleteMany({ user: userId });

  await User.findByIdAndDelete(userId);

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

// TODO: Forget Password

// verifyEmail, verifyOtp, updatePasswordWithOtp
exports.verifyEmail = asyncHandler(async (req, res, _next) => {
  const { email, accountType } = req.query;
  let Model = User;
  if (accountType === constants.ROLES.PROFESSIONAL) {
    Model = Professional;
  }
  const entity = await Model.findOne({ email });
  if (!entity) {
    return sendErrorResponse(res, 404, 'NOT_FOUND', {
      message: 'এই ইমেইল এ কোন অ্যাকাউন্ট নেই',
    });
  }

  const otp = generateOTP();
  const otpExpiredAt = new Date();
  otpExpiredAt.setMinutes(otpExpiredAt.getMinutes() + 10);

  entity.otp = otp;
  entity.otpExpiredAt = otpExpiredAt.toISOString();

  const result = await sendEmail(
    entity.email,
    'OTP for reset password',
    otpVerificationEmailTemplate(entity.name, otp),
  );

  if (!result.success) {
    return sendErrorResponse(res, 400, 'BAD_REQUEST', {
      message: 'ইমেইল পাঠানো সম্ভব হয়নি।',
    });
  }

  await entity.save();
  return sendJSONresponse(res, 200, {
    data: {
      message: 'আপনার ইমেইলে অনুসন্ধান কোড পাঠানো হয়েছে।',
    },
  });
});

exports.verifyOtp = asyncHandler(async (req, res, _next) => {
  const { email, otp, accountType } = req.query;
  let Model = User;
  if (accountType === constants.ROLES.PROFESSIONAL) {
    Model = Professional;
  }
  const entity = await Model.findOne({ email });
  if (!entity) {
    return sendErrorResponse(res, 404, 'NOT_FOUND', {
      message: 'এই ইমেইল এ কোন অ্যাকাউন্ট নেই',
    });
  }
  if (toString(entity.otp) !== toString(otp)) {
    return sendErrorResponse(res, 400, 'BAD_REQUEST', {
      message: 'Invalid OTP',
    });
  }
  if (entity.otpExpiredAt < new Date()) {
    return sendErrorResponse(res, 400, 'BAD_REQUEST', {
      message: 'Invalid OTP',
    });
  }

  entity.otp = null;
  entity.otpExpiredAt = null;
  entity.canResetPassword = true;

  await entity.save();

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

exports.updatePasswordWithOtp = asyncHandler(async (req, res, _next) => {
  const { email, accountType, password } = req.body;
  let Model = User;
  if (accountType === constants.ROLES.PROFESSIONAL) {
    Model = Professional;
  }
  const entity = await Model.findOne({ email });
  if (!entity) {
    return sendErrorResponse(res, 404, 'NOT_FOUND', {
      message: 'এই ইমেইল এ কোন অ্যাকাউন্ট নেই',
    });
  }
  if (!entity.canResetPassword) {
    return sendErrorResponse(res, 400, 'BAD_REQUEST', {
      message: 'আপনি এই ইমেইল এ পুনরায় পাসওয়ার্ড পরিবর্তন করতে পারবেন না।',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  entity.password = hashedPassword;
  entity.canResetPassword = false;
  await entity.save();

  return sendJSONresponse(res, 200, {
    data: {},
  });
});
