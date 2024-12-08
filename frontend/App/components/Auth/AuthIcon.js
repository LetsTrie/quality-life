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
    paddingTop: borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 170,
    height: 130,
  },
});

export default AuthIcon;
