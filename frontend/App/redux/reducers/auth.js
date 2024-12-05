import { SIGN_IN, SIGN_OUT } from '../actions/types';

const initialState = {
  role: null,
  accessToken: null,
  refreshToken: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SIGN_IN:
      return {
        ...state,
        role: action.payload.role, // user or professional
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case SIGN_OUT:
      return { ...initialState };
    default:
      return state;
  }
}
