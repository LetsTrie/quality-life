import {
  PROF_NOTIFICATION_ADD,
  PROF_NOTIFICATION_REMOVE,
  PROF_NOTIFICATION_ADD_MORE,
  PROF_NOTIFICATION_SEEN,
  DELETE_ALL_PROF_NOTIFICATION,
} from '../actions/types';

const initialState = {
  notifications: [],
};

export default function (state = initialState, action) {
  let id, index;
  switch (action.type) {
    case PROF_NOTIFICATION_ADD:
      return {
        notifications: action.payload.notifications,
      };

    case DELETE_ALL_PROF_NOTIFICATION:
      return { ...initialState };

    case PROF_NOTIFICATION_REMOVE:
      id = action.payload._id;
      index = state.notifications.findIndex((n) => n._id === id);
      return {
        notifications: [
          ...state.notifications.slice(0, index),
          ...state.notifications.slice(index + 1),
        ],
      };

    case PROF_NOTIFICATION_ADD_MORE:
      return {
        notifications: [
          ...state.notifications,
          ...action.payload.notifications,
        ],
      };

    case PROF_NOTIFICATION_SEEN:
      id = action.payload._id;
      index = state.notifications.findIndex((n) => n._id === id);
      let newNotifications = state.notifications;
      newNotifications[index].hasSeen = true;
      return { notifications: [...newNotifications] };

    default:
      return state;
  }
}
