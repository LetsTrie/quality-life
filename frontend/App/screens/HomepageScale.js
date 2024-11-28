import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
import questions from '../data/mentalHealthRating';
import { updateMsmAction } from '../redux/actions/user';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { ApiDefinitions } from '../services/api';

const SCREEN_NAME = constants.MENTAL_HEALTH_ASSESSMENT;
const MentalHealthAssessment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { ApiExecutor } = useHelper();

  const { goToBack, fromVideo = false, preTest } = route.params || {};

  useBackPress(SCREEN_NAME, goToBack);

  const postTest = !preTest;

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));

  useEffect(() => {
    if (!submitted) return;

    (async () => {
      setIsLoading(true);

      const questionAnswers = answers.map((answer, index) => ({
        question: questions[index].question,
        answer,
      }));

      let _score = 0;
      let maxWeight = 0;

      answers.map((answer, index) => {
        const question = questions[index];
        _score += questions[index].options.filter((x) => x.label === answer)[0].weight;

        const questionMaxWeight = Math.max(...question.options.map((o) => o.weight));
        maxWeight += questionMaxWeight;
      });

      _score = Math.round(_score);

      let range = [35, 55];
      let stage;

      if (_score <= range[1]) stage = 'তীব্র মাত্রা';
      else if (_score <= range[0]) stage = 'মাঝামাঝি মাত্রা';
      else stage = 'স্বাভাবিক মাত্রা';

      const payload = {
        questionAnswers,
        type: 'manoshikShasthoMullayon',
        score: _score * 4,
        severity: stage,
        totalScore: maxWeight,
        fromVideo,
        postTest,
      };

      const response = await ApiExecutor(ApiDefinitions.submitTest({ payload }));
      setIsLoading(false);

      if (!response.success) {
        console.error(`Failed to submit test: ${response.error.message}`);
        return;
      }

      const { mDate } = response.data;
      const { score } = response.data.test;

      dispatch(updateMsmAction(score, mDate));

      navigation.replace(constants.MENTAL_HEALTH_ASSESSMENT_RESULT, {
        ...route.params,
        goToBack,
        meanResult: score,
      });
    })();
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

export default MentalHealthAssessment;
