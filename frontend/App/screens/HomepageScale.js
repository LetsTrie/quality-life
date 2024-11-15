import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, BackHandler, Text } from 'react-native';
import { connect } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
// import Quizes from '../components/CircularQuiz/Quizes';
import BaseUrl from '../config/BaseUrl';
import questions from '../data/mentalHealthRating';
import { updateMsmAction } from '../redux/actions/user';

const HomepageScale = ({ navigation, route, ...props }) => {
  const [submitted, setSubmitted] = useState(false);
  const { updateMsmAction } = props;
  const [isLoading, setIsLoading] = useState(false);

  let { preTest } = route.params;
  let postTest = !preTest;

  const [answers, setAnswers] = useState(
    new Array(questions.length).fill(null)
  );

  let { fromVideo, goToBack } = route.params;
  if (!fromVideo) fromVideo = false;
  if (!goToBack) goToBack = 'Homepage';

  function handleBackButtonClick() {
    navigation.navigate(goToBack);
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick
      );
    };
  }, []);

  useEffect(() => {
    if (submitted) {
      let index = 0;
      let w = 0;
      let maxWeight = 0;

      for (let a of answers) {
        w += questions[index].options.filter((x) => x.label === a)[0].weight;
        let mx = -1;
        for (let o of questions[index].options)
          if (mx < o.weight) mx = o.weight;

        maxWeight += mx;
        index++;
      }
      w = Math.round(w);

      let range = [35, 55];

      let stage;
      if (w <= range[1]) stage = 'তীব্র মাত্রা';
      else if (w <= range[0]) stage = 'মাঝামাঝি মাত্রা';
      else stage = 'স্বাভাবিক মাত্রা';

      setIsLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.jwtToken}`,
      };

      const score = w * 4;

      axios
        .post(
          `${BaseUrl}/user/intro-Test-Submit`,
          { answers, score, fromVideo, postTest },
          { headers }
        )
        .then(async (res) => {
          const { mDate } = res.data;
          updateMsmAction(score, mDate);
          navigation.navigate('CircularQuizResult', {
            ...route.params,
            goToBack,
            meanResult: score
          });
          setIsLoading(false);
        })
        .catch((e) => {
          setIsLoading(false);
          console.log(e);
        });

    }
  }, [submitted]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView>
        <Quizes
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          setSubmitted={setSubmitted}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

const mapStateToProps = (state) => ({
  name: state.auth.name,
  photoUrl: state.auth.photoUrl,
  jwtToken: state.auth.jwtToken,
});

export default connect(mapStateToProps, { updateMsmAction })(HomepageScale);
