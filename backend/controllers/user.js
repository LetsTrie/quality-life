const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/user');
const moment = require('moment');
const Rating = require('../models/rating');
const Test = require('../models/test');
const ProfAssessment = require('../models/profAssessment');
const { MODEL_NAME } = require('../models/model_name');
const { sendJSONresponse, sendErrorResponse } = require('../utils');

const { Notification } = require('../models');
const { NotificationService } = require('../services');

// TODO:
// 1) Move to utils/datetime.js
// 2) Add format(mm-dd-yyyy, dd-mm-yyyy) parameter
function getDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  return mm + '/' + dd + '/' + yyyy;
}

// TODO: Move to utils/datetime.js
function modifyTime(msmdate) {
  let sp = [];
  let str = '';
  for (let x of msmdate) {
    if (x === '/') {
      sp.push(str);
      str = '';
    } else str += x;
  }
  sp.push(str);
  msmdate = sp[0] + '/' + sp[1] + '/' + sp[2];
  return moment(new Date(msmdate)).format('ll');
}

exports.submitAdditionalInfo = asyncHandler(async (req, res, _next) => {
  for (const field in req.body) req.user[field] = req.body[field];
  await req.user.save();

  return sendJSONresponse(res, 200, {
    data: {},
  });
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
    'manoshikShasthoMullayon',
    'manoshikObosthaJachaikoron',
    'manoshikChapNirnoy',
    'duschintaNirnoy',
    'childCare',
    'coronaProfile',
    'domesticViolence',
    'psychoticProfile',
    'suicideIdeation',
  ];

  if (!allowedTypes.includes(type)) {
    return sendErrorResponse(res, 400, 'BadRequest', {
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
      let t = moment(msm.date, 'DD-MM-YYYY').format('L').toString().split('/');

      let temp = t[0];
      t[0] = t[1];
      t[1] = temp;
      t[2] = t[2][2] + t[2][3];

      result.date = t.join('/');
    }
  }
  return result;
}

async function getProgress(req, res, next, format = null) {
  let manoshikShasthoMullayon = await getLastResult(
    [{ type: 'manoshikShasthoMullayon' }],
    req,
    res,
    next,
    format,
  );

  let manoshikObosthaJachaikoron = await getLastResult(
    [{ type: 'manoshikObosthaJachaikoron' }],
    req,
    res,
    next,
    format,
  );
  let manoshikChapNirnoy = await getLastResult(
    [{ type: 'manoshikChapNirnoy' }],
    req,
    res,
    next,
    format,
  );
  let duschintaNirnoy = await getLastResult(
    [{ type: 'duschintaNirnoy' }],
    req,
    res,
    next,
    format,
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
  let address = [union, upazila, zila].filter(Boolean).join(', ');
  if (address === '') address = null;
  const user = {
    name: name,
    age: age,
    gender: gender,
    isMarried: isMarried ? 'Married' : 'Unmarried',
    address,
    email,
  };

  const [
    manoshikShasthoMullayon,
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
  ] = await getProgress(req, res, next, 'format-date');

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

exports.getAllInformations = asyncHandler(async (req, res, next) => {
  const { name, age, gender, isMarried, location, email } = req.user;
  const { union, zila, upazila } = location;
  let address = [union, upazila, zila].filter(Boolean).join(', ');
  if (address === '') address = null;
  const user = {
    name,
    age,
    gender,
    isMarried: isMarried ? 'Married' : 'Unmarried',
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
    return sendErrorResponse(res, 400, 'BadRequest', {
      message: 'Video URL is required.',
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
  await Rating.create({
    user: req.user._id,
    rating: req.body.rating,
    contentId: req.body.contentId,
    comment: req.body.comment,
    videoUrl: req.body.videoUrl,
  });

  return sendJSONresponse(res, 200, {
    data: {},
  });
});

exports.updateProfile = asyncHandler(async (req, res, _next) => {
  const user = req.user;
  for (let r in req.body) user[r] = req.body[r];
  await user.save();

  const { name, age, gender, isMarried, location } = req.user;
  const { union, zila, upazila } = location;

  let address = [union, upazila, zila].filter(Boolean).join(', ');
  if (address === '') address = null;

  const cUser = {
    name,
    age,
    gender,
    isMarried: isMarried ? 'Married' : 'Unmarried',
    address,
  };

  return sendJSONresponse(res, 200, {
    data: {
      user: cUser,
    },
  });
});

const LIMIT = 5;

exports.getNumberOfNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const profAssessment = await ProfAssessment.find({
    user: userId,
    hasSeen: false,
  }).countDocuments();

  const notificationCount = await Notification.find({
    user: userId,
    hasSeen: false,
  }).countDocuments();

  return res.status(200).json({
    totalNotificationCount: notificationCount + profAssessment,
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
      select: 'name',
    },
    {
      path: 'prof',
      select: 'name',
    },
  ]);
  profAssessments.map(p => {
    unreadNotifications.push({
      type: 'ASSESSMENT',
      userId: p.user._id,
      username: p.user.name,
      profId: p.prof._id,
      profname: p.prof.name,
      extraId: p.assessmentId,
    });
  });

  const userNotification = await Notification.find({
    user: userId,
    hasSeen: false,
  }).populate([
    {
      path: 'user',
      select: 'name',
    },
    {
      path: 'prof',
      select: 'name',
    },
  ]);

  userNotification.map(p => {
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

exports.userNotifications = asyncHandler(async (req, res, next) => {
  const page = +req.query.page || 1;

  let numberOfNotifications;

  if (page === 1) {
    numberOfNotifications = await Notification.countDocuments({
      user: req.user._id,
    });
  }

  const notifications = await Notification.find({
    user: req.user._id,
  })
    .sort({ _id: -1 })
    .populate({
      path: 'prof',
      select: 'name',
    })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT);

  return res.json({ notifications, numberOfNotifications });
});

// Appointment Status
// prof list theke ei page redirect korbe... 3 type er status

exports.checkSuggestedScale = asyncHandler(async (req, res, _next) => {
  const { assessmentId } = req.params;

  const assessment = await ProfAssessment.findById(assessmentId);
  if (!assessment) {
    return sendErrorResponse(res, 404, 'NotFound', {
      message: 'Assessment not found',
    });
  }

  if (assessment.hasCompleted) {
    return sendErrorResponse(res, 400, 'BadRequest', {
      message: 'Assessment has been completed',
    });
  }

  await NotificationService.seenAssessmentNotification(assessmentId);

  return sendJSONresponse(res, 200, {
    data: { assessment },
  });
});

exports.submitProfScale = asyncHandler(async (req, res, _next) => {
  const { assessmentId, totalWeight, stage, maxWeight, questionAnswers } =
    req.body;

  const assessment = await ProfAssessment.findByIdAndUpdate(
    assessmentId,
    {
      hasCompleted: true,
      completedAt: new Date(),
      totalWeight,
      stage,
      maxWeight,
      questionAnswers,
    },
    { new: true },
  );

  if (!assessment) {
    return sendErrorResponse(res, 404, 'NotFound', {
      message: 'Assessment not found',
    });
  }

  await NotificationService.removeAssessmentSuggestionNotification(
    assessmentId,
  );

  await NotificationService.scaleSubmittedByUser(
    req.user._id,
    assessment.prof,
    assessment._id,
  );

  return sendJSONresponse(res, 200, {
    data: {
      assessment,
    },
  });
});

exports.resultHistoryTableData = asyncHandler(async (req, res, _next) => {
  const tests = await Test.find({
    type: req.params.testType,
    userId: req.user._id,
  })
    .sort({ _id: -1 })
    .limit(10);

  return sendJSONresponse(res, 200, {
    data: {
      tests,
    },
  });
});

exports.allUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
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
