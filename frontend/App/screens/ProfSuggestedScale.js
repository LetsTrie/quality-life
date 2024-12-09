import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import Quizes from '../components/Quiz/Quizes';
import data from '../data/profScales';
import Text from '../components/Text';
import colors from '../config/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import constants from '../navigation/constants';
import { Loader } from '../components/Loader';
import { useBackPress, useHelper } from '../hooks';
import { ApiDefinitions } from '../services/api';
import { ErrorButton } from '../components';

const SCREEN_NAME = constants.PROF_SUGGESTED_SCALE;
const ProfSuggestedScale = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ApiExecutor } = useHelper();

  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const { goToBack, assessmentId } = route.params || {};

  useBackPress(SCREEN_NAME, goToBack);

  if (!assessmentId) {
    throw new Error('Params is missing!!');
  }

  const [slug, setSlug] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [questionObject, setQuestionObject] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await ApiExecutor(
        ApiDefinitions.checkIfAssessmentIsAlreadyTaken({ assessmentId })
      );

      if (!response.success) {
        setError(response.error.message);
        return;
      }

      const _assessment = response.data.assessment;
      setSlug(_assessment.assessmentSlug);

      const _questionObject = data.find((d) => d.id === _assessment.assessmentSlug);
      const _question = _questionObject?.ques;

      setQuestionObject(_questionObject);
      setQuestions(_question);
      setAnswers(new Array(_question.length).fill(null));

      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (!submitted) return;

    if (!slug) {
      throw new Error('slug is missing!!');
    }

    (async () => {
      setIsLoading(true);

      const questionAnswers = questions.map((q, index) => ({
        question: q.question,
        answer: answers[index],
      }));

      let totalWeight = 0;
      let maxWeight = 0;
      for (let index = 0; index < answers.length; index++) {
        const maxx = Math.max(...questions[index].options.map((o) => o.weight));
        const wght = questions[index].options.find((o) => o.label === answers[index]).weight;
        totalWeight += wght;
        maxWeight += maxx;
      }
      let stage;
      for (let j = 0; j < questionObject.range.length; j++) {
        if (
          questionObject.range[j].min <= totalWeight &&
          questionObject.range[j].max >= totalWeight
        ) {
          stage = questionObject.range[j].severity;
          break;
        }
      }

      const payload = {
        questionAnswers,
        assessmentId,
        totalWeight,
        stage,
        maxWeight,
      };

      await ApiExecutor(
        ApiDefinitions.submitSuggestedScale({
          payload,
        })
      );

      setIsLoading(false);

      navigation.replace(constants.PROF_SUGGESTED_SCALE_RESULT, {
        slug,

        totalWeight,
        stage,
        maxWeight,

        goToBack,
      });
    })();
  }, [submitted]);

  if (isLoading) {
    return <Loader visible={isLoading} style={{ marginVertical: 10 }} />;
  }

  if (error) {
    return <ErrorButton visible={!!error} title={error} />;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

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

export default ProfSuggestedScale;
