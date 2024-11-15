import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DividerOr = () => {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine}></View>
      <Text style={styles.dividerText}>OR</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: 8,
    width: '55%',
    alignItems: 'center',
  },
  dividerText: {
    fontWeight: '300',
    fontSize: 14,
    color: 'gray',
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  dividerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    backgroundColor: 'gray',
    height: 1,
    width: '100%',
    zIndex: -1,
  },
});

export default DividerOr;
