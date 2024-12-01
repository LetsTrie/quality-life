const router = require("express").Router();
const professionalController = require("../controllers/prof");
const userProfCtrl = require("../controllers/user-professional");
const M = require("../middlewares/authentication");
const validate = require("../middlewares/validate");
const { profValidation } = require("../validations");

const ROLE = "prof";

router.post(
  "/register/step-1",
  validate(profValidation.registerProfessionalStep1),
  professionalController.registerProfessionalStep1
);

router.post("/login", professionalController.profLogin);

router.post(
  "/register/step-2",
  M.verifyToken(ROLE),
  validate(profValidation.registerProfessionalStep2),
  professionalController.registerProfessionalStep2
);

router.post(
  "/register/step-3",
  M.verifyToken(ROLE),
  validate(profValidation.registerProfessionalStep3),
  professionalController.registerProfessionalStep3
);

router.post(
  "/register/step-4",
  M.verifyToken(ROLE),
  validate(profValidation.registerProfessionalStep4),
  professionalController.registerProfessionalStep4
);

router.get(
  "/all-informations",
  M.verifyToken(ROLE),
  professionalController.getAllInformations
);

router.get("/all", professionalController.getAllProfs);
router.post("/action", professionalController.profAction);

router.post(
  "/delete-account",
  M.verifyToken(ROLE),
  professionalController.deleteProfessionalAccount
);
router.put(
  "/:profId/visibility",
  validate(profValidation.profVisibility),
  professionalController.profVisibility
);

router.get(
  "/homepage-notification-count",
  M.verifyToken(ROLE),
  professionalController.getHomepageInformationProf
);
router.get(
  "/notifications/unread",
  M.verifyToken(ROLE),
  professionalController.getProfUnreadNotifications
);
router.post(
  "/notifications/seen",
  M.verifyToken(ROLE),
  professionalController.seenNotification
);

router.post(
  "/add-as-client",
  M.verifyToken(ROLE),
  professionalController.AddasClient
);
router.get(
  "/my-clients",
  M.verifyToken(ROLE),
  professionalController.myClients
);

router.post(
  "/suggest-scale",
  M.verifyToken(ROLE),
  professionalController.suggestAscale
);
router.get(
  "/user-profile/:userId",
  professionalController.getUserCompleteProfile
);
router.get(
  "/test-details/:testId",
  professionalController.getCompleteTestResult
);

router.post(
  "/result-suggested-scale",
  M.verifyToken(ROLE),
  professionalController.getScaleResult
);

router.get("/allProf", professionalController.allProf);

router.post(
  "/:profId/update/profile",
  M.verifyToken(ROLE),
  professionalController.updateProfile
);
router.post("/getCode", professionalController.getVerificationCode);
router.post("/changePassword", professionalController.changePassword);

// ****************************************************************
// ****************************************************************
// ****************************************************************

router.post(
  "/appointment-seen/:appointmentId",
  M.verifyToken(ROLE),
  userProfCtrl.appointmentSeen
);

router.get(
  "/client-requests",
  M.verifyToken(ROLE),
  userProfCtrl.showAllClientRequests
);

router.post(
  "/appointment-response/:appointmentId",
  M.verifyToken(ROLE),
  userProfCtrl.respondToAppointment
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
