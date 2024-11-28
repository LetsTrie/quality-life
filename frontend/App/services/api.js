import axios from 'axios';
import { endpoints } from './endpoints';
import {
  configHeaders,
  sendErrorResponse,
  sendErrorResponseV2,
  sendSuccessResponse,
} from './utils';
import BaseUrl from '../config/BaseUrl';

export const submitIntroTest = async ({ answers, score, isPostTest, jwtToken }) => {
  try {
    console.log('API: ', endpoints.INTRO_TEST);
    const response = await axios.post(
      endpoints.INTRO_TEST,
      { answers, score, postTest: isPostTest },
      { headers: configHeaders({ jwtToken }) }
    );
    return sendSuccessResponse(response.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const findProfessionalsForUser = async ({ jwtToken, page = 1 }) => {
  try {
    console.log('API: ', endpoints.FIND_PROFESSIONALS_FOR_USER);
    const response = await axios.get(endpoints.FIND_PROFESSIONALS_FOR_USER + `?page=${page}`, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const takeAppointment = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.TAKE_APPOINTMENT);
    const response = await axios.post(endpoints.TAKE_APPOINTMENT, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const seenAppointmentRequest = async ({ jwtToken, appointmentId }) => {
  try {
    const endpoint = endpoints.SEEN_APPOINTMENT_REQUEST + '/' + appointmentId;
    console.log('API: ', endpoint);
    const response = await axios.post(endpoint, {}, { headers: configHeaders({ jwtToken }) });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const respondToClientRequest = async ({ jwtToken, appointmentId, payload }) => {
  try {
    const endpoint = endpoints.RESPOND_TO_CLIENT_REQUEST + '/' + appointmentId;
    console.log('API: ', endpoint);
    const response = await axios.post(endpoint, payload, { headers: configHeaders({ jwtToken }) });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    console.log(error);
    return sendErrorResponseV2(error);
  }
};

export const updateProfProfile = async ({ _id, payload, jwtToken }) => {
  try {
    const apiUrl = `${BaseUrl}/prof/${_id}/update/profile`;
    const response = await axios.post(apiUrl, payload, { headers: configHeaders({ jwtToken }) });
    return sendSuccessResponse(response.data.data.professional);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const findAppointmentById = async ({ appointmentId, jwtToken }) => {
  try {
    const endpoint = endpoints.APPOINTMENT_DETAILS + '/' + appointmentId;
    console.log('API: ', endpoint);
    const response = await axios.get(endpoint, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const getProfessionalsClient = async ({ jwtToken }) => {
  try {
    const endpoint = endpoints.GET_PROFESSIONALS_CLIENT;
    console.log('API: ', endpoint);
    const response = await axios.get(endpoint, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const getUserProfileFromProfessional = async ({ jwtToken, userId }) => {
  try {
    const endpoint = endpoints.GET_USER_PROFILE_FOR_PROFESSIONAL + '/' + userId;
    console.log('API: ', endpoint);
    const response = await axios.get(endpoint, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const suggestScaleToClient = async ({ jwtToken, payload }) => {
  try {
    const endpoint = endpoints.SUGGEST_SCALE_TO_CLIENT;
    console.log('API: ', endpoint);
    console.log('Payload: ', payload);
    const response = await axios.post(endpoint, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const refreshTokener = async ({ refreshToken }) => {
  try {
    const endpoint = endpoints.REFRESH_TOKEN;
    console.log('API: ', endpoint);
    const response = await axios.post(endpoint, { refreshToken });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
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
  deleteProfessionalAccount: ({ profId }) => ({
    endpoint: endpoints.DELETE_PROF_ACCOUNT + profId,
    method: 'DELETE',
  }),
  getProfessionalHomepageNotificationCount: () => ({
    endpoint: endpoints.PROF_HOMEPAGE_NOTIFICATION_COUNT,
    method: 'GET',
  }),
  getAppointments: ({ page = 1 }) => ({
    endpoint: endpoints.GET_APPOINTMENTS + `?page=${page}`,
    method: 'GET',
  }),
  userLogin: ({ payload }) => ({
    endpoint: endpoints.LOGIN,
    method: 'POST',
    payload,
  }),
  userProfile: () => ({
    endpoint: endpoints.USER_PROFILE,
    method: 'GET',
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
};
