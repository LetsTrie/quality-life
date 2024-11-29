import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../config/colors';

export const AppButton = ({
  title,
  onPress,
  style,
  textStyle,
  color = 'primary',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? colors.gray : colors[color] },
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={!disabled ? onPress : null}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    width: '92%',
    alignSelf: 'center',
    marginVertical: 4,
    marginBottom: 8,
    elevation: 1,
    flexDirection: 'row',
  },
  text: {
    color: colors.white,
    fontSize: 15,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.light,
  },
  disabledText: {
    color: colors.shadow,
  },
});

export default AppButton;
