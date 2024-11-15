import React from 'react';
import AppButton from './Button';
import { StyleSheet } from 'react-native';
import colors from '../config/colors';

export const ErrorButton = ({ errorMessage, visible }) => {
  return (
    !!visible && <AppButton title={errorMessage} style={styles.btn} textStyle={styles.btnText} />
  );
};

const styles = StyleSheet.create({
  btn: {
    marginVertical: 10,
    marginBottom: 0,
    padding: 15,
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 3,
  },
  btnText: {
    fontSize: 14.5,
    color: colors.primary,
  },
});
