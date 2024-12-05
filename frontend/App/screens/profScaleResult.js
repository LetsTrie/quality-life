import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import Button from '../components/Button';
import colors from '../config/colors';
import data from '../data/profScales';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { SubmitButton } from '../components/SubmitButton';

const SCREEN_NAME = constants.PROF_SUGGESTED_SCALE_RESULT;

const ProfScaleResult = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { redirectToHomepage } = useHelper();

  const { goToBack, totalWeight, stage, maxWeight, slug } = route.params || {};
  useBackPress(SCREEN_NAME, goToBack);
  const questionObject = data.find((d) => d.id === slug);

  if (!questionObject) {
    throw new Error('Question Object is missing!!');
  }

  let percentage = 0;
  if (maxWeight > 0) percentage = Math.round((totalWeight / maxWeight) * 100);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainContainer}>
        <Text style={styles.scoreHeading}>{questionObject.name}</Text>
        <Text style={styles.intensityLabel}>তীব্রতা: {stage}</Text>

        <SubmitButton
          title="হোমপেইজে যান"
          style={{ backgroundColor: colors.secondary, width: '100%', marginTop: 15 }}
          onPress={() => redirectToHomepage()}
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
  },
  scoreHeading: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    marginTop: 5,
  },
  intensityLabel: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  scoreDesc: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    paddingBottom: 12,
    color: colors.primary,
  },
  scoreTextContainerGreen: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderRadius: 100,
    marginBottom: 13,
    borderColor: '#4fc63a',
    backgroundColor: '#7ed56f',
  },
  scoreTextContainerRed: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderRadius: 100,
    marginBottom: 13,
    borderColor: 'rgb(255, 97, 99)',
    backgroundColor: 'rgb(247, 129, 119)',
  },
  scoreText: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  homeButton: {
    backgroundColor: '#2d4059',
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default ProfScaleResult;
