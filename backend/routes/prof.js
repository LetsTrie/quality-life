const express = require('express');
const router = express.Router();

const ProfessionalController = require('../controllers/prof');
const UserProfessionalController = require('../controllers/user-professional');
const AuthController = require('../controllers/auth');

const authenticationMiddleware = require('../middlewares/authentication');
const validationMiddleware = require('../middlewares/validate');

const authValidation = require('../validations/auth.validation');
const profValidation = require('../validations/prof.validation');

const ROLE = 'prof';
const verifyUserToken = authenticationMiddleware.verifyToken(ROLE);

router.post(
    '/register/step-1',
    validationMiddleware(profValidation.registerProfessionalStep1),
    ProfessionalController.registerProfessionalStep1,
);

router.post('/login', ProfessionalController.profLogin);

router.post(
    '/register/step-2',
    verifyUserToken,
    validationMiddleware(profValidation.registerProfessionalStep2),
    ProfessionalController.registerProfessionalStep2,
);

router.post(
    '/register/step-3',
    verifyUserToken,
    validationMiddleware(profValidation.registerProfessionalStep3),
    ProfessionalController.registerProfessionalStep3,
);

router.post(
    '/register/step-4',
    verifyUserToken,
    validationMiddleware(profValidation.registerProfessionalStep4),
    ProfessionalController.registerProfessionalStep4,
);

router.get(
    '/all-informations',
    verifyUserToken,
    ProfessionalController.getAllInformations,
);

router.post(
    '/delete-account',
    verifyUserToken,
    ProfessionalController.deleteProfessionalAccount,
);

router.post(
    '/reset-password',
    verifyUserToken,
    validationMiddleware(authValidation.resetPassword),
    AuthController.resetPassword,
);

router.post(
    '/update-visibility',
    verifyUserToken,
    validationMiddleware(profValidation.profVisibility),
    ProfessionalController.profVisibility,
);

router.get(
    '/homepage-notification-count',
    verifyUserToken,
    ProfessionalController.getHomepageInformationProf,
);

router.get('/my-clients', verifyUserToken, ProfessionalController.myClients);

router.get(
    '/user-profile/:userId',
    ProfessionalController.getUserCompleteProfile,
);
router.get(
    '/primary-test-details/:testId',
    ProfessionalController.getPrimaryResultDetails,
);

router.post(
    '/result-suggested-scale',
    verifyUserToken,
    ProfessionalController.getScaleResult,
);

router.get('/allProf', ProfessionalController.allProf);

router.post(
    '/:profId/update/profile',
    verifyUserToken,
    ProfessionalController.updateProfile,
);

router.post(
    '/approve',
    ProfessionalController.approveProfessionalFromAdminPanel,
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

router.post(
    '/appointment-seen/:appointmentId',
    verifyUserToken,
    UserProfessionalController.appointmentSeen,
);

router.get(
    '/client-requests',
    verifyUserToken,
    UserProfessionalController.showAllClientRequests,
);

router.post(
    '/appointment-response/:appointmentId',
    verifyUserToken,
    UserProfessionalController.respondToAppointment,
);

router.post(
    '/suggest-scale',
    verifyUserToken,
    UserProfessionalController.suggestAscale,
);
router.get(
    '/scales/:clientId',
    verifyUserToken,
    UserProfessionalController.findSuggestedScalesByClient,
);
router.get(
    '/assessment/:assessmentId',
    verifyUserToken,
    UserProfessionalController.getAssessmentDetails,
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
