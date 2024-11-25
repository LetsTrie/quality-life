const router = require("express").Router();
const C = require("../controllers/user");
const userProfCtrl = require("../controllers/user-professional");
const M = require("../middlewares/authentication");

const AuthCtrl = require("../controllers/auth");
router.post("/sign-in", AuthCtrl.signIn);
router.post("/sign-up", AuthCtrl.signUp);

router.post("/intro/profile", M.verifyToken("user"), C.submitAdditionalInfo);
router.post("/test", M.verifyToken("user"), C.anyTestSubmit);
router.get("/homepage", M.verifyToken("user"), C.userHomepage);
router.post("/intro-Test-Submit", M.verifyToken("user"), C.introTestSubmit);

router.get("/profile/all", M.verifyToken("user"), C.getProfileDetails);
router.get("/all-information", M.verifyToken("user"), C.getAllInformation);
router.post("/seen-video/:videoUrl", M.verifyToken("user"), C.submitAVideo);

router.post("/rating", M.verifyToken("user"), C.rating);
router.post("/update/profile", M.verifyToken("user"), C.updateProfile);

router.get("/notifications", M.verifyToken("user"), C.userNotifications);
router.get(
  "/notifications/unread/h/",
  M.verifyToken("user"),
  C.numberOfNotifications
);

router.get("/all", C.allUsers);
router.post("/userInfo", C.userInfo);
router.post("/delete", C.userDelete);
router.post("/error", C.error);
router.post("/notification/seen/", C.seenNotification);

router.post("/submit-prof-scale", M.verifyToken("user"), C.submitProfScale);
router.post(
  "/suggested-scale/check",
  M.verifyToken("user"),
  C.checkSuggestedScale
);

router.get(
  "/result-history-data/:testType",
  M.verifyToken("user"),
  C.resultHistoryTableData
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

router.get(
  "/professionals",
  M.verifyToken("user"),
  userProfCtrl.findProfessionals
);

router.post(
  "/take-appointment",
  M.verifyToken("user"),
  userProfCtrl.takeAppointment
);

router.get(
  "/appointment-details/:appointmentId",
  M.verifyToken("user"),
  userProfCtrl.getAppointmentDetailsForUser
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
