import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
import { chooseTest } from '../config/chooseTest';
import * as Keys from '../data/type';

import {
  mentalHeathProfileAction,
  updateDnAction,
  updateMcnAction,
  updateMojAction,
} from '../redux/actions/user';

import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { ApiDefinitions } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const SCREEN_NAME = constants.TEST;
const Test = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { goToBack, preTest, scaleId, type, fromProfile } = route.params;
  useBackPress(SCREEN_NAME, goToBack);

  const dispatch = useDispatch();
  const { ApiExecutor } = useHelper();

  const scale = chooseTest(scaleId);
  if (!scale) {
    console.error('Scale not found');
    return null;
  }

  const questions = scale.questions;
  const postTest = !preTest;

  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [isLoading, setIsLoading] = useState(false);

  function goToAnotherPage(redirectTo, stage = null) {
    switch (redirectTo) {
      case Keys.SHOW_VIDEO:
        navigation.replace(constants.VIDEO_SCREEN, {
          scaleId,
          needAction: false,
        });
        break;

      case Keys.HELP_CENTER:
        navigation.replace(constants.HELP_CENTER, {
          scaleId,
          goToBack: constants.PROFILE,
        });
        break;

      case Keys.RESULT_OUT_OF_100:
        navigation.replace(constants.QUIZ_RESULT_OUT_OF_100, {
          type,
          stage,
        });
        break;

      case Keys.NO_ACTION:
        navigation.navigate('Profile', {
          ...route.params,
        });
        break;

      default:
        navigation.navigate('Homepage');
        break;
    }
  }

  useEffect(() => {
    if (!submitted) return;

    (async () => {
      setIsLoading(true);

      const questionAnswers = answers.map((answer, index) => ({
        question: questions[index].question,
        answer,
      }));

      if (fromProfile) {
        const payload = { questionAnswers, type, score: 0, fromProfile: true, postTest };

        const response = await ApiExecutor(ApiDefinitions.submitTest({ payload }));
        setIsLoading(false);

        if (!response.success) {
          console.error(`Failed to submit test: ${response.error.message}`);
          return;
        }

        dispatch(mentalHeathProfileAction(scaleId));

        const scaleIds = [
          Keys.CHILD_CARE,
          Keys.DOMESTIC_VIOLENCE,
          Keys.SUICIDE_IDEATION,
          Keys.PSYCHOTIC_PROFILE,
        ];

        const uniqueAnswers = [...new Set(answers)];
        const anyNoAnswerExists = uniqueAnswers.length === 1 && uniqueAnswers[0] === 'না';

        if (scaleIds.includes(scaleId) && anyNoAnswerExists) {
          navigation.navigate(constants.PROFILE);
          return;
        }

        goToAnotherPage(route.params.redirectTo);
      } else {
        let _score = 0;
        let maxWeight = 0;

        answers.map((answer, index) => {
          const question = questions[index];
          _score += questions[index].options.filter((x) => x.label === answer)[0].weight;

          const questionMaxWeight = Math.max(...question.options.map((o) => o.weight));
          maxWeight += questionMaxWeight;
        });

        _score = Math.round(_score);

        let range = [];

        if (type === 'manoshikChapNirnoy') range = [13, 26];
        else if (type === 'duschintaNirnoy') range = [54, 66];
        if (type === 'manoshikObosthaJachaikoron') range = [4, 9];

        let stage;
        if (_score <= range[0]) stage = 'স্বাভাবিক মাত্রা';
        else if (_score <= range[1]) stage = 'মাঝামাঝি মাত্রা';
        else stage = 'তীব্র মাত্রা';

        const payload = {
          questionAnswers,
          type,
          score: _score,
          severity: stage,
          totalScore: maxWeight,
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

        if (type === 'duschintaNirnoy') {
          dispatch(updateDnAction(score, mDate));
        } else if (type === 'manoshikChapNirnoy') {
          dispatch(updateMcnAction(score, mDate));
        } else if (type === 'manoshikObosthaJachaikoron') {
          dispatch(updateMojAction(score, mDate));
        }

        goToAnotherPage(route.params.redirectTo, stage);
      }
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

export default Test;
