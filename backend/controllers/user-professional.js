const {
    Professional,
    Appointment,
    ProfessionalsClient,
    ProfessionalsAssessment,
} = require('../models');

const { NotificationService } = require('../services');
const { sendEmail } = require('../services/email');
const {
    generateAppointmentRequestEmail,
} = require('../services/email-templates/generateAppointmentRequestEmail');

const {
    asyncHandler,
    sendJSONresponse,
    sendErrorResponse,
    constants,
} = require('../utils');
const { formatDate } = require('../utils/datetime');
const { capitalizeFirstLetter } = require('../utils/string');

// GET /user/professionals
exports.findProfessionals = asyncHandler(async (req, res, _next) => {
    const user = req.user._id;
    const page = +req.query.page || 1;

    const response = {};
    let myProfIds = [];

    if (page === 1) {
        response.professionalsCount = await Professional.countDocuments({
            isVerified: true,
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

        myProfIds = [
            ...new Set([
                ...response.appointmentsTaken.map(appointment =>
                    appointment.prof.toString(),
                ),
                ...response.isClient.map(client => client.prof.toString()),
            ]),
        ];

        response.recentlyContactedProfessionals = await Professional.find({
            _id: {
                $in: myProfIds,
            },
        })
            .sort({ _id: -1 })
            .lean();
    }

    const LIMIT = 10;
    response.professionals = await Professional.find({
        isVerified: true,
        visibility: true,
        step: 4,
        _id: { $nin: myProfIds },
    })
        .limit(LIMIT)
        .skip(LIMIT * page - LIMIT)
        .sort({ _id: -1 })
        .lean();

    return sendJSONresponse(res, 200, { data: response });
});

exports.requestForAppointment = asyncHandler(async (req, res, _next) => {
    const userId = req.user._id;
    const { profId, permissionToSeeProfile, dateByClient } = req.body;

    const professional = await Professional.findById(profId).lean();
    if (!professional) {
        return sendErrorResponse(res, 404, 'NOT_FOUND', {
            message: 'এই নামে কোন প্রোফেসনাল খুঁজে পাওয়া যাইনি!',
        });
    }

    const existingAppointment = await Appointment.findOne({
        user: userId,
        prof: profId,
        isActive: true,
    });

    if (existingAppointment) {
        return sendErrorResponse(res, 400, 'BAD_REQUEST', {
            message:
                'আপনি ইতোমধ্যে এই প্রোফেসনালের সাথে একটি অ্যাপয়েন্টমেন্ট করেছেন!',
        });
    }

    const newAppointment = await Appointment.create({
        user: userId,
        prof: profId,
        permissionToSeeProfile,
        dateByClient,
    });

    await NotificationService.sendAppointmentRequestToProfessional(
        userId,
        profId,
        newAppointment._id,
    );

    await sendEmail(
        professional.email,
        `New Appointment Request from ${capitalizeFirstLetter(req.user.name)}`,
        generateAppointmentRequestEmail({
            profName: capitalizeFirstLetter(professional.name),
            userName: capitalizeFirstLetter(req.user.name),
            userEmail: req.user.email,
            dateByClient: formatDate(dateByClient),
            permissionToSeeProfile,
        }),
    );

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
        isActive: true,
    };

    if (page === 1) {
        response.requestsCount = await Appointment.countDocuments(query);
    }

    const LIMIT = 10;
    response.requests = await Appointment.find(query)
        .sort({ _id: -1 })
        .populate({
            path: 'user',
            select: 'name age isMarried location email',
        })
        .limit(LIMIT)
        .skip(LIMIT * page - LIMIT)
        .lean();

    return sendJSONresponse(res, 200, { data: response });
});

// POST prof/appointment-seen/:appointmentId
exports.appointmentSeen = asyncHandler(async (req, res, _next) => {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId).populate({
        path: 'user',
        select: 'name age isMarried location email',
    });

    if (!appointment) {
        return sendErrorResponse(res, 404, 'NOT_FOUND', {
            message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি',
        });
    }

    if (appointment.hasProfRespondedToClient) {
        return sendJSONresponse(res, 200, {
            data: {
                message: 'Appointment is already responded to client',
                appointment,
            },
        });
    }

    if (!appointment.hasProfViewed) {
        appointment.hasProfViewed = true;
        appointment.profViewedAt = new Date();
        await appointment.save();
    }

    await NotificationService.seenAppointmentRequestedByProfessional(
        appointment._id,
    );

    return sendJSONresponse(res, 200, {
        data: {
            appointment,
        },
    });
});

