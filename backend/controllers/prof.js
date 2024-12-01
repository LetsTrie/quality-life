const asyncHandler = require("../middlewares/asyncHandler");
const Professional = require("../models/prof");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Appointment = require("../models/appointment");
const ProfAssessment = require("../models/profAssessment");
const AppointmentMeta = require("../models/appointmentMeta");

const MyClient = require("../models/myClient");
const ProfNotification = require("../models/profNotification");
const UserNotification = require("../models/userNotification");

const AssessmentResult = require("../models/profAssessmentResult");
const VerificationCode = require("../models/verificationCode");

const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const Test = require("../models/test");

const LIMIT = 10;

const { getProgress } = require("./helpers");
const {
  sendErrorResponse,
  sendJSONresponse,
  logInfo,
  logError,
} = require("../utils");
const httpStatus = require("http-status");

const { constants } = require("../utils/constants");

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
    extName: ".handlebars",
    partialsDir: "templates",
    layoutsDir: "templates",
    defaultLayout: false,
  },
  viewPath: "templates",
};

transporter.use("compile", hbs(options));

const sendEmailOnBoarding = async (name, emailID) => {
  const mailOptions = {
    from: '"Qlife" <motiullahsajt@gmail.com>',
    to: emailID,
    subject: "Account Activation Confirmation",
    template: "on-boarding",
    context: {
      fullName: name,
    },
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error.message);
    }
  });
};

const sendVerificationCode = async (code, emailID) => {
  const mailOptions = {
    from: '"Qlife" <motiullahsajt@gmail.com>',
    to: emailID,
    subject: "Account Verification Code",
    template: "verification-code",
    context: {
      code: code,
    },
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error.message);
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
  if (req.body.action === "pos") {
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
      logError("Attempt to register with an unverified email", {
        email: req.body.email,
      });
    } else if (existingProfessional.hasRejected) {
      logError("Attempt to register with a previously rejected email", {
        email: req.body.email,
      });
    }

    return sendErrorResponse(res, 400, "BAD_REQUEST", {
      message: "এই ইমেলটি ইতোমধ্যেই ব্যবহার করা হয়েছে",
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);
  const professional = await Professional.create(req.body);

  logInfo("Professional registration successful", { email: req.body.email });

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
    return sendErrorResponse(res, 401, "UNAUTHORIZED", {
      message: "ব্যবহারকারী পাওয়া যায়নি",
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, prof.password);
  if (!isMatch) {
    return sendErrorResponse(res, 401, "UNAUTHORIZED", {
      message: "পাসওয়ার্ড মেলেনি",
    });
  }

  if (!prof.isVerified) {
    return sendErrorResponse(res, 401, "UNAUTHORIZED", {
      message: "অ্যাকাউন্ট এখনও যাচাই করা হয়নি",
    });
  }

  if (prof.hasRejected) {
    return sendErrorResponse(res, 401, "UNAUTHORIZED", {
      message: "আপনার অ্যাকাউন্ট বাতিল করা হয়েছে",
    });
  }

  const [accessToken, refreshToken] = await prof.generateTokens(prof._id);

  return sendJSONresponse(res, 200, {
    data: { prof, accessToken, refreshToken },
  });
});

exports.getHomepageInformationProf = asyncHandler(async (req, res, _next) => {
  const profId = req.user._id;

  const notificationCount = await ProfNotification.countDocuments({
    prof: profId,
    hasSeen: false,
  });

  const appointmentCount = await Appointment.countDocuments({
    prof: profId,
    hasProfViewed: false,
    isActive: true,
  });

  return sendJSONresponse(res, 200, {
    data: { notificationCount, appointmentCount },
  });
});

const countDocuments = async (model, query) => {
  try {
    return await model.countDocuments(query);
  } catch (error) {
    throw new Error(`Error counting documents: ${error.message}`);
  }
};

exports.getProfUnreadNotifications = asyncHandler(async (req, res, _next) => {
  const { _id: profId } = req.user;
  const page = parseInt(req.query.page, 10) || 1;

  const countPromise =
    page === 1
      ? countDocuments(ProfNotification, { prof: profId })
      : Promise.resolve(undefined);

  const notificationsPromise = ProfNotification.find({
    prof: profId,
  })
    .sort({ _id: -1 })
    .populate({
      path: "user",
      select: "name",
    })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT)
    .lean();

  const [numberOfNotifications, notifications] = await Promise.all([
    countPromise,
    notificationsPromise,
  ]);

  return sendJSONresponse(res, 200, {
    data: { notifications, numberOfNotifications },
  });
});

