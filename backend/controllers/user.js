const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/user");
const moment = require("moment");
const Rating = require("../models/rating");
const ProfNotification = require("../models/profNotification");
const AssessmentResult = require("../models/profAssessmentResult");
const Test = require("../models/test");
const Error = require("../models/error");
const ProfAssessment = require("../models/profAssessment");
const UserNotification = require("../models/userNotification");
const { MODEL_NAME } = require("../models/model_name");
const { sendJSONresponse, sendErrorResponse } = require("../utils");

// TODO:
// 1) Move to utils/datetime.js
// 2) Add format(mm-dd-yyyy, dd-mm-yyyy) parameter
function getDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();
  return mm + "/" + dd + "/" + yyyy;
}

// TODO: Move to utils/datetime.js
function modifyTime(msmdate) {
  let sp = [];
  let str = "";
  for (let x of msmdate) {
    if (x === "/") {
      sp.push(str);
      str = "";
    } else str += x;
  }
  sp.push(str);
  msmdate = sp[0] + "/" + sp[1] + "/" + sp[2];
  return moment(new Date(msmdate)).format("ll");
}

// TODO: Move to test.js
// TODO: Update the Response
exports.introTestSubmit = asyncHandler(async (req, res, next) => {
  const { answers, score, fromVideo } = req.body;
  const postTest = !!req.body.postTest;

  const questionAnswers = answers.map((answer, index) => ({
    questionId: `it_${index + 1}`,
    answer,
  }));

  let date = getDate();

  const testObject = {
    questionAnswers,
    type: "introTest",
    userId: req.user._id,
    date,
    score,
    fromVideo: !!fromVideo,
    postTest,
  };

  const test = new Test(testObject);
  await test.save();

  const user = req.user;
  user.lastIntroTestDate = date;
  await user.save();

  return res.status(200).json({
    success: true,
    test,
    user,
    mDate: modifyTime(date),
  });
});

// Last updated: 22.03.2024 (Tested)
// Author: MD. Sakib Khan
exports.submitAdditionalInfo = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const allowedFields = ["name", "age", "gender", "isMarried", "location"];

  for (let field of allowedFields) {
    if (req.body[field] === undefined) {
      return res.status(400).json({
        success: true,
        message: `'${field}' is required!`,
      });
    }
  }

  for (const field in req.body) user[field] = req.body[field];
  await user.save();

  return res.status(200).json({ success: true, data: user });
});

exports.anyTestSubmit = asyncHandler(async (req, res, _next) => {
  let {
    questionAnswers,
    type,
    score,
    fromProfile,
    totalScore,
    severity,
    postTest,
  } = req.body;
  if (!postTest) postTest = false;

  const allowedTypes = [
    "manoshikShasthoMullayon",
    "manoshikObosthaJachaikoron",
    "manoshikChapNirnoy",
    "duschintaNirnoy",
    "childCare",
    "coronaProfile",
    "domesticViolence",
    "psychoticProfile",
    "suicideIdeation",
  ];

  if (!allowedTypes.includes(type)) {
    return sendErrorResponse(res, 400, "BadRequest", {
      message: `Type: ${type} is not allowed!`,
    });
  }

  const userId = req.user._id;
  const date = getDate();

  if (fromProfile) {
    if (!req.user.mentalHealthProfile) req.user.mentalHealthProfile = [];
    if (!req.user.mentalHealthProfile.includes(type)) {
      req.user.mentalHealthProfile.push(type);
      await req.user.save();
    }
  }

  const test = await Test.create({
    questionAnswers,
    type,
    userId,
    date,
    score,
    totalScore,
    severity,
    postTest,
  });

  return sendJSONresponse(res, 200, {
    data: {
      test,
      mDate: modifyTime(date),
    },
  });
});

async function getLastResult(types, req, res, next, format) {
  let msm = await Test.find({ userId: req.user._id, $or: types })
    .sort({ _id: -1 })
    .limit(1);
  msm = msm[0];
  let result = {};
  if (msm) {
    result = {
      score: parseInt(msm.score),
      date: modifyTime(msm.date),
    };
    if (format) {
      let t = moment(msm.date, "DD-MM-YYYY").format("L").toString().split("/");

      let temp = t[0];
      t[0] = t[1];
      t[1] = temp;
      t[2] = t[2][2] + t[2][3];

      result.date = t.join("/");
    }
  }
  return result;
}

async function getProgress(req, res, next, format = null) {
  let manoshikShasthoMullayon = await getLastResult(
    [{ type: "manoshikShasthoMullayon" }, { type: "introTest" }],
    req,
    res,
    next,
    format
  );

  let manoshikObosthaJachaikoron = await getLastResult(
    [{ type: "manoshikObosthaJachaikoron" }],
    req,
    res,
    next,
    format
  );
  let manoshikChapNirnoy = await getLastResult(
    [{ type: "manoshikChapNirnoy" }],
    req,
    res,
    next,
    format
  );
  let duschintaNirnoy = await getLastResult(
    [{ type: "duschintaNirnoy" }],
    req,
    res,
    next,
    format
  );
  return [
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  ];
}

