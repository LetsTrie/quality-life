import { useNavigation } from '@react-navigation/native';
import React, { createContext, useEffect } from 'react';
import { BackHandler } from 'react-native';
import backScreenMap from '../navigation/backScreenMap';
import { useHelper } from './helper';
import constants from '../navigation/constants';

const BackPressContext = createContext();

export const useBackPress = (screenName, previousPage = null) => {
  const navigation = useNavigation();
  const { logout } = useHelper();

  const handleBackPress = () => {
    if (backScreenMap[screenName] === constants.SPECIAL_LOGOUT_ACTION) {
      logout();
    } if(previousPage) {
      navigation.replace(previousPage);
    } else {
      navigation.navigate(backScreenMap[screenName]);
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
