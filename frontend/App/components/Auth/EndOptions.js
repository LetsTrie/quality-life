import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../Text';
import colors from '../../config/colors';

const EndOptions = ({ title1, title2, title3, onPress1, onPress2 }) => {
  return (
    <>
      <TouchableOpacity style={styles.touchableStyle} onPress={onPress1}>
        <Text style={[styles.lowerTexts, { paddingTop: 10 }]}>{title1}</Text>
        <Text
          style={[
            styles.boldUnderlineStyle,
            {
              paddingTop: 10,
              paddingLeft: 3.5,
            },
          ]}
        >
          {title2}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress2}>
        <Text style={styles.boldUnderlineStyle}>{title3}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  touchableStyle: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  boldUnderlineStyle: {
    fontSize: 14.5,
    marginTop: 6,
    fontWeight: '700',
    color: colors.textSecondary,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.secondary,
  },
  lowerTexts: {
    fontWeight: '300',
    fontSize: 14.5,
    color: '#767676',
    marginTop: 6,
  },
});

export default EndOptions;
