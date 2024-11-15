import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import constants from '../../navigation/constants';
import { DELETE_ALL_CLIENT_REQUEST, DELETE_ALL_PROF_NOTIFICATION, DELETE_ALL_PROF_REQUEST, DELETE_PROFILE, PROF_SIGN_OUT, SIGN_OUT } from '../../redux/actions/types';
const HelperContext = createContext();

export const HelperProvider = ({ children }) => {
  const { type } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const logout = () => {
    dispatch({ type: SIGN_OUT });
    dispatch({ type: PROF_SIGN_OUT });
    dispatch({ type: DELETE_PROFILE });
    dispatch({ type: DELETE_ALL_PROF_REQUEST });
    dispatch({ type: DELETE_ALL_PROF_NOTIFICATION });
    dispatch({ type: DELETE_ALL_CLIENT_REQUEST });

    const routes = [{ name: constants.WELCOME }];
    if (type === constants.PROF_TYPE) routes.push({ name: constants.PROF_LOGIN });
    else routes.push({ name: constants.LOGIN });

    navigation.reset({ index: 0, routes });
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const processApiError = (response) => {
    console.log(">>processApiError: ", response);
    if (response && 'status' in response && response.status === 401) {
      logout();
    }
  };

  return (
    <HelperContext.Provider value={{ logout, processApiError }}>{children}</HelperContext.Provider>
  );
};

export const useHelper = () => useContext(HelperContext);
