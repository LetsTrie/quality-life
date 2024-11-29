import {
  SET_PROFESSIONAL_INFO,
  PROF_SIGN_OUT,
  NEW_NOTIFICATION_COUNT,
  DELETE_ALL_PROF_REQUEST,
  DELETE_ALL_PROF_NOTIFICATION,
  DELETE_ALL_CLIENT_REQUEST,
  UPDATE_PROFILE_PROF,
} from './types';

export const storeProfessionalsProfile = (prof) => (dispatch) => {
  dispatch({
    type: SET_PROFESSIONAL_INFO,
    payload: { prof },
  });
};

export const logoutAction = () => (dispatch) => {
  dispatch({ type: PROF_SIGN_OUT });
  dispatch({ type: DELETE_ALL_PROF_REQUEST });
  dispatch({ type: DELETE_ALL_PROF_NOTIFICATION });
  dispatch({ type: DELETE_ALL_CLIENT_REQUEST });
};

export const numOfNewNotificationsAction = (a, b) => (dispatch) => {
  dispatch({
    type: NEW_NOTIFICATION_COUNT,
    payload: { numOfNewNotifications: a, numOfNewClientRequests: b },
  });
};

export const updateProfileActionProf = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_PROFILE_PROF,
    payload: { ...data },
  });
};
