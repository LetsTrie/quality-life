const router = require("express").Router();
const NotificationCtrl = require("../controllers/notification");
const authMiddleware = require("../middlewares/authentication");

const paramRoles = {
  U: "user",
  P: "prof",
};

const verifyRole = (role) => (req, res, next) => {
  console.log(">>> VERIFY ROLE: ", req.params.role);
  authMiddleware.verifyToken(role)(req, res, next);
};

router.get(
  "/unread-count/:role",
  (req, res, next) =>
    verifyRole(paramRoles[req.params.role.toUpperCase()])(req, res, next),
  NotificationCtrl.getUnreadNotificationsCount
);

router.get(
  "/all/:role",
  (req, res, next) =>
    verifyRole(paramRoles[req.params.role.toUpperCase()])(req, res, next),
  NotificationCtrl.getNotifications
);

router.get(
  "/seen/:notificationId/:role",
  (req, res, next) =>
    verifyRole(paramRoles[req.params.role.toUpperCase()])(req, res, next),
  NotificationCtrl.seenNotification
);

module.exports = router;
