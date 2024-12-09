import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Rating } from 'react-native-ratings';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import Box from '../components/Homepage/Box';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import colors from '../config/colors';
import resources from '../data/videos';
import constants from '../navigation/constants';
import { useBackPress, useHelper } from '../hooks';
import { ApiDefinitions } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Loader, SubmitButton } from '../components';

const SCREEN_NAME = constants.RATING;

const findNextVideo = (resources, currentVideoId, watchedVideos) => {
  const currentIndex = resources.findIndex((video) => video.videoId === currentVideoId) + 1;
  const totalVideos = resources.length;

  for (let i = 0; i < totalVideos; i++) {
    const nextIndex = (currentIndex + i) % totalVideos;
    if (!watchedVideos.includes(resources[nextIndex].videoId)) {
      return resources[nextIndex];
    }
  }
  return null;
};

const RatingComponent = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const route = useRoute();
  const { ApiExecutor } = useHelper();

  const { videoId } = route.params;
  const { msm_score, msm_date, shownVideo } = useSelector((state) => state.user);

  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  let currentOrderIndex = resources.findIndex((vRes) => {
    return vRes.videoId === videoId;
  });

  const nextVideo = findNextVideo(resources, videoId, shownVideo);

  const handleSubmit = async () => {
    if (userRating === 0 && comment.trim() === '') return;

    const payload = {
      videoUrl: videoId,
      contentId: resources[currentOrderIndex].content_id,
      rating: userRating,
      comment,
    };

    setRatingSubmitted(false);
    setLoading(true);

    const response = await ApiExecutor(ApiDefinitions.submitUserRating({ payload }));

    setLoading(false);
    setRatingSubmitted(true);

    if (!response.success) {
      console.error(response);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      {ratingSubmitted ? (
        <View style={[styles.card]}>
          <Text style={styles.centerText}> আপনার মতামতের জন্য অশেষ ধন্যবাদ </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>ভিডিওটি সম্পর্কে আপনার মতামত দিন</Text>
          <Rating
            count={5}
            startingValue={0}
            size={32}
            selectedColor={'#542e71'}
            jumpValue={0.5}
            onFinishRating={(n) => setUserRating(n)}
            fractions={1}
            style={styles.rating}
          />
          <TextInput
            style={styles.textInput}
            placeholder="মতামত"
            onChangeText={(text) => setComment(text)}
          />
          <Loader visible={loading} style={styles.loader} />
          <SubmitButton
            title={'সাবমিট করুন'}
            onPress={handleSubmit}
            style={styles.submitButton}
            visible={!loading}
          />
        </View>
      )}

      <Box
        source={require('../assests/images/mentalexcercise.png')}
        name="মানসিক স্বাস্থ্য মূল্যায়ন করুন"
        lastScore={msm_score ? `${msm_score}/100` : undefined}
        lastDate={msm_date ? msm_date : undefined}
        onPress={() =>
          navigation.replace(constants.MENTAL_HEALTH_ASSESSMENT, {
            goToBack: constants.VIDEO_EXERCISE_LIST,

            type: 'manoshikShasthoMullayon',
            fromVideo: true,
            videoTitle: nextVideo?.name,
            videoIsCompleted: false,
            videoId: nextVideo?.videoId,
            preTest: false,
          })
        }
        boxStyle={{ width: '93%' }}
      />
      {nextVideo && (
        <View style={[styles.card, { paddingHorizontal: 20 }]}>
          <Text style={styles.hintTitle}>পরবর্তী ভিডিও</Text>
          <Text style={styles.hintText}>
            আমরা বিশ্বাস করি আপনি{' '}
            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>"{nextVideo.name}"</Text> ভিডিওটি
            দেখলে উপকৃত হবেন। এটি আপনার দক্ষতা আরও উন্নত করতে এবং মানসিক স্বাস্থ্যে ইতিবাচক প্রভাব
            ফেলতে সাহায্য করবে।
          </Text>
          <Button
            title="ভিডিওটি দেখুন"
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
            onPress={() =>
              navigation.replace(constants.VIDEO_EXERCISE, {
                title: nextVideo.name,
                isCompleted: false,
                id: nextVideo.videoId,
              })
            }
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.background,
  },
  card: {
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 20,
  },
  centerText: {
    textAlign: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  rating: {
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 5,
    width: '100%',
    padding: 14,
    paddingLeft: 20,
  },
  loader: {
    marginVertical: 10,
  },
  submitButton: {
    width: '100%',
  },
  nextButton: {
    borderRadius: 7,
    padding: 13,
    marginTop: 5,
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: colors.secondary,
    width: '100%',
  },
  nextButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  hintTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'justify',
  },
});

export default RatingComponent;
