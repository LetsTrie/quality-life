import {
  SET_PROFESSIONAL_INFO,
  NEW_NOTIFICATION_COUNT,
  UPDATE_PROFILE_PROF,
  UPDATE_VISIBLITY,
} from './types';

export const storeProfessionalsProfile = (prof) => (dispatch) => {
  dispatch({
    type: SET_PROFESSIONAL_INFO,
    payload: { prof },
  });
};

export const numOfNewNotificationsAction = (numOfNewClientRequests) => (dispatch) => {
  dispatch({
    type: NEW_NOTIFICATION_COUNT,
    payload: { numOfNewClientRequests },
  });
};

export const updateProfileActionProf = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_PROFILE_PROF,
    payload: { ...data },
  });
};

export const updateVisibilityInStore = (visibility) => {
  return {
    type: UPDATE_VISIBLITY,
    payload: { visibility },
  };
};
