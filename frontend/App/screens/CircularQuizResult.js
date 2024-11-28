import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Text from '../components/Text';
import { severityText } from '../data/mentalHealthRating';
import { useNavigation, useRoute } from '@react-navigation/native';
import constants from '../navigation/constants';
import colors from '../config/colors';
import { useBackPress } from '../hooks';

const SCREEN_NAME = constants.MENTAL_HEALTH_ASSESSMENT_RESULT;
const MentalHealthAssessmentResult = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { meanResult, goToBack, fromVideo, videoTitle, videoIsCompleted, videoId } = route.params;

  useBackPress(SCREEN_NAME, goToBack);

  const onPressHandler = () => {
    if (fromVideo) {
      navigation.replace(constants.VIDEO_EXERCISE, {
        id: videoId,
        title: videoTitle,
        isCompleted: videoIsCompleted,
      });
    } else {
      navigation.replace(constants.THREE_SCALES);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>মানসিক স্বাস্থ্য মূল্যায়ন</Text>
      <View style={styles.resultBox}>
        <Text
          style={[
            styles.resultText,
            {
              color: parseInt(meanResult) <= 50 ? colors.danger : colors.primary,
            },
          ]}
        >
          {meanResult}
        </Text>
        <Text style={styles.severityText}>
          {parseInt(meanResult) <= 50 ? severityText[1] : severityText[0]}
        </Text>
      </View>
      <Button
        title={fromVideo ? 'পরবর্তী ভিডিও দেখুন' : 'পরবর্তী ধাপ'}
        style={styles.nextStepButton}
        onPress={onPressHandler}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: 26,
  },
  resultBox: {
    borderColor: colors.neutral,
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    backgroundColor: colors.light,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  severityText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    color: colors.textSecondary,
  },
  nextStepButton: {
    width: '100%',
    borderRadius: 8,
  },
});

export default MentalHealthAssessmentResult;
