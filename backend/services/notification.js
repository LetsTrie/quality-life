const { Notification } = require("../models");
const { constants } = require("../utils");

const getUsersUnreadNotificationsCount = async (userId) => {
  return Notification.countDocuments({
    user: userId,
    hasSeen: false,
    for: constants.ROLES.USER,
  });
};

const getProfessionalsUnreadNotificationsCount = async (profId) => {
  return Notification.countDocuments({
    prof: profId,
    hasSeen: false,
    for: constants.ROLES.PROFESSIONAL,
  });
};

const getUnreadNotificationsCount = async (_id, isUser, isProfessional) => {
  if (!isUser && !isProfessional) {
    throw new Error("Invalid user type");
  }

  if (isUser) return getUsersUnreadNotificationsCount(_id);
  return getProfessionalsUnreadNotificationsCount(_id);
};

const getNotifications = async (
  _id,
  isUser,
  isProfessional,
  page = 1,
  LIMIT = 10
) => {
  if (!isUser && !isProfessional) {
    throw new Error("Invalid user type");
  }

  page = parseInt(page, 10) || 1;

  const response = {};
  const query = {};
  if (isUser) query.user = _id;
  else query.prof = _id;
  query.for = isUser ? constants.ROLES.USER : constants.ROLES.PROFESSIONAL;

  if (page === 1) {
    response.numberOfNotifications = await Notification.countDocuments(query);
  }

  response.notifications = await Notification.find(query)
    .sort({ _id: -1 })
    .populate([
      {
        path: "prof user",
        select: "name",
      },
      {
        path: "appointment",
        select: "dateByProfessional",
      },
      {
        path: "assessment",
        select: "assessmentSlug",
      },
    ])
    .limit(LIMIT)
    .skip(LIMIT * page - LIMIT);

  return response;
};

const seenNotificationById = async (_id) => {
  return Notification.findByIdAndUpdate(_id, { hasSeen: true });
};

// TODO: Send Mail Notification to Professional
// TODO: FCM Push Notification to Professional

const sendAppointmentRequestToProfessional = async (
  userId,
  professionalId,
  appointmentId
) => {
  await Notification.create({
    user: userId,
    prof: professionalId,
    for: constants.ROLES.PROFESSIONAL,
    type: constants.APPOINTMENT_REQUESTED,
    appointment: appointmentId,
  });
};

const appointmentAcceptedByProfessional = async (
  userId,
  professionalId,
  appointmentId
) => {
  await Notification.create({
    user: userId,
    prof: professionalId,
    for: constants.ROLES.USER,
    type: constants.APPOINTMENT_ACCEPTED,
    appointment: appointmentId,
  });

  await Notification.findOneAndDelete({
    appointment: appointmentId,
    type: constants.APPOINTMENT_REQUESTED,
  });
};

const scaleSuggestedByProfessional = async (
  userId,
  professionalId,
  assessmentId
) => {
  await Notification.create({
    user: userId,
    prof: professionalId,
    for: constants.ROLES.USER,
    type: constants.SUGGEST_A_SCALE,
    assessment: assessmentId,
  });
};

const scaleSubmittedByUser = async (userId, professionalId, assessmentId) => {
  await Notification.create({
    user: userId,
    prof: professionalId,
    for: constants.ROLES.PROFESSIONAL,
    type: constants.SCALE_FILLUP_BY_USER,
    assessment: assessmentId,
  });
};

const seenAppointmentRequestedByProfessional = async (appointmentId) => {
  return Notification.findOneAndUpdate(
    { type: constants.APPOINTMENT_REQUESTED, appointment: appointmentId },
    { hasSeen: true }
  );
};

const seenAppointmentAcceptedNotificationByUser = async (appointmentId) => {
  return Notification.findOneAndUpdate(
    { type: constants.APPOINTMENT_ACCEPTED, appointment: appointmentId },
    { hasSeen: true }
  );
};

const seenAssessmentNotification = (assessmentId) => {
  return Notification.findOneAndUpdate(
    { type: constants.SUGGEST_A_SCALE, assessment: assessmentId },
    { hasSeen: true }
  );
};

const seenAssessmentSubmissionNotificationByProfessional = async (
  assessmentId
) => {
  return Notification.findOneAndUpdate(
    { type: constants.SCALE_FILLUP_BY_USER, assessment: assessmentId },
    { hasSeen: true }
  );
};

const removeAssessmentSuggestionNotification = (assessmentId) => {
  return Notification.findOneAndDelete({
    type: constants.SUGGEST_A_SCALE,
    assessment: assessmentId,
  });
};

module.exports = {
  getUsersUnreadNotificationsCount,
  getProfessionalsUnreadNotificationsCount,
  getUnreadNotificationsCount,
  getNotifications,
  seenNotificationById,
  sendAppointmentRequestToProfessional,
  appointmentAcceptedByProfessional,
  scaleSuggestedByProfessional,
  seenAppointmentRequestedByProfessional,
  seenAppointmentAcceptedNotificationByUser,
  seenAssessmentNotification,
  removeAssessmentSuggestionNotification,
  scaleSubmittedByUser,
  seenAssessmentSubmissionNotificationByProfessional,
};
