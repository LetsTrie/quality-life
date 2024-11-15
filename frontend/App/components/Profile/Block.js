import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Block = ({ name, data, icon }) => {
  let borderColor = '#888';
  let iconColor = '#333';
  return (
    <View style={styles.singleBlock}>
      <View style={[styles.iconBlock, { borderColor: borderColor }]}>
        <MaterialCommunityIcons
          name={icon}
          style={styles.iconStyle}
          color={iconColor}
        />
      </View>
      <View style={styles.dataBlock}>
        <Text style={styles.blockName}>{name}</Text>
        <Text style={styles.blockData}>{data}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  singleBlock: {
    paddingBottom: 8,
    flexDirection: 'row',
  },
  iconBlock: {
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 7,
    borderWidth: 3.5,
    borderRadius: 50,
    marginRight: 13,
  },
  iconStyle: {
    fontSize: 23,
  },
  dataBlock: {
    marginRight: 35,
    padding: 3.5,
  },
  blockName: {
    color: '#999',
    fontSize: 14,
  },
  blockData: {
    color: '#444',
    fontSize: 16.5,
    paddingRight: 10,
    letterSpacing: 0.2,
    lineHeight: 23,
    fontWeight: '500',
  },
});

export default Block;
