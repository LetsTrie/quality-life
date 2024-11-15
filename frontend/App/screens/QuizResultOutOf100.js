import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import Button from '../components/Button';
import Text from '../components/Text';
import colors from '../config/colors';

const QuizResultOutOf100 = ({ navigation, route, ...props }) => {
  const { totalWeight, stage, type, maxWeight } = route.params;
  let mtype;
  if (type === 'manoshikObosthaJachaikoron') mtype = 'মানসিক অবস্থা';
  else if (type === 'manoshikChapNirnoy') mtype = 'মানসিক চাপ';
  else if (type === 'duschintaNirnoy') mtype = 'দুশ্চিন্তা';
  let parcentage = 0;
  if (maxWeight > 0) parcentage = Math.round((totalWeight / maxWeight) * 100);
  function handleBackButtonClick() {
    navigation.navigate('Homepage');
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

  return (
    <>
      <ScrollView>
        <View style={styles.mainContainer}>
          <Text style={styles.scoreHeading}>
            {' '}
            {type === 'manoshikChapNirnoy'
              ? 'আপনার মানসিক চাপের পরিমাণঃ'
              : type === 'manoshikObosthaJachaikoron'
              ? 'আপনার মানসিক অবস্থার পরিমানঃ'
              : 'আপনার দুশ্চিন্তার পরিমাণঃ'}
          </Text>
          <Text style={styles.scoreDesc}> {stage} </Text>
          <View
            style={
              parcentage <= 50
                ? styles.scoreTextContainerGreen
                : styles.scoreTextContainerRed
            }
          >
            <Text style={styles.scoreText}> {totalWeight}</Text>
          </View>
          <View
            style={{
              borderColor: '#ccc',
              borderWidth: 2,
              margin: 10,
              padding: 10,
              marginTop: 3,
              borderRadius: 5,
              elevation: 2,
              backgroundColor: '#ddd',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, lineHeight: 25.5, letterSpacing: 1 }}>
              {stage === 'স্বাভাবিক মাত্রা'
                ? `আপনার ${mtype} স্বাভাবিক মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`
                : stage === 'মাঝামাঝি মাত্রা'
                ? `আপনার ${mtype} মাঝামাঝি মাত্রায় রয়েছে। এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন। `
                : `আপনার ${mtype} তীব্র মাত্রায় রয়েছে । এই অবস্থার গুনগত মান উন্নয়নের জন্য অ্যাপসের মাধ্যমে দ্রুত সময়ের মধ্যে মানসিক স্বাস্থ্য সেবা প্রফেশনালদের সাথে যোগাযোগ করুন। পাশাপাশি অ্যাপসের ভিডিওগুলো দেখুন ও অনুশীলন করুন।`}
            </Text>
          </View>

          {stage === 'তীব্র মাত্রা' && (
            <Button
              textStyle={{ fontSize: 16.5 }}
              style={{
                marginBottom: 5,
                backgroundColor: '#2d4059',
              }}
              title={'প্রফেশনালদের সাথে যোগাযোগ করুন'}
              onPress={() => navigation.navigate('AllProfessionals')}
            />
          )}
          <Button
            title={'অনুশীলন করুন'}
            onPress={() => navigation.navigate('VideoExerciseList')}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 10,
    paddingTop: 18,
  },
  scoreHeading: {
    textAlign: 'center',
    fontSize: 22.5,
    paddingBottom: 5,
  },
  scoreDesc: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    paddingBottom: 12,
    color: colors.primary,
  },
  scoreTextContainer: {},
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
});

export default QuizResultOutOf100;
