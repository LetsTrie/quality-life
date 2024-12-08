const asyncHandler = require('../middlewares/asyncHandler');
const Professional = require('../models/prof');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const Appointment = require('../models/appointment');
const ProfAssessment = require('../models/profAssessment');

const MyClient = require('../models/myClient');

const { Notification } = require('../models');

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const Test = require('../models/test');

const { getProgress } = require('./helpers');
const {
  sendErrorResponse,
  sendJSONresponse,
  logInfo,
  logError,
} = require('../utils');
const httpStatus = require('http-status');

const { NotificationService } = require('../services');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const options = {
  viewEngine: {
    extName: '.handlebars',
    partialsDir: 'templates',
    layoutsDir: 'templates',
    defaultLayout: false,
  },
  viewPath: 'templates',
};

transporter.use('compile', hbs(options));

const sendEmailOnBoarding = async (name, emailID) => {
  const mailOptions = {
    from: '"Qlife" <motiullahsajt@gmail.com>',
    to: emailID,
    subject: 'Account Activation Confirmation',
    template: 'on-boarding',
    context: {
      fullName: name,
    },
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('error', error.message);
    }
  });
};

// PATH = /prof/all
exports.getAllProfs = asyncHandler(async (req, res, next) => {
  const profs = await Professional.find({
    isVerified: false,
    hasRejected: false,
  });
  return res.status(200).json({ success: true, profs });
});

exports.profAction = asyncHandler(async (req, res, next) => {
  // id, action
  const prof = await Professional.findById(req.body.id);
  if (req.body.action === 'pos') {
    prof.isVerified = true;
    prof.hasRejected = false;
    await sendEmailOnBoarding(prof.name, prof.email);
  } else {
    prof.isVerified = false;
    prof.hasRejected = true;
  }
  await prof.save();
  return res.json({ success: true });
});

// TODO: Need scope to update everything..
// TODO::(ADMIN_PANEL) - Handle approval of unverified or rejected users in the admin panel..
exports.registerProfessionalStep1 = asyncHandler(async (req, res, _next) => {
  const existingProfessional = await Professional.findOne({
    email: req.body.email,
  });
  if (existingProfessional) {
    if (!existingProfessional.isVerified) {
      logError('Attempt to register with an unverified email', {
        email: req.body.email,
      });
    } else if (existingProfessional.hasRejected) {
      logError('Attempt to register with a previously rejected email', {
        email: req.body.email,
      });
    }

    return sendErrorResponse(res, 400, 'BAD_REQUEST', {
      message: 'এই ইমেলটি ইতোমধ্যেই ব্যবহার করা হয়েছে',
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);
  const professional = await Professional.create(req.body);

  logInfo('Professional registration successful', { email: req.body.email });

  return sendJSONresponse(res, 201, {
    data: { id: professional._id, email: professional.email },
  });
});

// TODO: Need scope to update everything..
exports.registerProfessionalStep2 = asyncHandler(async (req, res) => {
  for (let key in req.body) {
    req.user[key] = req.body[key];
  }
  req.user.step = 2;
  await req.user.save();

  return sendJSONresponse(res, 200, {
    data: { user: req.user },
  });
});

// TODO: Need scope to update everything..
exports.registerProfessionalStep3 = asyncHandler(async (req, res) => {
  req.user.availableTime = req.body.availableTime;
  req.user.step = 3;
  await req.user.save();
  return sendJSONresponse(res, 200, {
    data: {},
  });
});

// TODO: Need scope to update everything..
exports.registerProfessionalStep4 = asyncHandler(async (req, res) => {
  for (let key in req.body) {
    req.user[key] = req.body[key];
  }
  req.user.step = 4;
  await req.user.save();

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

exports.getAllInformations = asyncHandler(async (req, res, _next) => {
  return sendJSONresponse(res, 200, {
    data: {
      prof: req.user,
    },
  });
});

exports.profLogin = asyncHandler(async (req, res, _next) => {
  const prof = await Professional.findOne({ email: req.body.email });
  if (!prof) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'ব্যবহারকারী পাওয়া যায়নি',
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, prof.password);
  if (!isMatch) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'পাসওয়ার্ড মেলেনি',
    });
  }

  if (!prof.isVerified) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'অ্যাকাউন্ট এখনও যাচাই করা হয়নি',
    });
  }

  if (prof.hasRejected) {
    return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
      message: 'আপনার অ্যাকাউন্ট বাতিল করা হয়েছে',
    });
  }

  const [accessToken, refreshToken] = await prof.generateTokens(prof._id);

  return sendJSONresponse(res, 200, {
    data: { prof, accessToken, refreshToken },
  });
});

