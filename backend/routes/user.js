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

router.get("/profile/all", M.verifyToken(ROLE), C.getProfileDetails);
router.get("/all-informations", M.verifyToken(ROLE), C.getAllInformations);
router.post("/seen-video/:videoUrl", M.verifyToken(ROLE), C.submitAVideo);

router.post("/add-rating", M.verifyToken(ROLE), C.rating);
router.post("/update/profile", M.verifyToken(ROLE), C.updateProfile);

router.get("/all", C.allUsers);
router.post("/userInfo", C.userInfo);

router.post("/submit-suggested-scale", M.verifyToken(ROLE), C.submitProfScale);

router.get(
  "/suggested-scale-fillup-check/:assessmentId",
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
  userProfCtrl.requestForAppointment
);

router.get(
  "/appointment-details/:appointmentId",
  M.verifyToken(ROLE),
  userProfCtrl.getAppointmentDetailsForUser
);

router.get(
  "/find-suggested-scales/:profId",
  M.verifyToken(ROLE),
  userProfCtrl.findSuggestedScales
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
