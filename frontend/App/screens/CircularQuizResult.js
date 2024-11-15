import React, { useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import Button from '../components/Button';
import CircularPicker from '../components/CircularQuiz/index';
import Text from '../components/Text';
import { severityText } from '../data/mentalHealthRating';
import { useNavigation, useRoute } from '@react-navigation/native';

const CircularQuizResult = () => {
  console.log('IN: CircularQuizResult');

  const navigation = useNavigation();
  const route = useRoute();

  console.log(route);

  const onPressHandler = () => {
    if (route.params.ToHomepage) navigation.navigate('Homepage');
    else if (route.params.fromVideo) {
      navigation.navigate('VideoExercise', {
        title: route.params.videoTitle,
        isCompleted: route.params.videoIsCompleted,
        id: route.params.videoId,
      });
    } else navigation.navigate('ThreeScales');
  };

  function handleBackButtonClick() {
    console.log(route.params);

    if (route.params.goToBack) navigation.navigate(route.params.goToBack);
    else if (route.params.ToHomepage) navigation.navigate('Welcome');
    else if (route.params.fromVideo) navigation.navigate('VideoExerciseList');
    else navigation.navigate('Homepage');

    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  return (
    <>
      <View>
        <Text
          style={{
            fontSize: 27,
            textAlign: 'center',
            padding: 30,
            paddingBottom: 23,
          }}
        >
          মানসিক স্বাস্থ্য মূল্যায়ন
        </Text>
        <CircularPicker
          size={200}
          strokeWidth={30}
          gradients={{
            50: ['rgb(52, 199, 89)', 'rgb(48, 209, 88)'],
            0: ['rgb(255, 97, 99)', 'rgb(247, 129, 119)'],
          }}
          defaultPos={route.params.meanResult}
        >
          <>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 50,
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              {route.params.meanResult}
            </Text>
          </>
        </CircularPicker>

        <View
          style={{
            borderColor: '#ccc',
            borderWidth: 2,
            margin: 15,
            padding: 10,
            borderRadius: 5,
            elevation: 2,
            backgroundColor: '#ddd',
            marginBottom: 15,
            marginTop: 20,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              lineHeight: 26,
              letterSpacing: 1,
            }}
          >
            {parseInt(route.params.meanResult) <= 50 ? severityText[1] : severityText[0]}
          </Text>
        </View>
        <Button
          title={
            route.params.ToHomepage
              ? 'Redirect to Homepage'
              : route.params.fromVideo
                ? 'পরবর্তী ভিডিও দেখুন'
                : 'পরবর্তী ধাপ'
          }
          onPress={onPressHandler}
        />
      </View>
    </>
  );
};
//
export default CircularQuizResult;
