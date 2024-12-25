import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { createContext, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import constants from '../../navigation/constants';
import {
  RESET_NOTIFICATION_COUNT,
  DELETE_ALL_PROF_REQUEST,
  DELETE_PROFILE,
  PROF_SIGN_OUT,
  SIGN_OUT,
} from '../../redux/actions/types';
import { ToastAndroid } from 'react-native';
import { ApiDefinitions, refreshTokener } from '../../services/api';
import { setAuthToken } from '../../redux/utils';
import axios from 'axios';
import { sendErrorResponse, sendSuccessResponse } from '../../services/utils';
import { RoleEnum, isUser } from '../../utils/roles';
import { setUnreadNotificationCount } from '../../redux/actions';
import * as Sentry from '@sentry/react-native';

const HelperContext = createContext();
const INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE:';

export const HelperProvider = ({ children }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { role, accessToken, refreshToken } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch({ type: SIGN_OUT });
    dispatch({ type: PROF_SIGN_OUT });
    dispatch({ type: DELETE_PROFILE });
    dispatch({ type: DELETE_ALL_PROF_REQUEST });
    dispatch({ type: RESET_NOTIFICATION_COUNT });

    const routes = [{ name: constants.WELCOME }];
    if (role === RoleEnum.PROFESSIONAL) routes.push({ name: constants.PROF_LOGIN });
    else routes.push({ name: constants.LOGIN });

    navigation.reset({ index: 0, routes });
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const ApiExecutor = useCallback(
    async ({ endpoint, method = 'GET', payload = {}, headers = {} }) => {
      try {
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
          error?.response?.status === 401 && error?.response?.data?.type === 'InvalidToken';

        const isIncompleteProfile =
          error?.response?.status === 401 &&
          error?.response?.data?.type?.startsWith?.(INCOMPLETE_PROFILE);

        const isEmailNotVerified =
          error?.response?.status === 401 && error?.response?.data?.type === 'EmailNotVerified';

        if (isEmailNotVerified) {
          ToastAndroid.show('Please verify your email', ToastAndroid.SHORT);

          try {
            const { accountType, email } = error?.response?.data?.errors[0]?.data;
            navigation.navigate(constants.EMAIL_VERIFICATION_PAGE, {
              accountType,
              email,
            });
          } catch (error) {
            console.error(error);
          }

          return sendErrorResponse(error);
        }

        if (isIncompleteProfile) {
          const step = parseInt(
            error.response?.data?.type?.split(INCOMPLETE_PROFILE + 'STEP:')[1],
            10
          );

          if (role === RoleEnum.PROFESSIONAL) {
            if (step === 1) {
              navigation.navigate(constants.PROF_REGISTER_STEP_2);
            } else if (step === 2) {
              navigation.navigate(constants.PROF_REGISTER_STEP_3);
            } else if (step === 3) {
              navigation.navigate(constants.PROF_REGISTER_STEP_4);
            } else {
              navigation.navigate(constants.PROF_HOMEPAGE);
            }
          } else if (role === RoleEnum.USER) {
            navigation.navigate(constants.REGISTER_WITH_EXTRA_INFORMATION);
          }

          return sendErrorResponse(error);
        }

        if (isTokenExpired) {
          // ToastAndroid.show('Refreshing token...', ToastAndroid.SHORT);

          const maxRetries = 3;
          let attempts = 0;

          while (attempts < maxRetries) {
            try {
              const refreshResponse = await refreshTokener({ refreshToken });

              if (refreshResponse.success) {
                // ToastAndroid.show('Token refreshed successfully.', ToastAndroid.SHORT);

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
              // console.error(`Token refresh attempt ${attempts + 1} failed.`, tokenError);
            }

            attempts += 1;
          }

          ToastAndroid.show('Logging out...', ToastAndroid.LONG);
          logout();

          return;
        }

        Sentry.captureException(error);
        return sendErrorResponse(error);
      }
    },
    [role, accessToken]
  );

  const refreshNotificationCount = async () => {
    const response = await ApiExecutor(
      ApiDefinitions.getNotificationsCount({
        role,
      })
    );

    if (!response.success) return;
    dispatch(setUnreadNotificationCount(response.data.unreadNotificationCount));
  };

  const redirectToHomepage = () => {
    if (isUser(role)) {
      navigation.navigate(constants.HOMEPAGE);
    } else {
      navigation.navigate(constants.PROF_HOMEPAGE);
    }
  };

  return (
    <HelperContext.Provider
      value={{ logout, ApiExecutor, refreshNotificationCount, redirectToHomepage }}
    >
      {children}
    </HelperContext.Provider>
  );
};

export const useHelper = () => useContext(HelperContext);
