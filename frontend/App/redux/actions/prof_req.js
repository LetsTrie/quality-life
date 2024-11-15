import {
  PROF_REQUEST_ADD,
  PROF_REQUEST_REMOVE,
  PROF_REQUEST_SEEN,
  NEW_NOTIFICATION_COUNT_MINUS,
  DELETE_ALL_PROF_REQUEST,
} from './types';

export const addClientRequests = (requests) => (dispatch) => {
  dispatch({
    type: PROF_REQUEST_ADD,
    payload: { requests },
  });
};

export const seenRequestAction = (request) => (dispatch) => {
  if (!request.hasProfViewed) {
    dispatch({
      type: PROF_REQUEST_SEEN,
      payload: { _id: request._id },
    });

    dispatch({
      type: NEW_NOTIFICATION_COUNT_MINUS,
      payload: {
        noti_type: 'APPOINTMENT_REQUESTED',
      },
    });
  }
};

export const removeClientRequests = (request) => (dispatch) => {
  dispatch({
    type: PROF_REQUEST_REMOVE,
    payload: { _id: request._id },
  });
};

export const clearClientRequests = () => (dispatch) => {
  dispatch({
    type: DELETE_ALL_PROF_REQUEST
  });
};

