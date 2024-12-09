import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import { useRoute } from '@react-navigation/native';
import { Loader } from '../../components';
import { numberWithCommas } from '../../utils/number';
import { ApiDefinitions } from '../../services/api';
import { useBackPress, useHelper } from '../../hooks';
import constants from '../../navigation/constants';
import { ErrorButton } from '../../components/ErrorButton';
import { formatDateTime } from '../../utils/date';
import { typeLabelMap } from '../../utils/type';

const SCREEN_NAME = constants.CLIENT_TEST_RESULT;
const ClientTestResult = () => {
  useBackPress(SCREEN_NAME);
  const { ApiExecutor } = useHelper();

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const { testId, isSpecialTest } = route.params || {};

  const [type, setType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [completedAt, setCompletedAt] = useState(null);

  const getResult = async () => {
    if (!isLoading) setLoading(true);

    if (isSpecialTest) {
      const response = await ApiExecutor(
        ApiDefinitions.getAssessmentDetails({ assessmentId: testId })
      );
      setLoading(false);

      if (!response.success) {
        setError(response.error.message);
        return;
      }

      const { scale } = response.data;

      setType(scale.assessmentSlug);
      setSeverity(scale.stage);
      setQuestionAnswers(Array.isArray(scale.questionAnswers) ? scale.questionAnswers : []);
      setScore(+scale.totalWeight);
      setCompletedAt(formatDateTime(scale.completedAt));
    } else {
      const response = await ApiExecutor(ApiDefinitions.getPrimaryTestResult({ testId }));
      setLoading(false);

      if (!response.success) {
        setError(response.error.message);
        return;
      }

      const { test } = response.data;

      setType(test.type);
      setSeverity(test.severity);
      setQuestionAnswers(Array.isArray(test.questionAnswers) ? test.questionAnswers : []);
      setScore(+test.score);
      setCompletedAt(formatDateTime(test.createdAt));
    }
  };

  useEffect(() => {
    (async () => {
      await getResult();
    })();
  }, []);

  if (isLoading) {
    return <Loader visible={isLoading} style={{ marginVertical: 20 }} />;
  }

  if (error) {
    return <ErrorButton onPress={() => getResult()} />;
  }

  if (!type || questionAnswers.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          backgroundColor: 'white',
          borderBottomColor: colors.background,
          borderBottomWidth: 3,
        }}
      >
        <View style={styles.headingStyle}>
          <Text style={styles.headingTextStyle}>{typeLabelMap(type)}</Text>
          {severity && <Text style={styles.headingInfoStyle}>{severity} </Text>}
          {score > 0 && (
            <Text style={styles.headingInfoStyle}>স্কোর: {numberWithCommas(score)} </Text>
          )}
          <Text style={styles.completedAtTextStyle}>{completedAt}</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.questionAllStyle}>
          {questionAnswers.map((qa, index) => (
            <View style={styles.questionStyle} key={index}>
              <Text style={styles.questionTextStyle}>
                {index + 1}. {qa.question}
              </Text>
              <View style={styles.responseStyle}>
                <MaterialCommunityIcons name={'arrow-right'} style={styles.responseIconStyle} />
                <Text style={styles.responseTextStyle}>{qa.answer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  headingStyle: {
    padding: 10,
    paddingVertical: 25,
  },
  headingTextStyle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    paddingBottom: 8,
  },
  headingInfoStyle: {
    fontSize: 15,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  questionAllStyle: {
    padding: 15,
    backgroundColor: colors.background,
    elevation: 2,
  },
  questionStyle: {
    marginBottom: 10,

    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 0,

    borderRadius: 10,
    padding: 15,
  },
  questionTextStyle: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'justify',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  responseStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseIconStyle: {
    fontSize: 18,
    marginRight: 10,
    color: colors.textSecondary,
  },
  responseTextStyle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  completedAtTextStyle: {
    fontSize: 15,
    color: colors.shadow,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ClientTestResult;
