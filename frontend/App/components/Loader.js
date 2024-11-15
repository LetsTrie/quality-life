import React from 'react';
import { ActivityIndicator } from 'react-native';
import colors from '../config/colors';

export const Loader = ({ size = 'large', color = colors.primary, visible = true, style }) => {
  return <>{visible && <ActivityIndicator size={size} color={color} style={style} />}</>;
};