exports.userHomepage = asyncHandler(async (req, res, next) => {
  const [
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  ] = await getProgress(req, res, next);

  let completeYourProfile = false;
  if (!req.user.age) completeYourProfile = true;

  return res.status(200).json({
    completeYourProfile,
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  });
});

exports.getProfileDetails = asyncHandler(async (req, res, next) => {
  const { name, age, gender, isMarried, location, email } = req.user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(", ");
  if (address === "") address = null;
  const user = {
    name: name,
    age: age,
    gender: gender,
    isMarried: isMarried ? "Married" : "Unmarried",
    address,
    email,
  };

  const [
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  ] = await getProgress(req, res, next, "format-date");

  return res.json({
    user,
    progress: {
      manoshikShasthoMullayon,
      manoshikObosthaJachaikoron,
      manoshikChapNirnoy,
      duschintaNirnoy,
    },
  });
});

exports.getAllInformation = asyncHandler(async (req, res, next) => {
  const { name, age, gender, isMarried, location, email } = req.user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(", ");
  if (address === "") address = null;
  const user = {
    name,
    age,
    gender,
    isMarried: isMarried ? "Married" : "Unmarried",
    address,
    email,
  };
  user.mentalHealthProfile = req.user.mentalHealthProfile ?? [];
  user.isProfileCompleted = true;
  for (let key in user) if (!user[key]) user.isProfileCompleted = false;
  if ([...new Set(user.mentalHealthProfile)].length !== 5) {
    user.isProfileCompleted = false;
  }

  const [
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  ] = await getProgress(req, res, next);
  user.msm_score = manoshikShasthoMullayon.score ?? null;
  user.msm_date = manoshikShasthoMullayon.date ?? null;
  user.moj_score = manoshikObosthaJachaikoron.score ?? null;
  user.moj_date = manoshikObosthaJachaikoron.date ?? null;
  user.mcn_score = manoshikChapNirnoy.score ?? null;
  user.mcn_date = manoshikChapNirnoy.date ?? null;
  user.dn_score = duschintaNirnoy.score ?? null;
  user.dn_date = duschintaNirnoy.date ?? null;
  user.shownVideo = req.user.shownVideo ?? [];

  return sendJSONresponse(res, 200, {
    data: {
      user,
    },
  });
});

exports.submitAVideo = asyncHandler(async (req, res) => {
  const { videoUrl } = req.params;

  if (!videoUrl) {
    return sendErrorResponse(res, 400, "BadRequest", {
      message: "Video URL is required.",
    });
  }

  if (!Array.isArray(req.user.shownVideo)) {
    req.user.shownVideo = [];
  }

  if (!req.user.shownVideo.includes(videoUrl)) {
    req.user.shownVideo.push(videoUrl);
    await req.user.save();
  }

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

exports.rating = asyncHandler(async (req, res, _next) => {
  const userId = req.user._id;
  const { rating, comment, videoUrl } = req.body;

  const userRating = new Rating({ userId, rating, comment, videoUrl });
  await userRating.save();

  return res.json({ rating: userRating });
});

exports.updateProfile = asyncHandler(async (req, res, _next) => {
  const user = req.user;
  console.log(user);
  for (let r in req.body) user[r] = req.body[r];
  await user.save();

  const { name, age, gender, isMarried, location } = req.user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(", ");
  if (address === "") address = null;
  const cUser = {
    name,
    age,
    gender,
    isMarried: isMarried ? "Married" : "Unmarried",
    address,
  };
  return res.status(200).json({ success: true, user: cUser });
});

const LIMIT = 5;

exports.getNumberOfNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const profAssessment = await ProfAssessment.find({
    user: userId,
    hasSeen: false,
  }).countDocuments();
  const userNotification = await UserNotification.find({
    user: userId,
    hasSeen: false,
  }).countDocuments();
  return res.status(200).json({
    totalNotificationCount: userNotification + profAssessment,
  });
});

exports.unreadNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const unreadNotifications = [];
  const profAssessments = await ProfAssessment.find({
    user: userId,
    hasSeen: false,
  }).populate([
    {
      path: MODEL_NAME.USER,
      select: "name",
    },
    {
      path: "prof",
      select: "name",
    },
  ]);
  profAssessments.map((p) => {
    unreadNotifications.push({
      type: "ASSESSMENT",
      userId: p.user._id,
      username: p.user.name,
      profId: p.prof._id,
      profname: p.prof.name,
      extraId: p.assessmentId,
    });
  });

  const userNotification = await UserNotification.find({
    user: userId,
    hasSeen: false,
  }).populate([
    {
      path: MODEL_NAME.USER,
      select: "name",
    },
    {
      path: "prof",
      select: "name",
    },
  ]);
  userNotification.map((p) => {
    unreadNotifications.push({
      type: p.type,
      userId: p.user._id,
      username: p.user.name,
      profId: p.prof._id,
      profname: p.prof.name,
    });
  });

  return res.json({ userNotification });
});

