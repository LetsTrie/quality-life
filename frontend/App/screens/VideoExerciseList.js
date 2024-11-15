import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import doneImage from '../assests/images/done.png';
import pendingImage from '../assests/images/pending.png';
import Text from '../components/Text';
import resources from '../data/videos';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

// Updated At: 22/03/2024
// Updated By: MD. Sakib Khan

const Box = ({ title, isCompleted, id }) => {
  const navigation = useNavigation();

  const onPress = () => {
    navigation.navigate('VideoExercise', { title, isCompleted, id });
  };

  return (
    <>
      <TouchableOpacity style={styles.boxContainer} onPress={onPress}>
        <Text style={styles.boxTitle}>{title}</Text>
        <Image source={isCompleted ? doneImage : pendingImage} style={styles.iconStyle} />
      </TouchableOpacity>
    </>
  );
};

const VideoExerciseList = () => {
  const { shownVideo } = useSelector((state) => state.user);
  useBackPress(constants.VIDEO_EXERCISE_LIST);

  return (
    <ScrollView>
      <View style={{ padding: 10, paddingTop: 18 }}>
        {resources.map((resource) => (
          <Box
            title={resource.name}
            isCompleted={shownVideo.includes(resource.videoId)}
            id={resource.videoId}
            key={resource.videoId}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#eee',
    borderWidth: 1,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 15,
    backgroundColor: '#fefefe',
  },
  boxTitle: {
    color: '#333',
    fontSize: 15,
    maxWidth: 270,
    lineHeight: 25,
  },
  iconStyle: {
    alignSelf: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    height: 18,
    width: 18,
  },
});

export default VideoExerciseList;
