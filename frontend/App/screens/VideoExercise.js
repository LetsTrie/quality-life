import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import YouTube from '../components/Youtube';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

// Updated At: 22/03/2024
// Updated By: MD. Sakib Khan

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
  },
  exerciseText: {
    fontSize: 23,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 10,
    color: '#333',
  },
});

export default VideoExercise;
