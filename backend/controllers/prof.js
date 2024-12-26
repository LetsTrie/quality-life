const asyncHandler = require('../middlewares/asyncHandler');
const Professional = require('../models/prof');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const Appointment = require('../models/appointment');
const ProfAssessment = require('../models/profAssessment');
const MyClient = require('../models/myClient');
const { Notification } = require('../models');
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
const { sendEmail } = require('../services/email');
const {
    accountApprovedEmailTemplate,
} = require('../services/email-templates/account-approved');
const {
    profRegStep1EmailTemplate,
} = require('../services/email-templates/prof-reg-step1-verification');

exports.registerProfessionalStep1 = asyncHandler(async (req, res, _next) => {
    const { email, password } = req.body;

    const isEmailTaken = await Professional.exists({ email });
    if (isEmailTaken) {
        return sendErrorResponse(res, 400, 'BAD_REQUEST', {
            message: 'এই ইমেলটি ইতোমধ্যেই ব্যবহার করা হয়েছে',
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newProfessional = await Professional.create({
        ...req.body,
        password: hashedPassword,
    });

    const response = await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Professional Registration: Approval Required!',
        profRegStep1EmailTemplate({
            name: newProfessional.name,
            email: newProfessional.email,
            profession: newProfessional.profession,
            designation: newProfessional.designation,
            workplace: newProfessional.workplace,
            batch: newProfessional.batch,
            gender: newProfessional.gender,
            bmdc: newProfessional.bmdc,
            union: newProfessional.union,
            upazila: newProfessional.upazila,
            zila: newProfessional.zila,
            approvalLink: `${process.env.APP_URL}/admin/professionals`,
        }),
    );

    console.log(response);

    return sendJSONresponse(res, 201, {
        data: {
            id: newProfessional._id,
            email: newProfessional.email,
        },
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
            message: 'ইমেইল/পাসওয়ার্ডটি ভুল',
        });
    }

    const isMatch = await bcrypt.compare(req.body.password, prof.password);
    if (!isMatch) {
        return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
            message: 'ইমেইল/পাসওয়ার্ডটি ভুল',
        });
    }

    if (!prof.isVerified) {
        return sendErrorResponse(res, 401, 'UNAUTHORIZED', {
            message: 'অ্যাকাউন্ট এখনও যাচাই করা হয়নি',
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
        await NotificationService.getProfessionalsUnreadNotificationsCount(
            profId,
        );

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
        .populate({
            path: 'user',
            select: 'name location age gender isMarried',
        })
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

    await MyClient.deleteMany({ prof: profId });
    await Appointment.deleteMany({ prof: profId });
    await ProfAssessment.deleteMany({ prof: profId });
    await Notification.deleteMany({ prof: profId });

    await Professional.findByIdAndDelete(profId);

    return sendJSONresponse(res, httpStatus.OK, { success: true });
});

exports.profVisibility = asyncHandler(async (req, res, _next) => {
    req.user.visibility = !!req.body.visibility;
    await req.user.save();
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

exports.readProfessionalsByAdmin = asyncHandler(async (req, res, _next) => {
    const profs = await Professional.find();

    return res.render('professionals', {
        profs,
    });
});

exports.approveProfessionalFromAdminPanel = asyncHandler(
    async (req, res, _next) => {
        const { profId } = req.body;
        const professional = await Professional.findById(profId);
        if (!professional) {
            return sendErrorResponse(res, 'NOT_FOUND', {
                message: 'Professional not found',
            });
        }

        professional.isVerified = true;
        await professional.save();

        await sendEmail(
            professional.email,
            'Your Account is Activated!',
            accountApprovedEmailTemplate(professional.name),
        );

        return sendJSONresponse(res, httpStatus.OK, { success: true });
    },
);