// OKAY
exports.seenNotification = asyncHandler(async (req, res, next) => {
  const prof = req.user._id;
  const { notificationId, user } = req.body;
  const notification = await ProfNotification.findById(notificationId);
  if (!notification) return res.sendStatus(404);
  if (!notification.hasSeen) {
    notification.hasSeen = true;
    await notification.save();
  }

  const app = (
    await Appointment.find({ user, prof }).sort({ _id: -1 }).limit(1).populate({
      path: "user",
      select: "name age isMarried location email",
    })
  )[0];
  if (!app) return res.sendStatus(404);
  if (!app.hasProfViewed) {
    app.hasProfViewed = true;
    app.profViewedAt = new Date();
    await app.save();
  }
  return res.json({ requestInformation: modifyAppointmentData(app) });
});

// OKAY
function modifyAppointmentData(appointment) {
  console.log(appointment);
  return {
    _id: appointment._id,
    appointmentId: appointment._id,
    userId: appointment.user._id,
    profId: appointment.prof,
    userName: appointment.user.name,
    userStatus: `${
      appointment.user.isMarried ? "বিবাহিত" : "অবিবাহিত"
    }, বয়স - ${appointment.user.age}`,
    userLocation: [
      appointment.user.location.union,
      appointment.user.location.upazila,
      appointment.user.location.zila,
    ]
      .filter(Boolean)
      .join(", "),
    userEmail: appointment.user.email,
    hasProfViewed: appointment.hasProfViewed,
    hasProfRespondedToClient: appointment.hasProfRespondedToClient,
    permissionToSeeProfile: appointment.permissionToSeeProfile,
    proposedAppointmentDate: appointment.dateByClient,
  };
}

const makeClientObject = (c) => ({
  _id: c._id,
  profId: c.prof,
  clientIdByProf: c.clientId,
  userId: c.user._id,
  userName: c.user.name,
  userLocation: [
    c.user.location.union,
    c.user.location.upazila,
    c.user.location.zila,
  ]
    .filter(Boolean)
    .join(", "),
});

exports.AddasClient = asyncHandler(async (req, res, next) => {
  // user, prof, clientId, recContactedPersonId
  const profId = req.user._id;
  const idExists = await MyClient.findOne({ clientId: req.body.clientId });
  if (idExists) {
    return res.status(400).json({
      message: "Client ID is already taken",
    });
  }
  const clientExists = await MyClient.findOne({
    user: req.body.user,
    prof: profId,
  });
  if (clientExists) {
    return res.status(400).json({
      message: "Client already exists",
    });
  }

  await UserNotification.deleteOne({
    user: req.body.user,
    prof: profId,
    type: "APPOINTMENT_ACCEPTED",
  });

  const client = await MyClient.create({
    user: req.body.user,
    prof: profId,
    clientId: req.body.clientId,
  });

  const meta = await AppointmentMeta.findOne({
    user: req.body.user,
    prof: profId,
  });
  meta.stage = "IS_A_CLIENT";
  await meta.save();

  await UserNotification.create({
    user: req.body.user,
    prof: profId,
    type: "ADDED_AS_CLIENT",
    someId: {
      appointmentId: meta.appointmentId,
    },
  });
  let clientDetails = await MyClient.findOne({
    user: req.body.user,
    prof: profId,
    isActive: true,
    clientId: req.body.clientId,
  }).populate({
    path: "user",
    select: "name location",
  });

  return res.status(201).json({ client: makeClientObject(clientDetails) });
});

