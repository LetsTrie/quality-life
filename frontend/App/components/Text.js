import React from 'react';
import { Text } from 'react-native';
import defaultStyles from '../config/styles';

export const AppText = ({ children, style, ...otherProps }) => {
  return (
    <>
      {children && (
        <Text style={[defaultStyles.text, style]} {...otherProps}>
          {children}
        </Text>
      )}
    </>
  );
};

export default AppText;
