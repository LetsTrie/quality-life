import { ToastAndroid } from 'react-native';
import { isNotEmptyArray } from '../utils/array';

export const sendSuccessResponse = (data = {}) => {
  return { success: true, data };
};

export const sendErrorResponse = (error) => {
  try {
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
    console.log(error);
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
