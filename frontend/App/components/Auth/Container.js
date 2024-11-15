import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../config/colors';

const Container = ({ children }) => {
  return (
    <ScrollView style={styles.scrollViewStyle}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, '#ff7e67']}
          start={[0, 0]}
          end={[1, 0.5]}
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
