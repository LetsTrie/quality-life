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
    const backScreen = backScreenMap[screenName] || null;

    if ([backScreen, previousPage].includes(constants.SPECIAL_LOGOUT_ACTION)) {
      logout();
    } else if ([backScreen, previousPage].includes(constants.GO_TO_BACK)) {
      navigation.goBack();
    } else {
      const targetScreen = previousPage || backScreen;
      const destination = selectHomepageByRole(targetScreen, role);

      if (!destination) {
        console.error('No valid navigation target found');
        return true;
      }

      try {
        navigation.replace(destination);
      } catch (error) {
        console.warn('Navigation replace failed, using navigate as fallback:', error);
        navigation.navigate(destination);
      }
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
