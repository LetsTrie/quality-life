import { SIGN_IN } from './actions/types';

export const setAuthToken = (role, accessToken, refreshToken) => {
  console.log('setAuthToken: ', role, accessToken, refreshToken);

  return {
    type: SIGN_IN,
    payload: {
      role,
      accessToken,
      refreshToken,

      jwtToken: accessToken,
    },
  };
};
