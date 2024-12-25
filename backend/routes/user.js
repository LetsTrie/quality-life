const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth');
const UserController = require('../controllers/user');
const UserProfessionalController = require('../controllers/user-professional');

const authenticationMiddleware = require('../middlewares/authentication');
const validationMiddleware = require('../middlewares/validate');

const userValidation = require('../validations/user.validation');
const authValidation = require('../validations/auth.validation');

const ROLE = 'user';
const verifyUserToken = authenticationMiddleware.verifyToken(ROLE);

// ****************************************************************
// Auth Routes
// ****************************************************************

router.post(
    '/sign-in',
    validationMiddleware(userValidation.loginAsUser),
    AuthController.signIn,
);

router.post(
    '/sign-up',
    validationMiddleware(userValidation.registerUserStep1),
    AuthController.signUp,
);

router.post(
    '/reset-password',
    verifyUserToken,
    validationMiddleware(authValidation.resetPassword),
    AuthController.resetPassword,
);

router.post(
    '/delete-account',
    verifyUserToken,
    AuthController.deleteUserAccount,
);

// ****************************************************************
// User Information Routes
// ****************************************************************

router.post(
    '/add-info',
    verifyUserToken,
    validationMiddleware(userValidation.additionalInfoValidationSchema),
    UserController.submitAdditionalInfo,
);

router.get('/homepage', verifyUserToken, UserController.userHomepage);

router.get('/profile/all', verifyUserToken, UserController.getProfileDetails);

router.get(
    '/all-informations',
    verifyUserToken,
    UserController.getAllInformations,
);

router.post(
    '/seen-video/:videoUrl',
    verifyUserToken,
    UserController.submitAVideo,
);

router.post('/add-rating', verifyUserToken, UserController.rating);

router.post('/update/profile', verifyUserToken, UserController.updateProfile);

// ****************************************************************
// Public Routes
// ****************************************************************

router.get('/all', UserController.allUsers);
router.post('/userInfo', UserController.userInfo);

// ****************************************************************
// Test and Assessment Routes
// ****************************************************************

router.post('/test', verifyUserToken, UserController.anyTestSubmit);

router.post(
    '/submit-suggested-scale',
    verifyUserToken,
    UserController.submitProfScale,
);

router.get(
    '/suggested-scale-fillup-check/:assessmentId',
    verifyUserToken,
    UserController.checkSuggestedScale,
);

router.get(
    '/result-history-data/:testType',
    verifyUserToken,
    UserController.resultHistoryTableData,
);

// ****************************************************************
// Professional Routes
// ****************************************************************

router.get(
    '/professionals',
    verifyUserToken,
    UserProfessionalController.findProfessionals,
);

router.post(
    '/take-appointment',
    verifyUserToken,
    UserProfessionalController.requestForAppointment,
);

router.get(
    '/appointment-details/:appointmentId',
    verifyUserToken,
    UserProfessionalController.getAppointmentDetailsForUser,
);

router.get(
    '/find-suggested-scales/:profId',
    verifyUserToken,
    UserProfessionalController.findSuggestedScales,
);

module.exports = router;
