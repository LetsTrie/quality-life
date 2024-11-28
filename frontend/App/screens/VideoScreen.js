import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Loader } from '../components';
import Text from '../components/Text';
import YouTube from '../components/Youtube';
import videoScreenPages from '../data/videoScreenPages';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

// Updated At: 22/03/2024
// Updated By: MD. Sakib Khan

const VideoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  useBackPress(constants.VIDEO_SCREEN);

  const { scaleId, needAction = true } = route.params;

  const [videoScreen, setVideoScreen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (scaleId) {
      const page = videoScreenPages.find((screen) => screen.name === scaleId);
      setVideoScreen(page);
      navigation.setOptions({ title: page?.title ?? constants.QUALITY_LIFE });

      setIsLoading(false);
    }
  }, [scaleId]);

  if (!videoScreen) return null;

  return (
    <View style={styles.VideoScreenContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.Heading}>{videoScreen.postHeading}</Text>
          <Text style={styles.textStyle}>{videoScreen.postDescription}</Text>
        </View>
        <View style={styles.youTubeVideoContainer}>
          <Loader visible={!isLoading} />
          {!isLoading && <YouTube videoId={videoScreen.videoId} needAction={needAction} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  VideoScreenContainer: {
    paddingVertical: 13,
    paddingLeft: 15,
    paddingRight: 10,
    backgroundColor: 'white',
    flex: 1,
  },
  Heading: {
    color: '#444',
    fontSize: 28,
    paddingTop: 10,
    alignSelf: 'center',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
  },
  textStyle: {
    fontSize: 17.5,
    lineHeight: 28,
    color: '#555',
    textAlign: 'justify',
    paddingTop: 15,
  },
  youTubeVideoContainer: {
    marginTop: 20,
  },
});

export default VideoScreen;
