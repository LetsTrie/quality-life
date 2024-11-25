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

router.get("/all", professionalController.getAllProfs);
router.post("/action", professionalController.profAction);

router.delete(
  "/:profId",
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
  professionalController.getUnreadNotifications
);
router.post(
  "/notifications/seen",
  M.verifyToken(ROLE),
  professionalController.seenNotification
);

router.get(
  "/recently-contacted",
  M.verifyToken(ROLE),
  professionalController.recentlyContactedClients
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

//ClinicalActL30
router.post(
  "/table/getClinicalActL30",
  professionalController.getClinicalActL30
);
router.post(
  "/table/createClinicalActL30",
  professionalController.createClinicalActL30
);
router.post(
  "/table/delClinicalActL30",
  professionalController.delClinicalActL30
);
router.post(
  "/table/updateClinicalActL30",
  professionalController.updateClinicalActL30
);

//PDAL30_1_1
router.post("/table/getPDAL30_1_1", professionalController.getPDAL30_1_1);
router.post("/table/createPDAL30_1_1", professionalController.createPDAL30_1_1);
router.post("/table/delPDAL30_1_1", professionalController.delPDAL30_1_1);
router.post("/table/updatePDAL30_1_1", professionalController.updatePDAL30_1_1);

// Supervision
router.post("/table/getSupervision", professionalController.getSupervision);
router.post(
  "/table/createSupervision",
  professionalController.createSupervision
);
router.post("/table/delSupervision", professionalController.delSupervision);
router.post(
  "/table/updateSupervision",
  professionalController.updateSupervision
);

// SeminarWorkshop
router.post(
  "/table/getSeminarWorkshop",
  professionalController.getSeminarWorkshop
);
router.post(
  "/table/createSeminarWorkshop",
  professionalController.createSeminarWorkshop
);
router.post(
  "/table/delSeminarWorkshop",
  professionalController.delSeminarWorkshop
);
router.post(
  "/table/updateSeminarWorkshop",
  professionalController.updateSeminarWorkshop
);

// Conference
router.post("/table/getConference", professionalController.getConference);
router.post("/table/createConference", professionalController.createConference);
router.post("/table/delConference", professionalController.delConference);
router.post("/table/updateConference", professionalController.updateConference);

//Research
router.post("/table/getResearch", professionalController.getResearch);
router.post("/table/createResearch", professionalController.createResearch);
router.post("/table/delResearch", professionalController.delResearch);
router.post("/table/updateResearch", professionalController.updateResearch);

//OtherPAL30
router.post("/table/getOtherPAL30", professionalController.getOtherPAL30);
router.post("/table/createOtherPAL30", professionalController.createOtherPAL30);
router.post("/table/delOtherPAL30", professionalController.delOtherPAL30);
router.post("/table/updateOtherPAL30", professionalController.updateOtherPAL30);

//SystemicCL
router.post("/table/getSystemicCL", professionalController.getSystemicCL);
router.post("/table/createSystemicCL", professionalController.createSystemicCL);
router.post("/table/delSystemicCL", professionalController.delSystemicCL);
router.post("/table/updateSystemicCL", professionalController.updateSystemicCL);

//PsychodramaDoc
router.post(
  "/table/getPsychodramaDoc",
  professionalController.getPsychodramaDoc
);
router.post(
  "/table/createPsychodramaDoc",
  professionalController.createPsychodramaDoc
);
router.post(
  "/table/delPsychodramaDoc",
  professionalController.delPsychodramaDoc
);
router.post(
  "/table/updatePsychodramaDoc",
  professionalController.updatePsychodramaDoc
);

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
