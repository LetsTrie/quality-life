const asyncHandler = require("../middlewares/asyncHandler");
const Professional = require("../models/prof");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Appointment = require("../models/appointment");
const ProfAssessment = require("../models/profAssessment");
const RecentlyContacted = require("../models/recentlyContacted");
const AppointmentMeta = require("../models/appointmentMeta");

const MyClient = require("../models/myClient");
const ProfNotification = require("../models/profNotification");
const UserNotification = require("../models/userNotification");

const AssessmentResult = require("../models/profAssessmentResult");
const VerificationCode = require("../models/verificationCode");
const ClinicalActL30 = require("../models/clinicalActL30");
const PDAL30_1_1 = require("../models/pDAL30_1_1");
const Supervision = require("../models/supervision");
const SeminarWorkshop = require("../models/seminarWorkshop");
const Conference = require("../models/conference");
const OtherPAL30 = require("../models/otherPAL30");
const Research = require("../models/research");
const SystemicCL = require("../models/systemicCL");
const PsychodramaDoc = require("../models/psychodramaDoc");

const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const logger = require("../config/winston");
const Test = require("../models/test");
const LIMIT = 10;

const { getProgress } = require("./helpers");
const {
  sendErrorResponse,
  sendJSONresponse,
  logInfo,
  logWarn,
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

// OKAY
exports.getUnreadNotifications = asyncHandler(async (req, res, next) => {
  const profId = req.user._id;
  const page = +req.query.page || 1;

  let numberOfNotifications;

  if (page === 1) {
    numberOfNotifications = await ProfNotification.countDocuments({
      prof: profId,
    });
  }

  const notifications = await ProfNotification.find({
    prof: profId,
  })
    .sort({ _id: -1 })
    .populate({
      path: "user",
      select: "name",
    })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT);

  return res.json({ notifications, numberOfNotifications });
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

exports.recentlyContactedClients = asyncHandler(async (req, res, next) => {
  const profId = req.user._id;
  let contacts = await RecentlyContacted.find({
    prof: profId,
  }).populate({
    path: "user",
    select: "name age isMarried location",
  });
  let mContacts = [];

  for (let i = 0; i < contacts.length; i++) {
    c = contacts[i];
    const userObject = {
      _id: c._id,
      userId: c.user._id,
      profId,
      name: c.user.name,
      status: `${c.user.isMarried ? "বিবাহিত" : "অবিবাহিত"}, বয়স - ${
        c.user.age
      }`,
      location: [
        c.user.location.union,
        c.user.location.upazila,
        c.user.location.zila,
      ]
        .filter(Boolean)
        .join(", "),
    };
    mContacts.push(userObject);
  }

  return res.json({ contacts: mContacts });
});

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

  await RecentlyContacted.findByIdAndDelete(req.body.recContactedPersonId);
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
  const { profId } = req.params;

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

//// handling table data

//ClinicalActL30

exports.getClinicalActL30 = async (req, res, next) => {
  try {
    const clinicalActL30 = await ClinicalActL30.find({
      userId: req.body.userId,
    });
    return res.status(200).json({ success: true, clinicalActL30 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createClinicalActL30 = async (req, res, next) => {
  try {
    const clinicalActL30 = new ClinicalActL30(req.body);
    await clinicalActL30.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delClinicalActL30 = async (req, res, next) => {
  try {
    await ClinicalActL30.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateClinicalActL30 = async (req, res, next) => {
  try {
    const clinicalActL30Up = await ClinicalActL30.findById(req.body._id);
    for (let r in req.body) clinicalActL30Up[r] = req.body[r];
    await clinicalActL30Up.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

// PDAL30_1_1

exports.getPDAL30_1_1 = async (req, res, next) => {
  try {
    const pDAL30_1_1 = await PDAL30_1_1.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, pDAL30_1_1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createPDAL30_1_1 = async (req, res, next) => {
  try {
    const pDAL30_1_1 = new PDAL30_1_1(req.body);
    await pDAL30_1_1.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delPDAL30_1_1 = async (req, res, next) => {
  try {
    await PDAL30_1_1.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updatePDAL30_1_1 = async (req, res, next) => {
  try {
    const pDAL30_1_1Up = await PDAL30_1_1.findById(req.body._id);
    for (let r in req.body) pDAL30_1_1Up[r] = req.body[r];
    await pDAL30_1_1Up.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//Supervision

exports.getSupervision = async (req, res, next) => {
  try {
    const supervision = await Supervision.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, supervision });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createSupervision = async (req, res, next) => {
  try {
    const supervision = new Supervision(req.body);
    await supervision.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delSupervision = async (req, res, next) => {
  try {
    await Supervision.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateSupervision = async (req, res, next) => {
  try {
    const supervisionUp = await Supervision.findById(req.body._id);
    for (let r in req.body) supervisionUp[r] = req.body[r];
    await supervisionUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//SeminarWorkshop
exports.getSeminarWorkshop = async (req, res, next) => {
  try {
    const seminarWorkshop = await SeminarWorkshop.find({
      userId: req.body.userId,
    });
    return res.status(200).json({ success: true, seminarWorkshop });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createSeminarWorkshop = async (req, res, next) => {
  try {
    const seminarWorkshop = new SeminarWorkshop(req.body);
    await seminarWorkshop.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delSeminarWorkshop = async (req, res, next) => {
  try {
    await SeminarWorkshop.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateSeminarWorkshop = async (req, res, next) => {
  try {
    const seminarWorkshopUp = await SeminarWorkshop.findById(req.body._id);
    for (let r in req.body) seminarWorkshopUp[r] = req.body[r];
    await seminarWorkshopUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

// Conference
exports.getConference = async (req, res, next) => {
  try {
    const conference = await Conference.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, conference });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createConference = async (req, res, next) => {
  try {
    const conference = new Conference(req.body);
    await conference.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delConference = async (req, res, next) => {
  try {
    await Conference.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateConference = async (req, res, next) => {
  try {
    const conferenceUp = await Conference.findById(req.body._id);
    for (let r in req.body) conferenceUp[r] = req.body[r];
    await conferenceUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

// Research
exports.getResearch = async (req, res, next) => {
  try {
    const research = await Research.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, research });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createResearch = async (req, res, next) => {
  try {
    const research = new Research(req.body);
    await research.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delResearch = async (req, res, next) => {
  try {
    await Research.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateResearch = async (req, res, next) => {
  try {
    const researchUp = await Research.findById(req.body._id);
    for (let r in req.body) researchUp[r] = req.body[r];
    await researchUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//OtherPAL30
exports.getOtherPAL30 = async (req, res, next) => {
  try {
    const otherPAL30 = await OtherPAL30.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, otherPAL30 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createOtherPAL30 = async (req, res, next) => {
  try {
    const otherPAL30 = new OtherPAL30(req.body);
    await otherPAL30.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delOtherPAL30 = async (req, res, next) => {
  try {
    await OtherPAL30.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateOtherPAL30 = async (req, res, next) => {
  try {
    const otherPAL30Up = await OtherPAL30.findById(req.body._id);
    for (let r in req.body) otherPAL30Up[r] = req.body[r];
    await otherPAL30Up.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//SystemicCL
exports.getSystemicCL = async (req, res, next) => {
  try {
    const systemicCL = await SystemicCL.find({ userId: req.body.userId });
    return res.status(200).json({ success: true, systemicCL });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createSystemicCL = async (req, res, next) => {
  try {
    const systemicCL = new SystemicCL(req.body);
    await systemicCL.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delSystemicCL = async (req, res, next) => {
  try {
    await SystemicCL.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updateSystemicCL = async (req, res, next) => {
  try {
    const systemicCLUp = await SystemicCL.findById(req.body._id);
    for (let r in req.body) systemicCLUp[r] = req.body[r];
    await systemicCLUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//PsychodramaDoc
exports.getPsychodramaDoc = async (req, res, next) => {
  try {
    const psychodramaDoc = await PsychodramaDoc.find({
      userId: req.body.userId,
    });
    return res.status(200).json({ success: true, psychodramaDoc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

exports.createPsychodramaDoc = async (req, res, next) => {
  try {
    const psychodramaDoc = new PsychodramaDoc(req.body);
    await psychodramaDoc.save();
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

exports.delPsychodramaDoc = async (req, res, next) => {
  try {
    await PsychodramaDoc.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.updatePsychodramaDoc = async (req, res, next) => {
  try {
    const psychodramaDocUp = await PsychodramaDoc.findById(req.body._id);
    for (let r in req.body) psychodramaDocUp[r] = req.body[r];
    await psychodramaDocUp.save();

    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
};

//testing heroku
