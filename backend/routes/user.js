const router = require("express").Router();
const C = require("../controllers/user");
const userProfCtrl = require("../controllers/user-professional");
const M = require("../middlewares/authentication");
const validate = require("../middlewares/validate");
const userValidation = require("../validations/user.validation");
const AuthCtrl = require("../controllers/auth");

const ROLE = "user";

router.post("/delete-account", M.verifyToken(ROLE), AuthCtrl.deleteUserAccount);

router.post("/sign-in", validate(userValidation.loginAsUser), AuthCtrl.signIn);

router.post(
  "/sign-up",
  validate(userValidation.registerUserStep1),
  AuthCtrl.signUp
);

router.post(
  "/add-info",
  M.verifyToken(ROLE),
  validate(userValidation.additionalInfoValidationSchema),
  C.submitAdditionalInfo
);

router.post(
  "/reset-password",
  M.verifyToken(ROLE),
  validate(userValidation.resetPassword),
  AuthCtrl.resetPassword
);

router.post("/test", M.verifyToken(ROLE), C.anyTestSubmit);
router.get("/homepage", M.verifyToken(ROLE), C.userHomepage);
router.post("/intro-Test-Submit", M.verifyToken(ROLE), C.introTestSubmit);

router.get("/profile/all", M.verifyToken(ROLE), C.getProfileDetails);
router.get("/all-information", M.verifyToken(ROLE), C.getAllInformation);
router.post("/seen-video/:videoUrl", M.verifyToken(ROLE), C.submitAVideo);

router.post("/rating", M.verifyToken(ROLE), C.rating);
router.post("/update/profile", M.verifyToken(ROLE), C.updateProfile);

router.get("/notifications", M.verifyToken(ROLE), C.userNotifications);
router.get(
  "/notifications/unread/h/",
  M.verifyToken(ROLE),
  C.numberOfNotifications
);

router.get("/all", C.allUsers);
router.post("/userInfo", C.userInfo);

router.post("/error", C.error);
router.post("/notification/seen/", C.seenNotification);

router.post("/submit-prof-scale", M.verifyToken(ROLE), C.submitProfScale);
router.post(
  "/suggested-scale/check",
  M.verifyToken(ROLE),
  C.checkSuggestedScale
);

router.get(
  "/result-history-data/:testType",
  M.verifyToken(ROLE),
  C.resultHistoryTableData
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

router.get(
  "/professionals",
  M.verifyToken(ROLE),
  userProfCtrl.findProfessionals
);

router.post(
  "/take-appointment",
  M.verifyToken(ROLE),
  userProfCtrl.takeAppointment
);

router.get(
  "/appointment-details/:appointmentId",
  M.verifyToken(ROLE),
  userProfCtrl.getAppointmentDetailsForUser
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