exports.myClients = asyncHandler(async (req, res, _next) => {
  const clients = await MyClient.find({
    prof: req.user._id,
    isActive: true,
  })
    .populate({ path: "user", select: "name location" })
    .lean();

  return sendJSONresponse(res, httpStatus.OK, {
    data: {
      clients,
    },
  });
});

exports.suggestAscale = asyncHandler(async (req, res, _next) => {
  const profId = req.user._id;
  const { userId, assessmentSlug } = req.body;

  if (!userId || !assessmentSlug) {
    return sendErrorResponse(res, 400, "BAD_REQUEST", {
      message: "Invalid request",
    });
  }

  const assessment = await ProfAssessment.create({
    user: userId,
    prof: profId,
    assessmentSlug,
  });

  await UserNotification.create({
    user: userId,
    prof: profId,
    type: constants.SUGGEST_A_SCALE,
    assessmentId: assessment._id,
  });

  return sendJSONresponse(res, httpStatus.OK, {
    data: {},
  });
});

exports.getUserCompleteProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 404, "NOT_FOUND", {
      message: "User not found",
    });
  }

  const { name, age, email, gender, isMarried, location } = user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(", ");
  if (address === "") address = null;

  const response = {
    user: {
      name: name,
      age: age,
      gender: gender,
      isMarried: isMarried ? "Married" : "Unmarried",
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
  ] = await getProgress(userId, req, res, next, "format-date");

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

exports.getCompleteTestResult = asyncHandler(async (req, res, next) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);
  return res.json({ result: test.questionAnswers.map((t) => t.answer), test });
});

exports.getScaleResult = asyncHandler(async (req, res, next) => {
  const { notificationId, assessmentDbId } = req.body;
  const notification = await ProfNotification.findById(notificationId);
  if (!notification) return res.sendStatus(404);
  if (!notification.hasSeen) {
    notification.hasSeen = true;
    await notification.save();
  }

  const assessmentResult = await AssessmentResult.findById(
    assessmentDbId
  ).populate("user", "_id name");
  if (!assessmentResult) return res.sendStatus(404);

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
    return sendErrorResponse(res, "NOT_FOUND", {
      message: "Professional not found",
    });
  }

  await MyClient.deleteMany({ prof: profId });

  await Appointment.deleteMany({ prof: profId });
  await AppointmentMeta.deleteMany({ prof: profId });

  await ProfAssessment.deleteMany({ prof: profId });
  await AssessmentResult.deleteMany({ prof: profId });

  await UserNotification.deleteMany({ prof: profId });
  await ProfNotification.deleteMany({ prof: profId });

  return sendJSONresponse(res, httpStatus.OK, { success: true });
});

exports.profVisibility = asyncHandler(async (req, res, _next) => {
  const prof = await Professional.findById(req.params.profId);
  if (!prof) {
    return sendErrorResponse(res, "NOT_FOUND", {
      message: "Professional not found",
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

exports.getVerificationCode = async (req, res) => {
  const prof = await Professional.findOne({ email: req.body.email });
  try {
    if (prof) {
      const code = Math.round(Math.random() * 100000 + 1);
      const verificationCode = new VerificationCode({
        email: req.body.email,
        code: code,
      });
      await verificationCode.save();
      await sendVerificationCode(verificationCode.code, verificationCode.email);
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ message: "Accout not found" });
    }
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const verificationCode = await VerificationCode.findOne({
      code: req.body.verificationCode,
      email: req.body.email,
    });
    if (verificationCode && verificationCode.isVerified === true) {
      verificationCode.isVerified = false;
      await verificationCode.save();
      const prof = await Professional.findOne({ email: req.body.email });
      prof.password = await bcrypt.hash(req.body.newPassword, 10);
      await prof.save();
      const [accessToken, refreshToken] = await prof.generateTokens(prof._id);
      return res
        .status(200)
        .json({ success: true, data: { prof, accessToken, refreshToken } });
    }
    if (verificationCode.isVerified === false) {
      return res
        .status(401)
        .json({ message: "Verification Code already used." });
    }
  } catch (err) {
    return res.status(400).json({ err });
  }
};
