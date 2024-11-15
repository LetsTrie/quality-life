import { SIGN_IN, SIGN_OUT, DELETE_PROFILE } from './types';

export const loginAction = (_id, jwtToken) => (dispatch) => {
  dispatch({ type: SIGN_IN, payload: { _id, jwtToken } });
};

export const setUserAuthToken = ({ _id, jwtToken }) => {
  return (dispatch) => {
    dispatch({ type: SIGN_IN, payload: { _id, jwtToken, type: 'USER' } });
  };
};

export const setProfAuthToken = ({ _id, jwtToken }) => {
  return (dispatch) => {
    dispatch({ type: SIGN_IN, payload: { _id, jwtToken, type: 'PROF' } });
  };
};

export const logoutAction = () => (dispatch) => {
  dispatch({ type: SIGN_OUT });
  dispatch({ type: DELETE_PROFILE });
};
