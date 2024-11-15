import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

let borderRadius = 35;

const AuthIcon = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        style={styles.logo}
        source={require('../../assests/images/new_logo.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    paddingTop: borderRadius * 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 140,
  },
});

export default AuthIcon;