exports.getHomepageInformationProf = asyncHandler(async (req, res, _next) => {
  const profId = req.user._id;

  const notificationCount =
    await NotificationService.getProfessionalsUnreadNotificationsCount(profId);

  const appointmentCount = await Appointment.countDocuments({
    prof: profId,
    hasProfViewed: false,
    isActive: true,
  });

  return sendJSONresponse(res, 200, {
    data: { notificationCount, appointmentCount },
  });
});

exports.myClients = asyncHandler(async (req, res, _next) => {
  const clients = await MyClient.find({
    prof: req.user._id,
    isActive: true,
  })
    .populate({ path: 'user', select: 'name location age gender isMarried' })
    .lean();

  return sendJSONresponse(res, httpStatus.OK, {
    data: {
      clients,
    },
  });
});

exports.getUserCompleteProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 404, 'NOT_FOUND', {
      message: 'User not found',
    });
  }

  const { name, age, email, gender, isMarried, location } = user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(', ');
  if (address === '') address = null;

  const response = {
    user: {
      name: name,
      age: age,
      gender: gender,
      isMarried: isMarried ? 'Married' : 'Unmarried',
      address,
      email,
    },
  };

  const [
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
    childCare,
    coronaProfile,
    domesticViolence,
    psychoticProfile,
    suicideIdeation,
  ] = await getProgress(userId, req, res, next, 'format-date');

  response.progress = {
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
    childCare,
    coronaProfile,
    domesticViolence,
    psychoticProfile,
    suicideIdeation,
  };

  return sendJSONresponse(res, httpStatus.OK, {
    data: response,
  });
});

exports.getPrimaryResultDetails = asyncHandler(async (req, res, next) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);
  if (!test) {
    return sendErrorResponse(res, 404, 'NOT_FOUND', {
      message: 'Test not found',
    });
  }

  return sendJSONresponse(res, httpStatus.OK, {
    data: {
      test,
    },
  });
});

exports.getScaleResult = asyncHandler(async (req, res, next) => {
  const { notificationId, assessmentDbId } = req.body;
  const notification = await Notification.findById(notificationId);
  if (!notification) return res.sendStatus(404);
  if (!notification.hasSeen) {
    notification.hasSeen = true;
    await notification.save();
  }

  throw new Error('Not implemented');

  return res.json({ assessment: assessmentResult });
});

exports.allProf = asyncHandler(async (req, res, next) => {
  try {
    const prof = await Professional.find({});
    return res.status(200).json(prof);
  } catch (err) {
    return res.status(400).json({ err });
  }
});

exports.deleteProfessionalAccount = asyncHandler(async (req, res, _next) => {
  const profId = req.user._id;

  const prof = await Professional.findByIdAndDelete(profId);
  if (!prof) {
    return sendErrorResponse(res, 'NOT_FOUND', {
      message: 'Professional not found',
    });
  }

  await MyClient.deleteMany({ prof: profId });
  await Appointment.deleteMany({ prof: profId });
  await ProfAssessment.deleteMany({ prof: profId });
  await Notification.deleteMany({ prof: profId });

  return sendJSONresponse(res, httpStatus.OK, { success: true });
});

exports.profVisibility = asyncHandler(async (req, res, _next) => {
  const prof = await Professional.findById(req.params.profId);
  if (!prof) {
    return sendErrorResponse(res, 'NOT_FOUND', {
      message: 'Professional not found',
    });
  }

  prof.visibility = req.body.visibility;
  await prof.save();
  return sendJSONresponse(res, httpStatus.OK, { success: true });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const professional = await Professional.findById(req.params.profId);

  for (let key in req.body) {
    professional[key] = req.body[key];
  }

  await professional.save();

  return res.status(200).json({
    success: true,
    data: { professional },
  });
});
