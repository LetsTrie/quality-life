import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Text from '../components/Text';
import colors from '../config/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

const SCREEN_NAME = constants.QUIZ_RESULT_OUT_OF_100;

const QuizResultOutOf100 = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const { params } = useRoute();
  const { stage, type } = params;

  const typeMapping = {
    manoshikObosthaJachaikoron: 'মানসিক অবস্থা',
    manoshikChapNirnoy: 'মানসিক চাপ',
    duschintaNirnoy: 'দুশ্চিন্তা',
  };

  const mtype = typeMapping[type] || 'অজানা';
  const isSevere = stage === 'তীব্র মাত্রা';

  const stageDescriptions = {
    'স্বাভাবিক মাত্রা': `আপনার ${mtype} স্বাভাবিক মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`,
    'মাঝামাঝি মাত্রা': `আপনার ${mtype} মাঝামাঝি মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`,
    'তীব্র মাত্রা': `আপনার ${mtype} তীব্র মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের মাধ্যমে দ্রুত সময়ের মধ্যে মানসিক স্বাস্থ্য সেবা প্রফেশনালদের সাথে যোগাযোগ করুন। পাশাপাশি অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`,
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainContainer}>
        <Text style={styles.scoreHeading}>
          {type === 'manoshikChapNirnoy'
            ? 'আপনার মানসিক চাপের পরিমাণঃ'
            : type === 'manoshikObosthaJachaikoron'
              ? 'আপনার মানসিক অবস্থার পরিমানঃ'
              : 'আপনার দুশ্চিন্তার পরিমাণঃ'}
        </Text>
        <Text style={styles.scoreDesc}>{stage}</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{stageDescriptions[stage]}</Text>
        </View>
        {isSevere && (
          <Button
            textStyle={styles.buttonText}
            style={styles.contactButton}
            title="প্রফেশনালদের সাথে যোগাযোগ করুন"
            onPress={() => navigation.replace(constants.PROFESSIONALS_LIST)}
          />
        )}
        <Button
          title="অনুশীলন করুন"
          onPress={() => navigation.replace(constants.VIDEO_EXERCISE_LIST)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  mainContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scoreHeading: {
    textAlign: 'center',
    fontSize: 22,
    marginBottom: 8,
  },
  scoreDesc: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  descriptionBox: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonText: {
    fontSize: 16,
  },
  contactButton: {
    backgroundColor: '#2d4059',
    marginBottom: 12,
  },
});

export default QuizResultOutOf100;
