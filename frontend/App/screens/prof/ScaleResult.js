import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Text from '../../components/Text';
import Box from '../../components/Homepage/Box';
import Button from '../../components/Button';
import colors from '../../config/colors';
import BaseUrl from '../../config/BaseUrl';
import axios from 'axios';
import data from '../../data/profScales';

const routeName = 'ProfSideScaleResult';
const ScaleResult = ({ navigation, route, ...props }) => {
  let goToBack = route.params.goToBack ?? 'ProHomepage';
  const { assessmentResult } = route.params;
  const questionId = assessmentResult.assessmentId;
  const answers = assessmentResult.answers;
  const questionObject = data.find((d) => d.id === questionId);
  const testname = questionObject.name;
  const questions = questionObject.ques;
  const user = assessmentResult.user.name;

  function handleBackButtonClick() {
    navigation.navigate(goToBack);
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
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        <View style={styles.headingStyle}>
          <Text style={styles.headingTextStyle}> {testname} </Text>
        </View>
        <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Client: </Text>
            {user}
          </Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Stage: </Text>
            {assessmentResult.stage}
          </Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Score: </Text>
            {assessmentResult.totalWeight}
          </Text>
        </View>
        <View style={styles.questionAllStyle}>
          {questions.map((q, index) => (
            <View style={styles.questionStyle} key={index}>
              <Text style={styles.questionTextStyle}>
                {index + 1}. {q.question}
              </Text>
              <View style={styles.responseStyle}>
                <MaterialCommunityIcons
                  name={'arrow-right'}
                  style={styles.responseIconStyle}
                />
                <Text style={styles.responseTextStyle}>{answers[index]}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headingStyle: {
    padding: 5,
    paddingVertical: 10,
    paddingTop: 15,
  },
  headingTextStyle: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
  questionAllStyle: {
    padding: 10,
    paddingTop: 5,
  },
  questionStyle: {
    paddingBottom: 12,
  },
  questionTextStyle: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'justify',
    color: '#333',
  },
  responseStyle: {
    flexDirection: 'row',
    paddingTop: 3.5,
  },
  responseIconStyle: {
    fontSize: 18,
    marginTop: 1,
    alignSelf: 'center',
    marginRight: 5,
    fontWeight: 'bold',
    color: colors.primary,
  },
  responseTextStyle: {
    fontSize: 16.5,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default ScaleResult;
