const router = require("express").Router();
const C = require("../controllers/prof");
const userProfCtrl = require("../controllers/user-professional");
const M = require("../middlewares/authentication");
const validate = require("../middlewares/validate");
const { profValidation } = require("../validations");

router.post(
  "/register/s1",
  validate(profValidation.registerStep1),
  C.profRegStep1
);

router.get("/all", C.getAllProfs);
router.post("/action", C.profAction);
router.post("/login", C.profLogin);

router.post(
  "/register/s2",
  M.verifyToken("prof"),
  validate(profValidation.registerStep2),
  C.profRegStep2
);

router.post("/register/s3", M.verifyToken("prof"), C.profRegStep3);
router.post("/register/s4", M.verifyToken("prof"), C.profRegStep4);

router.delete("/:profId", M.verifyToken("prof"), C.deleteProfessionalAccount);
router.put(
  "/:profId/visibility",
  validate(profValidation.profVisibility),
  C.profVisibility
);

router.get("/homepage", M.verifyToken("prof"), C.getHomepageInformationProf);
router.get(
  "/notifications/unread",
  M.verifyToken("prof"),
  C.getUnreadNotifications
);
router.post("/notifications/seen", M.verifyToken("prof"), C.seenNotification);

router.get(
  "/recently-contacted",
  M.verifyToken("prof"),
  C.recentlyContactedClients
);
router.post("/add-as-client", M.verifyToken("prof"), C.AddasClient);
router.get("/my-clients", M.verifyToken("prof"), C.myClients);

router.post("/suggest-scale", M.verifyToken("prof"), C.suggestAscale);
router.get("/user-profile/:userId", C.getUserCompleteProfile);
router.get("/test-details/:testId", C.getCompleteTestResult);

router.post("/result-suggested-scale", M.verifyToken("prof"), C.getScaleResult);

router.get("/allProf", C.allProf);

router.post("/:profId/update/profile", M.verifyToken("prof"), C.updateProfile);
router.post("/getCode", C.getVerificationCode);
router.post("/changePassword", C.changePassword);

//ClinicalActL30
router.post("/table/getClinicalActL30", C.getClinicalActL30);
router.post("/table/createClinicalActL30", C.createClinicalActL30);
router.post("/table/delClinicalActL30", C.delClinicalActL30);
router.post("/table/updateClinicalActL30", C.updateClinicalActL30);

//PDAL30_1_1
router.post("/table/getPDAL30_1_1", C.getPDAL30_1_1);
router.post("/table/createPDAL30_1_1", C.createPDAL30_1_1);
router.post("/table/delPDAL30_1_1", C.delPDAL30_1_1);
router.post("/table/updatePDAL30_1_1", C.updatePDAL30_1_1);

// Supervision
router.post("/table/getSupervision", C.getSupervision);
router.post("/table/createSupervision", C.createSupervision);
router.post("/table/delSupervision", C.delSupervision);
router.post("/table/updateSupervision", C.updateSupervision);

// SeminarWorkshop
router.post("/table/getSeminarWorkshop", C.getSeminarWorkshop);
router.post("/table/createSeminarWorkshop", C.createSeminarWorkshop);
router.post("/table/delSeminarWorkshop", C.delSeminarWorkshop);
router.post("/table/updateSeminarWorkshop", C.updateSeminarWorkshop);

// Conference
router.post("/table/getConference", C.getConference);
router.post("/table/createConference", C.createConference);
router.post("/table/delConference", C.delConference);
router.post("/table/updateConference", C.updateConference);

//Research
router.post("/table/getResearch", C.getResearch);
router.post("/table/createResearch", C.createResearch);
router.post("/table/delResearch", C.delResearch);
router.post("/table/updateResearch", C.updateResearch);

//OtherPAL30
router.post("/table/getOtherPAL30", C.getOtherPAL30);
router.post("/table/createOtherPAL30", C.createOtherPAL30);
router.post("/table/delOtherPAL30", C.delOtherPAL30);
router.post("/table/updateOtherPAL30", C.updateOtherPAL30);

//SystemicCL
router.post("/table/getSystemicCL", C.getSystemicCL);
router.post("/table/createSystemicCL", C.createSystemicCL);
router.post("/table/delSystemicCL", C.delSystemicCL);
router.post("/table/updateSystemicCL", C.updateSystemicCL);

//PsychodramaDoc
router.post("/table/getPsychodramaDoc", C.getPsychodramaDoc);
router.post("/table/createPsychodramaDoc", C.createPsychodramaDoc);
router.post("/table/delPsychodramaDoc", C.delPsychodramaDoc);
router.post("/table/updatePsychodramaDoc", C.updatePsychodramaDoc);

// ****************************************************************
// ****************************************************************
// ****************************************************************

router.post(
  "/appointment-seen/:appointmentId",
  M.verifyToken("prof"),
  userProfCtrl.appointmentSeen
);

router.get(
  "/client-requests",
  M.verifyToken("prof"),
  userProfCtrl.showAllClientRequests
);

router.post(
  "/appointment-response/:appointmentId",
  M.verifyToken("prof"),
  userProfCtrl.respondToAppointment
);

// ****************************************************************
// ****************************************************************
// ****************************************************************

module.exports = router;
