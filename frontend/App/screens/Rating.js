import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, View } from 'react-native';
import { Rating } from 'react-native-ratings';
import { connect } from 'react-redux';
import Button from '../components/Button';
import Box from '../components/Homepage/Box';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import BaseUrl from '../config/BaseUrl';
import colors from '../config/colors';
import resources from '../data/videos';
import { logoutAction } from '../redux/actions/auth';
import { storeUserProfile } from '../redux/actions/user';

const RatingComp = ({ navigation, route, ...props }) => {
  const { msm_score, msm_date, shownVideo, jwtToken } = props;
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const videoId = route.params.videoId;
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentOrder = resources.find((v) => v.videoId === videoId).order;
  let nextOrder = currentOrder + 1;
  let alreadyShown = false;
  let nextResource;
  let isCompleted = false;
  if (nextOrder === resources.length) {
    let found = false;
    for (let i = 0; i < resources.length; i++) {
      if (!shownVideo.includes(resources[i].videoId)) {
        nextResource = resources.find((v) => v.order === i);
        found = true;
        break;
      }
    }
    if (!found) isCompleted = true;
    // sesh
  } else {
    nextResource = resources.find((v) => v.order === nextOrder);
    alreadyShown = shownVideo.includes(nextResource.videoId);
  }

  function handleBackButtonClick() {
    navigation.navigate('VideoExerciseList');
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const handleSubmit = () => {
    setRatingSubmitted(false);
    setLoading(true);
    axios
      .post(
        `${BaseUrl}/user/rating`,
        { videoUrl: videoId, rating: userRating, comment },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((res) => {
        const r = res.data;
        setRatingSubmitted(true);
        setLoading(false);
      })
      .catch((e) => {
        setRatingSubmitted(true);
        setLoading(false);
      });
  };

  return (
    <ScrollView style={{ backgroundColor: '#eee' }}>
      {ratingSubmitted ? (
        <View
          style={{
            margin: 15,
            padding: 15,
            borderWidth: 1,
            borderColor: '#eee',
            elevation: 3,
            borderRadius: 5,
            backgroundColor: 'white',
            paddingVertical: 20,
            marginBottom: 0,
            textAlign: 'center',
            paddingVertical: 20,
          }}
        >
          <Text> আপনার মতামতের জন্য অশেষ ধন্যবাদ </Text>
        </View>
      ) : (
        <View
          style={{
            margin: 15,
            padding: 15,
            borderWidth: 1,
            borderColor: '#eee',
            elevation: 3,
            borderRadius: 5,
            backgroundColor: 'white',
            paddingVertical: 20,
            marginBottom: 0,
          }}
        >
          <Text style={{ marginBottom: 10, textAlign: 'center' }}>
            ভিডিওটি সম্পর্কে আপনার মতামত দিন
          </Text>
          <Rating
            count={5}
            startingValue={0}
            size={32}
            selectedColor={'#542e71'}
            jumpValue={0.5}
            onFinishRating={(n) => setUserRating(n)}
            fractions={1}
            style={{ marginBottom: 10 }}
          />
          <TextInput
            style={{
              borderRadius: 5,
              width: '100%',
              padding: 14,
              paddingLeft: 20,
            }}
            placeholder="মতামত"
            onChangeText={(text) => setComment(text)}
          />
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              size={'large'}
              style={{ marginVertical: 10 }}
            />
          ) : (
            <Button
              title="সাবমিট করুন"
              style={{
                borderRadius: 7,
                width: '100%',
                marginTop: 10,
                padding: 13,
              }}
              textStyle={{ fontSize: 16 }}
              onPress={handleSubmit}
            />
          )}
        </View>
      )}

      <View
        style={{
          margin: 15,
          borderWidth: 1,
          borderColor: '#eee',
          elevation: 3,
          borderRadius: 5,
          backgroundColor: 'transparent',
          marginBottom: 0,
        }}
      >
        <Box
          source={require('../assests/images/mentalexcercise.jpeg')}
          name="মানসিক স্বাস্থ্য মূল্যায়ন করুন"
          lastScore={msm_score ? `${msm_score}/100` : undefined}
          lastDate={msm_date ? msm_date : undefined}
          onPress={() =>
            navigation.navigate('HomepageScale', {
              ToHomepage: false,
              type: 'manoshikShasthoMullayon',
              fromVideo: true,
              videoTitle: nextResource.name,
              videoIsCompleted: alreadyShown,
              videoId: nextResource.videoId,
              goToBack: 'Rating',
              preTest: false,
            })
          }
          boxStyle={{
            height: 250,
            borderRadius: 5,
            overflow: 'hidden',
            backgroundColor: '#eee',
          }}
        />
      </View>
      {!isCompleted && (
        <Button
          title="পরবর্তী ভিডিও দেখুন"
          style={{
            borderRadius: 7,
            padding: 13,
            marginTop: 10,
            marginLeft: 30,
            marginRight: 30,
          }}
          textStyle={{ fontSize: 16 }}
          onPress={() =>
            navigation.navigate('VideoExercise', {
              title: nextResource.name,
              isCompleted: alreadyShown,
              id: nextResource.videoId,
            })
          }
        />
      )}
    </ScrollView>
  );
};

const mapStateToProps = (state) => ({
  jwtToken: state.auth.jwtToken,
  isAuthenticated: state.auth.isAuthenticated,
  msm_score: state.user.msm_score,
  msm_date: state.user.msm_date,
  shownVideo: state.user.shownVideo,
});

export default connect(mapStateToProps, { storeUserProfile, logoutAction })(RatingComp);
