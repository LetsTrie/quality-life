import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import YouTube from '../components/Youtube';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';
import colors from '../config/colors';

const VideoExercise = () => {
  useBackPress(constants.VIDEO_EXERCISE);
  const route = useRoute();

  return (
    <>
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseText}>{route.params.title}</Text>
        <YouTube videoId={route.params.id} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: colors.background,
    flex: 1,
  },
  exerciseText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 10,
    color: colors.textPrimary,
  },
});

export default VideoExercise;
