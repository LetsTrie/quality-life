import BaseUrl from '../config/BaseUrl';

export const endpoints = {
  INTRO_TEST: `${BaseUrl}/user/intro-Test-Submit`,
  LOGIN: `${BaseUrl}/user/sign-in`,
  REGISTER: `${BaseUrl}/user/sign-up`,
  REFRESH_TOKEN: `${BaseUrl}/auth/refresh-token`,
  USER_ADDITIONAL_INFO: `${BaseUrl}/user/add-info`,
  UPDATE_PROFILE: `${BaseUrl}/user/update/profile`,
  USER_PROFILE: `${BaseUrl}/user/all-information`,
  APPOINTMENT_DETAILS: `${BaseUrl}/user/appointment-details`,

  PROF_LOGIN: `${BaseUrl}/prof/login`,
  PROF_REGISTER_STEP1: `${BaseUrl}/prof/register/step-1`,
  PROF_REGISTER_STEP2: `${BaseUrl}/prof/register/step-2`,
  PROF_REGISTER_STEP3: `${BaseUrl}/prof/register/step-3`,
  PROF_REGISTER_STEP4: `${BaseUrl}/prof/register/step-4`,
  DELETE_PROF_ACCOUNT: `${BaseUrl}/prof/`,

  PROF_PROFILE_UPDATE: `${BaseUrl}/prof/update/profile`,
  FIND_PROFESSIONALS_FOR_USER: `${BaseUrl}/user/professionals`,
  TAKE_APPOINTMENT: `${BaseUrl}/user/take-appointment`,

  GET_APPOINTMENTS: `${BaseUrl}/prof/client-requests`,
  SEEN_APPOINTMENT_REQUEST: `${BaseUrl}/prof/appointment-seen`,
  RESPOND_TO_CLIENT_REQUEST: `${BaseUrl}/prof/appointment-response`,

  GET_PROFESSIONALS_CLIENT: `${BaseUrl}/prof/my-clients`,
  GET_USER_PROFILE_FOR_PROFESSIONAL: `${BaseUrl}/prof/user-profile`,

  SUGGEST_SCALE_TO_CLIENT: `${BaseUrl}/prof/suggest-scale`,
  PROF_HOMEPAGE_NOTIFICATION_COUNT: `${BaseUrl}/prof/homepage-notification-count`,
  SUBMIT_TEST: `${BaseUrl}/user/test`,

  SEEN_VIDEO: `${BaseUrl}/user/seen-video/`,
  RESET_PASSWORD: `${BaseUrl}/user/reset-password`,

  DELETE_ACCOUNT: `${BaseUrl}/user/delete-account`,
};
