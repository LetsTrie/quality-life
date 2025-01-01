const { Notification } = require('../models');
const { constants } = require('../utils');
const { formatSlugToTitle } = require('../utils/string');
const { sendEmail } = require('./email');
const {
    generateAppointmentRequestEmail,
    generateAppointmentResponseEmail,
    generateScaleSuggestionEmail,
    generateScaleSubmissionEmail,
} = require('./email-templates');

const getUsersUnreadNotificationsCount = async userId => {
    return Notification.countDocuments({
        user: userId,
        hasSeen: false,
        for: constants.ROLES.USER,
    });
};

const getProfessionalsUnreadNotificationsCount = async profId => {
    return Notification.countDocuments({
        prof: profId,
        hasSeen: false,
        for: constants.ROLES.PROFESSIONAL,
    });
};

const getUnreadNotificationsCount = async (_id, isUser, isProfessional) => {
    if (!isUser && !isProfessional) {
        throw new Error('Invalid user type');
    }

    if (isUser) return getUsersUnreadNotificationsCount(_id);
    return getProfessionalsUnreadNotificationsCount(_id);
};

const getNotifications = async (
    _id,
    isUser,
    isProfessional,
    page = 1,
    LIMIT = 10,
) => {
    if (!isUser && !isProfessional) {
        throw new Error('Invalid user type');
    }

    page = parseInt(page, 10) || 1;

    const response = {};
    const query = {};
    if (isUser) query.user = _id;
    else query.prof = _id;
    query.for = isUser ? constants.ROLES.USER : constants.ROLES.PROFESSIONAL;

    if (page === 1) {
        response.numberOfNotifications = await Notification.countDocuments(
            query,
        );
    }

    response.notifications = await Notification.find(query)
        .sort({ _id: -1 })
        .populate([
            {
                path: 'prof user',
                select: 'name',
            },
            {
                path: 'appointment',
                select: 'dateByProfessional',
            },
            {
                path: 'assessment',
                select: 'assessmentSlug',
            },
        ])
        .limit(LIMIT)
        .skip(LIMIT * page - LIMIT);

    return response;
};

const seenNotificationById = async _id => {
    return Notification.findByIdAndUpdate(_id, { hasSeen: true });
};

// TODO: FCM Push Notification to Professional
const sendAppointmentRequestToProfessional = async ({
    userId,
    userName,
    userEmail,
    profId,
    profName,
    profEmail,
    appointmentId,
    dateByClient,
    permissionToSeeProfile,
}) => {
    await Notification.create({
        user: userId,
        prof: profId,
        for: constants.ROLES.PROFESSIONAL,
        type: constants.APPOINTMENT_REQUESTED,
        appointment: appointmentId,
    });

    await sendEmail(
        profEmail,
        `New Appointment Request from ${userName}`,
        generateAppointmentRequestEmail({
            profName,
            userName,
            userEmail,
            dateByClient,
            permissionToSeeProfile,
        }),
    );
};

const appointmentAcceptedByProfessional = async ({
    userId,
    userName,
    userEmail,
    profId,
    profName,
    appointmentId,
    appointmentDate,
    message,
}) => {
    await Notification.create({
        user: userId,
        prof: profId,
        for: constants.ROLES.USER,
        type: constants.APPOINTMENT_ACCEPTED,
        appointment: appointmentId,
    });

    await Notification.findOneAndDelete({
        appointment: appointmentId,
        type: constants.APPOINTMENT_REQUESTED,
    });

    await sendEmail(
        userEmail,
        `Confirmation of Your Appointment with ${profName}`,
        generateAppointmentResponseEmail({
            userName,
            profName,
            appointmentDate,
            message,
        }),
    );
};

const scaleSuggestedByProfessional = async ({
    userId,
    userName,
    userEmail,
    profId,
    profName,
    assessmentId,
    assessmentName,
}) => {
    await Notification.create({
        user: userId,
        prof: profId,
        for: constants.ROLES.USER,
        type: constants.SUGGEST_A_SCALE,
        assessment: assessmentId,
    });

    await sendEmail(
        userEmail,
        `A New Scale Has Been Suggested for You`,
        generateScaleSuggestionEmail({
            userName,
            profName,
            assessmentName,
        }),
    );
};

const scaleSubmittedByUser = async ({
    userId,
    userName,
    profId,
    profName,
    profEmail,
    assessmentId,
    assessmentName,
}) => {
    console.log({
        userId,
        userName,
        profId,
        profName,
        profEmail,
        assessmentId,
        assessmentName,
    });

    await Notification.create({
        user: userId,
        prof: profId,
        for: constants.ROLES.PROFESSIONAL,
        type: constants.SCALE_FILLUP_BY_USER,
        assessment: assessmentId,
    });

    await sendEmail(
        profEmail,
        `A Scale Has Been Submitted by ${userName}`,
        generateScaleSubmissionEmail({
            userName,
            profName,
            assessmentName,
        }),
    );
};

const seenAppointmentRequestedByProfessional = async appointmentId => {
    return Notification.findOneAndUpdate(
        { type: constants.APPOINTMENT_REQUESTED, appointment: appointmentId },
        { hasSeen: true },
    );
};

const seenAppointmentAcceptedNotificationByUser = async appointmentId => {
    return Notification.findOneAndUpdate(
        { type: constants.APPOINTMENT_ACCEPTED, appointment: appointmentId },
        { hasSeen: true },
    );
};

const seenAssessmentNotification = assessmentId => {
    return Notification.findOneAndUpdate(
        { type: constants.SUGGEST_A_SCALE, assessment: assessmentId },
        { hasSeen: true },
    );
};

const seenAssessmentSubmissionNotificationByProfessional =
    async assessmentId => {
        return Notification.findOneAndUpdate(
            { type: constants.SCALE_FILLUP_BY_USER, assessment: assessmentId },
            { hasSeen: true },
        );
    };

const removeAssessmentSuggestionNotification = assessmentId => {
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
