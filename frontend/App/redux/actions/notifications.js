import { SET_UNREAD_NOTIFICATION_COUNT } from './types';

export const setUnreadNotificationCount = (unreadCount) => (dispatch) => {
  dispatch({
    type: SET_UNREAD_NOTIFICATION_COUNT,
    payload: { unreadCount },
  });
};
