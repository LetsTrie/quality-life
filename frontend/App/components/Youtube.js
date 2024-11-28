import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useDispatch } from 'react-redux';
import { shownVideoAction } from '../redux/actions/user';
import { Loader } from './Loader';
import { ApiDefinitions } from '../services/api';
import { useHelper } from '../hooks';
import constants from '../navigation/constants';

export default function YouTube({ videoId, needAction = true }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { ApiExecutor } = useHelper();

  const [showLoader, setShowLoader] = useState(true);
  const [playing, setPlaying] = useState(false);

  function handleBackButtonClick() {
    navigation.navigate(constants.VIDEO_EXERCISE_LIST);
    return true;
  }

  useEffect(() => {
    if (!needAction) return;

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const onStateChange = useCallback(
    async (state) => {
      if (state === 'playing') {
        setPlaying(true);
      } else if (state === 'paused') {
        setPlaying(false);
      } else if (state === 'ended') {
        setPlaying(false);

        if (!needAction) return;

        const response = await ApiExecutor(ApiDefinitions.seenVideo({ videoId }));
        if (!response.success) return;

        dispatch(shownVideoAction(videoId));
        navigation.navigate(constants.RATING, { videoId });
      }
    },
    [dispatch, navigation, needAction, ApiExecutor, videoId]
  );

  const onReady = useCallback(() => {
    setShowLoader(false);
    setPlaying(true); // Automatically start playing when ready
  }, []);

  return (
    <View style={{ padding: 10 }}>
      <Loader visible={showLoader} style={{ marginBottom: 20, marginTop: -5 }} />
      <YoutubePlayer
        height={200}
        play={playing}
        videoId={videoId}
        onChangeState={onStateChange}
        onReady={onReady}
        forceAndroidAutoplay // Ensures autoplay works on older Android devices
      />
    </View>
  );
}
