import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../config/colors';
import { lightenColor } from '../../utils/ui';

const Container = ({ children }) => {
  return (
    <ScrollView style={styles.scrollViewStyle}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, lightenColor(colors.secondary, 30)]}
          start={[0, 0]}
          end={[1, 0]}
        >
          {children}
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewStyle: {
    backgroundColor: 'white',
  },
});

export default Container;
