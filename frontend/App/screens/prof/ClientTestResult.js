import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import BaseUrl from '../../config/BaseUrl';
import axios from 'axios';

import anxiety from '../../data/scales/ANXIETY';
import ghq from '../../data/scales/GHQ';
import pss from '../../data/scales/PSS';

import childCare from '../../data/childCare';
import coronaProfile from '../../data/coronaProfile';
import domesticViolence from '../../data/domesticViolence';
import psychoticProfile from '../../data/psychoticProfile';
import suicideIdeation from '../../data/suicideIdeation';
import { useRoute } from '@react-navigation/native';

const ClientTestResult = () => {
  const route = useRoute();

  const [answers, setAnswers] = useState([]);
  const [testInfo, setTestInfo] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const testId = route.params.test_id;
  const testname = route.params.testname;
  let questions = [];
  if (testname === 'মানসিক অবস্থা যাচাইকরণ') {
    questions = ghq.questions.map((q) => q.question);
  } else if (testname === 'মানসিক চাপ নির্ণয়') {
    questions = pss.questions.map((q) => q.question);
  } else if (testname === 'দুশ্চিন্তা নির্ণয়') {
    questions = anxiety.questions.map((q) => q.question);
  } else if (testname === 'করোনা সম্পর্কিত তথ্য') {
    questions = coronaProfile.questions.map((q) => q.question);
  } else if (testname === 'গুরুতর সমস্যা সম্পর্কিত তথ্য') {
    questions = psychoticProfile.questions.map((q) => q.question);
  } else if (testname === 'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য') {
    questions = suicideIdeation.questions.map((q) => q.question);
  } else if (testname === 'পারিবারিক সহিংসতা সম্পর্কিত তথ্য') {
    questions = domesticViolence.questions.map((q) => q.question);
  } else if (testname === 'সন্তান পালন সম্পর্কিত তথ্য') {
    questions = childCare.questions.map((q) => q.question);
  }

  const getResult = async () => {
    const response = await axios.get(`${BaseUrl}/prof/test-details/${testId}`);
    setAnswers(response.data.result);
    setTestInfo(response.data.test);
    setLoading(false);
  };

  useEffect(() => {
    getResult();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        <View style={styles.headingStyle}>
          <Text style={styles.headingTextStyle}> {testname} </Text>
          <Text style={styles.headingInfoStyle}>Score: {testInfo.score} </Text>
          <Text style={styles.headingInfoStyle}>Severity: {testInfo?.severity} </Text>
        </View>
        {isLoading ? (
          <View
            style={{
              textAlign: 'center',
              width: '100%',
              paddingTop: 10,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.questionAllStyle}>
            {questions.map((q, index) => (
              <View style={styles.questionStyle} key={index}>
                <Text style={styles.questionTextStyle}>
                  {index + 1}. {q}
                </Text>
                <View style={styles.responseStyle}>
                  <MaterialCommunityIcons name={'arrow-right'} style={styles.responseIconStyle} />
                  <Text style={styles.responseTextStyle}>{answers[index]}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingBottom: 5,
  },
  headingInfoStyle: {
    fontSize: 15,
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

export default ClientTestResult;
