import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../config/colors';

const Block = ({ name, data, icon }) => {
  return (
    <View style={styles.singleBlock}>
      <View style={styles.iconBlock}>
        <MaterialCommunityIcons name={icon} style={styles.iconStyle} color={colors.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginLeft: 15,
  },
  iconBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 50,
    backgroundColor: colors.light,
    marginRight: 16,
  },
  iconStyle: {
    fontSize: 24,
  },
  dataBlock: {
    flex: 1,
  },
  blockName: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  blockData: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Block;