exports.suggestAscale = asyncHandler(async (req, res, _next) => {
    const profId = req.user._id;
    const { userId, clientId, assessmentSlug } = req.body;

    const assessment = await ProfessionalsAssessment.create({
        user: userId,
        client: clientId,
        prof: profId,
        assessmentSlug,
    });

    await NotificationService.scaleSuggestedByProfessional(
        userId,
        profId,
        assessment._id,
    );

    return sendJSONresponse(res, 201, {
        data: {
            assessmentId: assessment._id,
        },
    });
});

exports.respondToAppointment = asyncHandler(async (req, res, _next) => {
    const { appointmentId } = req.params;
    const profId = req.user._id;

    const { dateByProfessional, message, initAssessmentSlug, userId } =
        req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return sendErrorResponse(res, 404, 'NOT_FOUND', {
            message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি',
        });
    }

    if (appointment.hasProfRespondedToClient) {
        return sendErrorResponse(res, 400, 'BAD_REQUEST', {
            message: 'Professional already responded to client',
        });
    }

    let client = await ProfessionalsClient.findOne({
        user: userId,
        prof: profId,
    });

    if (client) {
        if (!client.isActive) {
            client.isActive = true;
            await client.save();
        }
    } else {
        client = await ProfessionalsClient.create({
            user: userId,
            prof: profId,
        });
    }

    appointment.hasProfRespondedToClient = true;
    appointment.profRespondedAt = new Date();
    appointment.status = constants.APPOINTMENT_ACCEPTED;

    if (dateByProfessional) {
        appointment.dateByProfessional = dateByProfessional;
    }

    if (message) {
        appointment.messageFromProf = message;
    }

    if (initAssessmentSlug) {
        const assessment = await ProfessionalsAssessment.create({
            user: userId,
            prof: profId,
            assessmentSlug: initAssessmentSlug,
            client: client._id,
        });

        await NotificationService.scaleSuggestedByProfessional(
            userId,
            profId,
            assessment._id,
        );
    }

    await appointment.save();

    await NotificationService.appointmentAcceptedByProfessional(
        userId,
        profId,
        appointment._id,
    );

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
            path: 'user',
            select: 'name',
        },
        {
            path: 'prof',
            select: 'name email telephone',
        },
    ]);
    if (!appointment) {
        return sendErrorResponse(res, 404, 'NOT_FOUND', {
            message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি',
        });
    }

    await NotificationService.seenAppointmentAcceptedNotificationByUser(
        appointmentId,
    );

    return sendJSONresponse(res, 200, {
        data: {
            appointment,
        },
    });
});

exports.findSuggestedScales = asyncHandler(async (req, res, _next) => {
    const { profId } = req.params;
    const userId = req.user._id;

    const scales = await ProfessionalsAssessment.find({
        user: userId,
        prof: profId,
        hasCompleted: false,
    });

    return sendJSONresponse(res, 200, { data: { scales } });
});

exports.findSuggestedScalesByClient = asyncHandler(async (req, res, _next) => {
    const { clientId } = req.params;

    const scales = await ProfessionalsAssessment.find({
        client: clientId,
    })
        .sort({ _id: -1 })
        .lean();

    return sendJSONresponse(res, 200, { data: { scales } });
});

exports.getAssessmentDetails = asyncHandler(async (req, res, _next) => {
    const { assessmentId } = req.params;

    const scale = await ProfessionalsAssessment.findById(assessmentId).lean();

    await NotificationService.seenAssessmentSubmissionNotificationByProfessional(
        assessmentId,
    );

    return sendJSONresponse(res, 200, { data: { scale } });
});
