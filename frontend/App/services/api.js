import axios from 'axios';
import { endpoints } from './endpoints';
import { sendErrorResponse, sendSuccessResponse } from './utils';
import { isProfessional, isUser } from '../utils/roles';

export const updateProfProfile = async ({ _id, payload, jwtToken }) => {
  throw new Error('Not Implemented');

  // try {
  //   const apiUrl = `${BaseUrl}/prof/${_id}/update/profile`;
  //   const response = await axios.post(apiUrl, payload, { headers: configHeaders({ jwtToken }) });
  //   return sendSuccessResponse(response.data.data.professional);
  // } catch (error) {
  //   return sendErrorResponse(error);
  // }
};

export const refreshTokener = async ({ refreshToken }) => {
  try {
    const endpoint = endpoints.REFRESH_TOKEN;
    // console.log('API: ', endpoint);
    const response = await axios.post(endpoint, { refreshToken });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const ApiDefinitions = {
  registerProfessionalStep1: ({ payload }) => ({
    endpoint: endpoints.PROF_REGISTER_STEP1,
    method: 'POST',
    payload,
  }),
  registerProfessionalStep2: ({ payload }) => ({
    endpoint: endpoints.PROF_REGISTER_STEP2,
    method: 'POST',
    payload,
  }),
  registerProfessionalStep3: ({ payload }) => ({
    endpoint: endpoints.PROF_REGISTER_STEP3,
    method: 'POST',
    payload,
  }),
  registerProfessionalStep4: ({ payload }) => ({
    endpoint: endpoints.PROF_REGISTER_STEP4,
    method: 'POST',
    payload,
  }),
  loginProfessional: ({ payload }) => ({
    endpoint: endpoints.PROF_LOGIN,
    method: 'POST',
    payload,
  }),
  deleteProfessionalAccount: () => ({
    endpoint: endpoints.DELETE_PROF_ACCOUNT,
    method: 'POST',
  }),
  getProfessionalHomepageNotificationCount: () => ({
    endpoint: endpoints.PROF_HOMEPAGE_NOTIFICATION_COUNT,
  }),

  getAppointments: ({ page = 1 }) => ({
    endpoint: endpoints.GET_APPOINTMENTS + `?page=${page}`,
  }),
  userLogin: ({ payload }) => ({
    endpoint: endpoints.LOGIN,
    method: 'POST',
    payload,
  }),
  userProfile: () => ({
    endpoint: endpoints.USER_PROFILE,
  }),
  getProfessionalsProfile: () => ({
    endpoint: endpoints.PROF_PROFILE,
  }),
  submitTest: ({ payload }) => ({
    endpoint: endpoints.SUBMIT_TEST,
    method: 'POST',
    payload,
  }),
  seenVideo: ({ videoId }) => ({
    endpoint: endpoints.SEEN_VIDEO + videoId,
    method: 'POST',
  }),
  registerAsUser: ({ payload }) => ({
    endpoint: endpoints.REGISTER,
    method: 'POST',
    payload,
  }),
  additionalInfo: ({ payload }) => ({
    endpoint: endpoints.USER_ADDITIONAL_INFO,
    method: 'POST',
    payload,
  }),
  updateUserProfile: ({ payload }) => ({
    endpoint: endpoints.UPDATE_PROFILE,
    method: 'POST',
    payload,
  }),
  resetUserPassword: ({ payload }) => ({
    endpoint: endpoints.RESET_PASSWORD,
    method: 'POST',
    payload,
  }),
  deleteUserAccount: () => ({
    endpoint: endpoints.DELETE_ACCOUNT,
    method: 'POST',
  }),
  submitUserRating: ({ payload }) => ({
    endpoint: endpoints.ADD_USER_RATING,
    method: 'POST',
    payload,
  }),
  getAllProfessionalsForUser: ({ page = 1 }) => ({
    endpoint: endpoints.FIND_PROFESSIONALS_FOR_USER + `?page=${page}`,
  }),
  findAppointmentById: ({ appointmentId }) => ({
    endpoint: endpoints.APPOINTMENT_DETAILS + '/' + appointmentId,
  }),
  findSuggestedScales: ({ professionalId }) => ({
    endpoint: endpoints.FIND_SUGGESTED_SCALES_FOR_USER + '/' + professionalId,
  }),
  checkIfAssessmentIsAlreadyTaken: ({ assessmentId }) => ({
    endpoint: endpoints.CHECK_IF_ASSESSMENT_IS_ALREADY_TAKEN + '/' + assessmentId,
  }),
  submitSuggestedScale: ({ payload }) => ({
    endpoint: endpoints.SUBMIT_SUGGESTED_SCALE,
    method: 'POST',
    payload,
  }),
  requestForAppointment: ({ payload }) => ({
    endpoint: endpoints.TAKE_APPOINTMENT,
    method: 'POST',
    payload,
  }),
  seenAppointmentRequest: ({ appointmentId }) => ({
    endpoint: endpoints.SEEN_APPOINTMENT_REQUEST + '/' + appointmentId,
    method: 'POST',
  }),
  respondToClientRequest: ({ appointmentId, payload }) => ({
    endpoint: endpoints.RESPOND_TO_CLIENT_REQUEST + '/' + appointmentId,
    method: 'POST',
    payload,
  }),
  recent10TestResultsHistory: ({ type }) => ({
    endpoint: endpoints.RECENT_10_TEST_RESULTS_HISTORY + '/' + type,
  }),
  getProfessionalsClient: () => ({
    endpoint: endpoints.GET_PROFESSIONALS_CLIENT,
  }),
  getUserProfileForProfessional: ({ userId }) => ({
    endpoint: endpoints.GET_USER_PROFILE_FOR_PROFESSIONAL + '/' + userId,
  }),
  suggestScaleToClient: ({ payload }) => ({
    endpoint: endpoints.SUGGEST_SCALE_TO_CLIENT,
    method: 'POST',
    payload,
  }),
  getPrimaryTestResult: ({ testId }) => ({
    endpoint: endpoints.PRIMARY_TEST_DETAILS + '/' + testId,
  }),
  getSuggestedScalesByClient: ({ clientId }) => ({
    endpoint: endpoints.GET_SUGGESTED_SCALES_BY_CLIENT + '/' + clientId,
  }),
  getAssessmentDetails: ({ assessmentId }) => ({
    endpoint: endpoints.ASSESSMENT_DETAILS + '/' + assessmentId,
  }),

  // *******************************************************
  // **************=> Notification Counter <=***************
  // *******************************************************

  getNotificationsCount: ({ role }) => {
    if (isUser(role)) {
      return ApiDefinitions.getUsersUnreadNotificationCount();
    } else if (isProfessional(role)) {
      return ApiDefinitions.getProfessionalsUnreadNotificationCount();
    } else {
      throw new Error('Invalid role provided for notifications count');
    }
  },
  getUsersUnreadNotificationCount: () => ({
    endpoint: endpoints.USER_UNREAD_NOTIFICATION_COUNT,
  }),
  getProfessionalsUnreadNotificationCount: () => ({
    endpoint: endpoints.PROF_UNREAD_NOTIFICATION_COUNT,
  }),

  // *******************************************************
  // ***************=> Notification Docs <=*****************
  // *******************************************************
  getNotifications: ({ role, page = 1 }) => {
    if (isUser(role)) {
      return ApiDefinitions.getUsersNotifications({ page });
    } else if (isProfessional(role)) {
      return ApiDefinitions.getProfessionalsNotifications({ page });
    } else {
      throw new Error('Invalid role provided for notifications count');
    }
  },
  getUsersNotifications: ({ page = 1 }) => ({
    endpoint: endpoints.USER_NOTIFICATIONS + `?page=${page}`,
  }),
  getProfessionalsNotifications: ({ page = 1 }) => ({
    endpoint: endpoints.PROF_NOTIFICATIONS + `?page=${page}`,
  }),
};
