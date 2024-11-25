import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { createContext, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import constants from '../../navigation/constants';
import {
  DELETE_ALL_CLIENT_REQUEST,
  DELETE_ALL_PROF_NOTIFICATION,
  DELETE_ALL_PROF_REQUEST,
  DELETE_PROFILE,
  PROF_SIGN_OUT,
  SIGN_OUT,
} from '../../redux/actions/types';
import { ToastAndroid } from 'react-native';
import { refreshTokener } from '../../services/api';
import { setAuthToken } from '../../redux/utils';
import axios from 'axios';
import { sendErrorResponseV2, sendSuccessResponse } from '../../services/utils';
import { RoleEnum } from '../../utils/roles';

const HelperContext = createContext();

export const HelperProvider = ({ children }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { role, accessToken, refreshToken } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch({ type: SIGN_OUT });
    dispatch({ type: PROF_SIGN_OUT });
    dispatch({ type: DELETE_PROFILE });
    dispatch({ type: DELETE_ALL_PROF_REQUEST });
    dispatch({ type: DELETE_ALL_PROF_NOTIFICATION });
    dispatch({ type: DELETE_ALL_CLIENT_REQUEST });

    const routes = [{ name: constants.WELCOME }];
    if (role === RoleEnum.PROFESSIONAL) routes.push({ name: constants.PROF_LOGIN });
    else routes.push({ name: constants.LOGIN });

    navigation.reset({ index: 0, routes });
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const ApiExecutor = useCallback(
    async ({ endpoint, method = 'GET', payload = {}, headers = {} }) => {
      try {
        console.log(`Executing API: ${endpoint}, Method: ${method}`);

        console.log('Access Token:', accessToken);

        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...headers,
        };

        const response = await axios({
          url: endpoint,
          method,
          headers,
          data: payload,
        });

        return sendSuccessResponse(response?.data?.data);
      } catch (error) {
        const isTokenExpired =
          error.response?.status === 401 && error.response?.data?.type === 'InvalidToken';

        if (isTokenExpired) {
          ToastAndroid.show('Refreshing token...', ToastAndroid.SHORT);

          const maxRetries = 3;
          let attempts = 0;

          while (attempts < maxRetries) {
            try {
              const refreshResponse = await refreshTokener({ refreshToken });

              if (refreshResponse.success) {
                ToastAndroid.show('Token refreshed successfully.', ToastAndroid.SHORT);

                dispatch(
                  setAuthToken(
                    role,
                    refreshResponse.data.accessToken,
                    refreshResponse.data.refreshToken
                  )
                );

                headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
                return await ApiExecutor({ endpoint, method, payload, headers });
              }
            } catch (tokenError) {
              console.error(`Token refresh attempt ${attempts + 1} failed.`, tokenError);
            }

            attempts += 1;
          }

          ToastAndroid.show('Token refresh failed. Logging out...', ToastAndroid.LONG);
          logout();
        } else {
          console.log(error);
          return sendErrorResponseV2(error);
        }
      }
    },
    [role, accessToken]
  );

  const processApiError = async (response) => {
    console.log('>>processApiError:', response);
    // Placeholder for additional error handling logic
  };

  return (
    <HelperContext.Provider value={{ logout, processApiError, ApiExecutor }}>
      {children}
    </HelperContext.Provider>
  );
};

export const useHelper = () => useContext(HelperContext);
