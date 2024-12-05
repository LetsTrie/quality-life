import { useNavigation } from '@react-navigation/native';
import React, { createContext, useEffect } from 'react';
import { BackHandler } from 'react-native';
import backScreenMap from '../navigation/backScreenMap';
import { useHelper } from './helper';
import constants from '../navigation/constants';
import { selectHomepageByRole } from '../utils/roles';
import { useSelector } from 'react-redux';

const BackPressContext = createContext();

export const useBackPress = (screenName, previousPage = null) => {
  const navigation = useNavigation();
  const { logout } = useHelper();

  const { role } = useSelector((state) => state.auth);

  const handleBackPress = () => {
    if (backScreenMap[screenName] === constants.SPECIAL_LOGOUT_ACTION) {
      logout();
    } else if (backScreenMap[screenName] === constants.GO_TO_BACK) {
      navigation.goBack();
    } else if (previousPage) {
      navigation.replace(selectHomepageByRole(previousPage, role));
    } else {
      navigation.navigate(selectHomepageByRole(backScreenMap[screenName], role));
    }

    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  return handleBackPress;
};

export const BackPressProvider = ({ children }) => {
  return <BackPressContext.Provider value={useBackPress}>{children}</BackPressContext.Provider>;
};
