import axios from 'axios';
import { endpoints } from './endpoints';
import {
  configHeaders,
  sendErrorResponse,
  sendErrorResponseV2,
  sendSuccessResponse,
} from './utils';
import BaseUrl from '../config/BaseUrl';

export const getUserInformations = async ({ jwtToken }) => {
  try {
    console.log('API: ', endpoints.USER_INFO);
    const response = await axios.get(endpoints.USER_INFO, {
      headers: configHeaders({ jwtToken }),
    });

    return sendSuccessResponse(response.data.user);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

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

export const login = async ({ email, password }) => {
  try {
    console.log('API: ', endpoints.LOGIN);
    const response = await axios.post(endpoints.LOGIN, { email, password });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const register = async ({ email, password }) => {
  try {
    console.log('API: ', endpoints.REGISTER);
    const response = await axios.post(endpoints.REGISTER, { email, password });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const submitAdditionalInfo = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.USER_ADDITIONAL_INFO);
    const response = await axios.post(endpoints.USER_ADDITIONAL_INFO, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const updateUserProfile = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.UPDATE_PROFILE);
    const response = await axios.post(endpoints.UPDATE_PROFILE, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.user);
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const FromProfessional = async ({ jwtToken }) => {
  try {
    console.log('API: ', endpoints.USER_PROFILE);
    const response = await axios.get(endpoints.USER_PROFILE, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.user);
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

export const getAppointments = async ({ jwtToken, page = 1 }) => {
  try {
    const endpoint = endpoints.GET_APPOINTMENTS + `?page=${page}`;
    console.log('API: ', endpoint);
    const response = await axios.get(endpoint, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    console.log(error);
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

export const deleteProfAccount = async ({ profId, jwtToken }) => {
  try {
    console.log('API: ', endpoints.DELETE_PROF_ACCOUNT);
    const response = await axios.delete(endpoints.DELETE_PROF_ACCOUNT + profId, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse(response.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const profLogin = async (payload) => {
  try {
    console.log('API: ', endpoints.PROF_LOGIN);
    const response = await axios.post(endpoints.PROF_LOGIN, payload);
    return sendSuccessResponse(response.data.data);
  } catch (error) {
    return sendErrorResponseV2(error);
  }
};

export const registerProfStep1 = async (payload) => {
  try {
    console.log('API: ', endpoints.PROF_REGISTER_STEP1);
    await axios.post(endpoints.PROF_REGISTER_STEP1, payload);
    return sendSuccessResponse();
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const registerProfStep2 = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.PROF_REGISTER_STEP2);
    await axios.post(endpoints.PROF_REGISTER_STEP2, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse();
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const registerProfStep3 = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.PROF_REGISTER_STEP3);
    await axios.post(endpoints.PROF_REGISTER_STEP3, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse();
  } catch (error) {
    return sendErrorResponse(error);
  }
};

export const registerProfStep4 = async ({ payload, jwtToken }) => {
  try {
    console.log('API: ', endpoints.PROF_REGISTER_STEP4);
    await axios.post(endpoints.PROF_REGISTER_STEP4, payload, {
      headers: configHeaders({ jwtToken }),
    });
    return sendSuccessResponse();
  } catch (error) {
    return sendErrorResponse(error);
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
