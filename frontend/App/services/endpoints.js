import BaseUrl from '../config/BaseUrl';

export const endpoints = {
  LOGIN: `${BaseUrl}/user/sign-in`,
  REGISTER: `${BaseUrl}/user/sign-up`,
  REFRESH_TOKEN: `${BaseUrl}/auth/refresh-token`,
  USER_ADDITIONAL_INFO: `${BaseUrl}/user/add-info`,
  UPDATE_PROFILE: `${BaseUrl}/user/update/profile`,
  USER_PROFILE: `${BaseUrl}/user/all-informations`,
  PROF_PROFILE: `${BaseUrl}/prof/all-informations`,
  APPOINTMENT_DETAILS: `${BaseUrl}/user/appointment-details`,
  FIND_SUGGESTED_SCALES_FOR_USER: `${BaseUrl}/user/find-suggested-scales`,

  PROF_LOGIN: `${BaseUrl}/prof/login`,
  PROF_REGISTER_STEP1: `${BaseUrl}/prof/register/step-1`,
  PROF_REGISTER_STEP2: `${BaseUrl}/prof/register/step-2`,
  PROF_REGISTER_STEP3: `${BaseUrl}/prof/register/step-3`,
  PROF_REGISTER_STEP4: `${BaseUrl}/prof/register/step-4`,
  DELETE_PROF_ACCOUNT: `${BaseUrl}/prof/delete-account`,

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
  ADD_USER_RATING: `${BaseUrl}/user/add-rating`,

  PROF_UNREAD_NOTIFICATIONS: `${BaseUrl}/prof/notifications/unread`,
  APPOINTMENT_DETAILS_FOR_PROFESSIONAL: `${BaseUrl}/prof/appointment`,

  RECENT_10_TEST_RESULTS_HISTORY: `${BaseUrl}/user/result-history-data`,

  // NOTIFICATION SECTION
  USER_UNREAD_NOTIFICATION_COUNT: `${BaseUrl}/notifications/unread-count/u`,
  PROF_UNREAD_NOTIFICATION_COUNT: `${BaseUrl}/notifications/unread-count/p`,

  USER_NOTIFICATIONS: `${BaseUrl}/notifications/all/u`,
  PROF_NOTIFICATIONS: `${BaseUrl}/notifications/all/p`,

  CHECK_IF_ASSESSMENT_IS_ALREADY_TAKEN: `${BaseUrl}/user/suggested-scale-fillup-check`,
  SUBMIT_SUGGESTED_SCALE: `${BaseUrl}/user/submit-suggested-scale`,

  PRIMARY_TEST_DETAILS: `${BaseUrl}/prof/primary-test-details`,
  GET_SUGGESTED_SCALES_BY_CLIENT: `${BaseUrl}/prof/scales`,
  ASSESSMENT_DETAILS: `${BaseUrl}/prof/assessment`,
};
