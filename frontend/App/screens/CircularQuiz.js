import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
import { useHelper } from '../contexts/helper';
import questions from '../data/mentalHealthRating';
import { updateMsmAction } from '../redux/actions/user';
import { submitIntroTest } from '../services/api';

const CircularQuiz = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { processApiError } = useHelper();

  const jwtToken = useSelector((state) => state.auth.jwtToken);

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));

  useEffect(() => {
    if (!submitted) return;

    (async () => {
      setIsLoading(true);

      let answersWeight = 0;
      let maxWeight = 0;
      const isPostTest = false;

      for (let index = 0; index < questions.length; index++) {
        answersWeight += questions[index].options.filter(
          (option) => option.label === answers[index]
        )[0].weight;

        let questionMaxWeight = -1;
        for (let option of questions[index].options) {
          if (questionMaxWeight < option.weight) {
            questionMaxWeight = option.weight;
          }
        }

        maxWeight += questionMaxWeight;
      }
      answersWeight = Math.round(answersWeight);
      const score = answersWeight * 4;

      const response = await submitIntroTest({
        answers,
        score,
        isPostTest,
        jwtToken,
      });

      console.log({ answers, score, isPostTest, jwtToken, response });

      if (response.success) {
        const { mDate } = response.data;
        console.log({ mDate });

        console.log({
          ...route.params,
          meanResult: score,
          route: 'CircularQuizResult',
        });

        dispatch(updateMsmAction(score, mDate));
        navigation.navigate('CircularQuizResult', {
          ...route.params,
          meanResult: score,
        });
      } else {
        processApiError(response);
      }

      setIsLoading(false);
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

export default CircularQuiz;
