const { NotificationService } = require("../services");
const { asyncHandler, sendJSONresponse } = require("../utils");

const LIMIT = 10;

exports.getUnreadNotificationsCount = asyncHandler(async (req, res, _next) => {
  const nCount = await NotificationService.getUnreadNotificationsCount(
    req.user._id,
    req.isUser,
    req.isProfessional
  );

  return sendJSONresponse(res, 200, {
    data: { unreadNotificationCount: nCount },
  });
});

exports.getNotifications = asyncHandler(async (req, res, _next) => {
  const notificationsResponse = await NotificationService.getNotifications(
    req.user._id,
    req.isUser,
    req.isProfessional,
    req.query.page,
    LIMIT
  );

  return sendJSONresponse(res, 200, {
    data: notificationsResponse,
  });
});

exports.seenNotification = asyncHandler(async (req, res, _next) => {
  const { notificationId } = req.params;

  await NotificationService.seenNotificationById(notificationId);

  return sendJSONresponse(res, 200, {
    data: {},
  });
});
