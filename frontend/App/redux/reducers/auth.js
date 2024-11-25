import { SIGN_IN, SIGN_OUT } from '../actions/types';

const initialState = {
  _id: null,
  jwtToken: null,
  type: null,

  role: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SIGN_IN:
      return {
        ...state,
        _id: action.payload._id,
        jwtToken: action.payload.jwtToken,
        type: action.payload.type || 'USER',

        role: action.payload.role, // user or professional
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
      };
    case SIGN_OUT:
      return { ...initialState };
    default:
      return state;
  }
}
