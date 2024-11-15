import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useDispatch, useSelector } from 'react-redux';
import BaseUrl from '../config/BaseUrl';
import { shownVideoAction } from '../redux/actions/user';
import { Loader } from './Loader';

export default function YouTube({ videoId, needAction = true }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { jwtToken } = useSelector((state) => state.auth);

  const [showLoader, setShowLoader] = useState(true);
  const [playing, setPlaying] = useState(false);

  function handleBackButtonClick() {
    navigation.navigate('VideoExerciseList');
    return true;
  }

  useEffect(() => {
    setTimeout(() => {
      setShowLoader(false);
    }, 2500);

    if (needAction) {
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
    }
  }, []);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);

      if (!needAction) {
        return;
      }

      const headers = {
        'Content-Type': 'YouTube/json',
        Authorization: `Bearer ${jwtToken}`,
      };

      axios
        .post(`${BaseUrl}/user/submitAVideo`, { videoUrl: videoId }, { headers })
        .then(() => {
          dispatch(shownVideoAction(videoId));
          navigation.navigate('Rating', { videoId });
        })
        .catch((err) => console.log(err));
    }
  }, []);

  return (
    <View style={{ padding: 10 }}>
      <Loader visible={showLoader} />

      {!showLoader && (
        <YoutubePlayer
          height={200}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
        />
      )}
    </View>
  );
}
