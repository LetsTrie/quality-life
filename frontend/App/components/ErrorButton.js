import React from 'react';
import AppButton from './Button';
import { StyleSheet } from 'react-native';
import colors from '../config/colors';

export const ErrorButton = ({ title, visible, style, textStyle }) => {
  return (
    !!visible && (
      <AppButton
        title={title}
        style={[styles.btn, style]}
        textStyle={[styles.btnText, textStyle]}
      />
    )
  );
};

const styles = StyleSheet.create({
  btn: {
    marginVertical: 10,
    marginBottom: 0,
    padding: 15,
    backgroundColor: 'white',
    borderColor: colors.danger,
    borderWidth: 3,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 15,
    color: colors.danger,
  },
});
