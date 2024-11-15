import BaseUrl from '../config/BaseUrl';

export const endpoints = {
  USER_INFO: `${BaseUrl}/user/all-information`,
  INTRO_TEST: `${BaseUrl}/user/intro-Test-Submit`,
  LOGIN: `${BaseUrl}/auth/sign-in`,
  REGISTER: `${BaseUrl}/auth/sign-up`,
  USER_ADDITIONAL_INFO: `${BaseUrl}/user/intro/profile`,
  UPDATE_PROFILE: `${BaseUrl}/user/update/profile`,
  USER_PROFILE: `${BaseUrl}/user/all-information`,

  PROF_LOGIN: `${BaseUrl}/prof/login`,
  PROF_REGISTER_STEP1: `${BaseUrl}/prof/register/s1`,
  PROF_REGISTER_STEP2: `${BaseUrl}/prof/register/s2`,
  PROF_REGISTER_STEP3: `${BaseUrl}/prof/register/s3`,
  PROF_REGISTER_STEP4: `${BaseUrl}/prof/register/s4`,
  DELETE_PROF_ACCOUNT: `${BaseUrl}/prof/`,

  PROF_PROFILE_UPDATE: `${BaseUrl}/prof/update/profile`,
  FIND_PROFESSIONALS_FOR_USER: `${BaseUrl}/user/professionals`,
  TAKE_APPOINTMENT: `${BaseUrl}/user/take-appointment`,

  GET_APPOINTMENTS:`${BaseUrl}/prof/client-requests`,
  SEEN_APPOINTMENT_REQUEST: `${BaseUrl}/prof/appointment-seen`,
  RESPOND_TO_CLIENT_REQUEST: `${BaseUrl}/prof/appointment-response`,
};
