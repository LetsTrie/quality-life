import { ToastAndroid } from 'react-native';
import { isNotEmptyArray } from '../utils/array';

export const configHeaders = ({ jwtToken }) => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };
};

export const sendSuccessResponse = (data = {}) => {
  return { success: true, data };
};

export const sendErrorResponse = (error) => {
  console.log(error.response.data);
  if (error?.response?.status === 401) {
    return { success: false, status: 401, type: 'Unauthorized', error: error.response.data };
  }
  return { success: false, status: 500, type: 'Internal Server Error', error: error.response.data };
};

export const sendErrorResponseV2 = (error) => {
  try {
    console.log(error.response.data.message);
    const { errors, status, type, message } = error.response.data;
    
    const errorMessage = isNotEmptyArray(errors)
      ? errors.map((e) => e.message).join(', ')
      : message;

    ToastAndroid.show(errorMessage, ToastAndroid.LONG);

    return {
      success: false,
      status: status,
      type: type,
      error: {
        message: errorMessage,
      },
    };
  } catch (error) {
    console.log(error.message);
    return {
      success: false,
      status: 500,
      type: 'InternalServerError',
      error: {
        message: 'Internal Server Error',
      },
    };
  }
};
