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
import colors from '../config/colors';

const Box = ({ title, isCompleted, id }) => {
  const navigation = useNavigation();

  const onPress = () => {
    navigation.navigate(constants.VIDEO_EXERCISE, { title, isCompleted, id });
  };

  return (
    <TouchableOpacity style={[styles.boxContainer]} onPress={onPress}>
      <Text style={styles.boxTitle} numberOfLines={2}>
        {title}
      </Text>
      <Image source={isCompleted ? doneImage : pendingImage} style={styles.iconStyle} />
    </TouchableOpacity>
  );
};

const SCREEN_NAME = constants.VIDEO_EXERCISE_LIST;
const VideoExerciseList = () => {
  useBackPress(SCREEN_NAME);
  const { shownVideo } = useSelector((state) => state.user);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.listContainer}>
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
  scrollContainer: {
    padding: 10,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingVertical: 10,
  },
  boxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.shadow,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  boxTitle: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  iconStyle: {
    height: 24,
    width: 24,
  },
});

export default VideoExerciseList;
