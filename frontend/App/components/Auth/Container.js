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
          colors={['#373b44', '#4286f4']}
          start={[0, 0]}
          end={[0.7, 1]}
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
