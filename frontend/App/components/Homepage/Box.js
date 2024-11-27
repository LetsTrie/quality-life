import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Text from '../Text';
import colors from '../../config/colors';

const Box = ({ source, name, lastScore, lastDate, onPress, boxStyle }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={boxStyle ? boxStyle : styles.box}>
        <ImageBackground source={source} style={styles.backgroundImageStyle}>
          <LinearGradient
            colors={['#75757598', '#2b2b2b98']}
            start={[1, 1]}
            end={[0, 0]}
            style={styles.linearGradientStyle}
          ></LinearGradient>
          <Text style={styles.testName}>{name}</Text>
          {lastDate && (
            <View style={styles.history}>
              <Text style={styles.lastScore}>সর্বশেষ স্কোর: {lastScore}</Text>
              <Text style={styles.lastDate}>
                <MaterialCommunityIcons name="calendar-account" size={18} /> {lastDate}
              </Text>
            </View>
          )}
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '92%',
    height: 250,
    margin: 10,
    marginLeft: 14,
    marginBottom: 3,
    elevation: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  backgroundImageStyle: {
    height: 250,
    width: '100%',
    flex: 1,
    resizeMode: 'cover',
  },
  testName: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 20,
    margin: 15,
    marginLeft: 18,
    color: 'white',
    letterSpacing: 0.2,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 2,
    textAlign: 'center',
    lineHeight: 30,
  },
  history: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  lastScore: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 2,
    elevation: 1,
    marginBottom: 5,
    color: 'white',
    fontWeight: '700',
  },
  lastDate: {
    alignSelf: 'flex-end',
    paddingBottom: 15,
    paddingRight: 15,
    paddingTop: 3,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  linearGradientStyle: {
    opacity: 0.55,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

export default Box;