exports.profSuggestedScales = asyncHandler(async (req, res, next) => {
  return res.json({ scales: req.user.suggestedScale });
});

exports.numberOfNotifications = asyncHandler(async (req, res, next) => {
  const unreadNotifications = await UserNotification.countDocuments({
    user: req.user._id,
    hasSeen: false,
  });

  return res.json({
    nNotifications: unreadNotifications,
  });
});

exports.userNotifications = asyncHandler(async (req, res, next) => {
  const page = +req.query.page || 1;

  let numberOfNotifications;

  if (page === 1) {
    numberOfNotifications = await UserNotification.countDocuments({
      user: req.user._id,
    });
  }

  const notifications = await UserNotification.find({
    user: req.user._id,
  })
    .sort({ _id: -1 })
    .populate({
      path: "prof",
      select: "name",
    })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT);

  return res.json({ notifications, numberOfNotifications });
});

// Appointment Status
// prof list theke ei page redirect korbe... 3 type er status

let days = [
  {
    label: "Sunday",
    id: 0,
    genId: 3,
    value: "রবিবার",
  },
  {
    label: "Monday",
    value: "সোমবার",
    id: 1,
    genId: 4,
  },
  {
    label: "Tuesday",
    value: "মঙ্গলবার",
    id: 2,
    genId: 5,
  },
  {
    label: "Wednesday",
    value: "বুধবার",
    id: 3,
    genId: 6,
  },
  {
    label: "Thursday",
    value: "বৃহস্পতিবার",
    id: 4,
    genId: 7,
  },
  {
    label: "Friday",
    value: "শুক্রবার",
    id: 5,
    genId: 1,
  },
  {
    label: "Saturday",
    value: "শনিবার",
    id: 6,
    genId: 2,
  },
];

exports.seenNotification = asyncHandler(async (req, res, next) => {
  const { notification_id } = req.body;
  const notification = await UserNotification.findById(notification_id);
  if (!notification) return res.sendStatus(404);
  notification.hasSeen = true;
  await notification.save();
  return res.sendStatus(200);
});

exports.checkSuggestedScale = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { profId, questionId } = req.body;

  const assessmentResult = await AssessmentResult.findOne({
    user: userId,
    prof: profId,
    assessmentId: questionId,
  });

  if (assessmentResult) return res.json({ found: true });
  return res.json({ found: false });
});

exports.submitProfScale = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const {
    profId,
    notificationId,
    appointmentId,
    questionId,
    totalWeight,
    stage,
    maxWeight,
    answers,
  } = req.body;

  // Seen user notification
  if (notificationId) {
    const notification = await UserNotification.findById(notificationId);
    notification.hasSeen = true;
    if (!notification) return res.sendStatus(404);
    await notification.save();
  } else if (appointmentId) {
    const notification = await UserNotification.findOne({
      "associateID.appointmentId": appointmentId,
    });
    notification.hasSeen = true;
    await notification.save();
  }

  // save assessment result
  const assessmentResult = await AssessmentResult.create({
    user: userId,
    prof: profId,
    assessmentId: questionId,
    notificationId,
    totalWeight,
    stage,
    maxWeight,
    answers,
  });

  // Send prof notification
  await ProfNotification.create({
    user: userId,
    prof: profId,
    type: "SCALE_FILL_UP",
    associateID: {
      assessmentId: questionId,
      assessmentResultId: assessmentResult._id,
    },
  });

  return res.json({ success: true });
});

exports.resultHistoryTableData = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { testType } = req.params;
  const tests = await Test.find({
    type: testType,
    userId,
  })
    .sort({ _id: -1 })
    .limit(10);

  return res.json({ tests });
});

exports.allUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).json({ err });
  }
});

exports.userDelete = asyncHandler(async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.body._id);
    return res.status(200).json("success");
  } catch (err) {
    return res.status(400).json({ err });
  }
});

exports.userInfo = asyncHandler(async (req, res, next) => {
  try {
    const tests = await Test.find({ userId: req.body._id });
    const user = await User.findById(req.body._id);
    return res.status(200).json({ user, tests });
  } catch (err) {
    return res.status(400).json({ err });
  }
});

exports.error = asyncHandler(async (req, res, next) => {
  try {
    const data = req.body.error;
    const error = new Error({ data });
    await error.save();
  } catch (err) {
    return res.status(400).json({ err });
  }
});
