import { RESET_NOTIFICATION_COUNT, SET_UNREAD_NOTIFICATION_COUNT } from '../actions/types';

const initialState = {
  unreadCount: 0,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_UNREAD_NOTIFICATION_COUNT:
      return { unreadCount: action.payload.unreadCount };

    case RESET_NOTIFICATION_COUNT:
      return { ...initialState };

    default:
      return state;
  }
}
