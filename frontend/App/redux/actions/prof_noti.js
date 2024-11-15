import {
  PROF_NOTIFICATION_ADD,
  PROF_NOTIFICATION_REMOVE,
  PROF_NOTIFICATION_SEEN,
  PROF_NOTIFICATION_ADD_MORE,
  NEW_NOTIFICATION_COUNT_MINUS,
} from './types';

export const addNotificationAction = (notifications) => (dispatch) => {
  dispatch({
    type: PROF_NOTIFICATION_ADD,
    payload: { notifications },
  });
};

export const addMoreNotificationAction = (notifications) => (dispatch) => {
  dispatch({
    type: PROF_NOTIFICATION_ADD_MORE,
    payload: { notifications },
  });
};

export const seenNotificationAction = (notification) => (dispatch) => {
  if (!notification.hasSeen) {
    dispatch({
      type: PROF_NOTIFICATION_SEEN,
      payload: { _id: notification._id },
    });

    dispatch({
      type: NEW_NOTIFICATION_COUNT_MINUS,
      payload: {
        noti_type: notification.type,
      },
    });
  }
};

export const removeNotificationAction = (notification) => (dispatch) => {
  dispatch({
    type: PROF_NOTIFICATION_REMOVE,
    payload: { _id: notification._id },
  });
};
