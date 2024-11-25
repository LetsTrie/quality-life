import React from 'react';
import AppButton from './Button';
import { StyleSheet } from 'react-native';
import colors from '../config/colors';

export const SubmitButton = ({ title, onPress, style, textStyle }) => {
  return (
    <AppButton
      title={title}
      style={[styles.btn, style]}
      textStyle={[styles.btnText, textStyle]}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  btn: {
    marginVertical: 10,
    marginBottom: 0,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  btnText: {
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
  },
});
