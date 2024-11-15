import React, { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import colors from '../config/colors';
import data from '../data/profScales';

const ProfScaleResult = ({ navigation, route, ...props }) => {
  const { totalWeight, stage, maxWeight, questionId } = route.params;
  const questionObject = data.find((d) => d.id === questionId);

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
          <Text style={styles.scoreHeading}>{questionObject.name}</Text>
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              marginTop: 10,
              fontWeight: 'bold',
            }}
          >
            {'তীব্রতা'}
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 'bold',
    marginTop: 5,
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

export default ProfScaleResult;
