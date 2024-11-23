const httpStatus = require("http-status");
const {
  Professional,
  Appointment,
  ProfessionalsClient,
  ProfessionalsNotification,
  ProfessionalsAssessment,
  UsersNotification,
} = require("../models");

const {
  asyncHandler,
  sendJSONresponse,
  sendErrorResponse,
  constants,
} = require("../utils");

// GET /user/professionals
exports.findProfessionals = asyncHandler(async (req, res, _next) => {
  const user = req.user._id;
  const page = +req.query.page || 1;

  const response = {};

  if (page === 1) {
    response.professionalsCount = await Professional.countDocuments({
      isVerified: true,
      hasRejected: false,
      visibility: true,
      step: 4,
    }).lean();

    response.appointmentsTaken = await Appointment.find({
      user,
      isActive: true,
    }).lean();

    response.isClient = await ProfessionalsClient.find({
      user,
      isActive: true,
    }).lean();
  }

  const LIMIT = 5;
  response.professionals = await Professional.find({
    isVerified: true,
    hasRejected: false,
    visibility: true,
  })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT)
    .lean();

  return sendJSONresponse(res, 200, { data: response });
});

exports.takeAppointment = asyncHandler(async (req, res, _next) => {
  const userId = req.user._id;
  const { profId, permissionToSeeProfile, dateByClient } = req.body;

  const isExists = await Professional.findById(profId).lean();
  if (!isExists) {
    return sendErrorResponse(res, 404, httpStatus.NOT_FOUND, {
      message: "এই নামে কোন প্রোফেসনাল খুঁজে পাওয়া যাইনি!",
    });
  }

  const newAppointment = await Appointment.create({
    user: userId,
    prof: profId,
    permissionToSeeProfile,
    dateByClient,
  });

  await ProfessionalsNotification.create({
    user: userId,
    prof: profId,
    type: constants.APPOINTMENT_REQUESTED,
    appointmentId: newAppointment._id,
  });

  return sendJSONresponse(res, 201, {
    data: {
      appointmentId: newAppointment._id,
    },
  });
});

exports.showAllClientRequests = asyncHandler(async (req, res, _next) => {
  const professionalId = req.user._id;
  const page = +req.query.page || 1;
  const response = {};

  const query = {
    prof: professionalId,
    hasProfRespondedToClient: false,
  };

  if (page === 1) {
    response.requestsCount = await Appointment.countDocuments(query);
  }

  const LIMIT = 5;
  response.requests = await Appointment.find(query)
    .sort({ _id: -1 })
    .populate({
      path: "user",
      select: "name age isMarried location email",
    })
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT)
    .lean();

  return sendJSONresponse(res, 200, { data: response });
});

// POST prof/appointment-seen/:appointmentId
exports.appointmentSeen = asyncHandler(async (req, res, _next) => {
  const { appointmentId } = req.params;
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return sendErrorResponse(res, 404, httpStatus.NOT_FOUND, {
      message: "অ্যাপয়েন্টমেন্ট পাওয়া যায়নি",
    });
  }

  if (appointment.hasProfRespondedToClient) {
    return sendJSONresponse(res, 200, {
      data: {
        message: "Appointment is already responded to client",
        appointment,
      },
    });
  }

  if (!appointment.hasProfViewed) {
    appointment.hasProfViewed = true;
    appointment.profViewedAt = new Date();
    await appointment.save();
  }

  const notification = await ProfessionalsNotification.findOne({
    appointmentId: appointment._id,
  });

  if (notification && !notification.hasSeen) {
    notification.hasSeen = true;
    await notification.save();
  }

  return sendJSONresponse(res, 200, {
    data: {
      appointment,
    },
  });
});

exports.respondToAppointment = asyncHandler(async (req, res, _next) => {
  const { appointmentId } = req.params;
  const profId = req.user._id;

  const { dateByProfessional, message, initAssessmentSlug, userId } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return sendErrorResponse(res, 404, httpStatus.NOT_FOUND, {
      message: "অ্যাপয়েন্টমেন্ট পাওয়া যায়নি",
    });
  }

  if (appointment.hasProfRespondedToClient) {
    return sendErrorResponse(res, 400, httpStatus.BAD_REQUEST, {
      message: "Professional already responded to client",
    });
  }

  appointment.hasProfRespondedToClient = true;
  appointment.profRespondedAt = new Date();

  if (dateByProfessional) appointment.dateByProfessional = dateByProfessional;
  if (message) appointment.messageFromProf = message;
  if (initAssessmentSlug) {
    appointment.initAssessmentSlug = initAssessmentSlug;
    const assessment = await ProfessionalsAssessment.create({
      user: userId,
      prof: profId,
      assessmentSlug: initAssessmentSlug,
    });
    appointment.initAssessmentId = assessment._id;
  }

  await appointment.save();

  await UsersNotification.create({
    user: userId,
    prof: profId,
    type: constants.APPOINTMENT_ACCEPTED,
    appointmentId: appointment._id,
  });

  await UsersNotification.create({
    user: userId,
    prof: profId,
    type: constants.SUGGEST_A_SCALE,
    assessmentId: appointment.initAssessmentId,
  });

  await ProfessionalsNotification.deleteMany({
    user: userId,
    prof: profId,
    type: constants.APPOINTMENT_REQUESTED,
  });

  const client = await ProfessionalsClient.findOne({
    user: userId,
    prof: profId,
  });

  if (client) {
    if (!client.isActive) {
      client.isActive = true;
      await client.save();
    }
  } else {
    await ProfessionalsClient.create({
      user: userId,
      prof: profId,
    });
  }

  return sendJSONresponse(res, 200, {
    data: {
      appointment,
    },
  });
});

// GET /user/appointment-details/:appointmentId
exports.getAppointmentDetailsForUser = asyncHandler(async (req, res, _next) => {
  const { appointmentId } = req.params;
  const appointment = await Appointment.findById(appointmentId).populate([
    {
      path: "user",
      select: "name",
    },
    {
      path: "prof",
      select: "name email telephone",
    },
  ]);
  if (!appointment) {
    return sendErrorResponse(res, 404, httpStatus.NOT_FOUND, {
      message: "অ্যাপয়েন্টমেন্ট পাওয়া যায়নি",
    });
  }

  await UsersNotification.deleteMany({
    user: req.user._id,
    type: constants.APPOINTMENT_ACCEPTED,
    appointmentId: appointmentId,
  });

  return sendJSONresponse(res, 200, {
    data: {
      appointment,
    },
  });
});
