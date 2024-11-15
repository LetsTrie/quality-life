import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import scales from '../../data/profScales';

const SuggestedScaleResult = ({ navigation, route, ...props }) => {
  const [answers, setAnswers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const { assessmentId } = route.params;
  const scale = scales.find((s) => s.id === assessmentId);

  const getResult = async () => {
    setLoading(true);
    // const response = await axios.get(`${BaseUrl}/prof/test-details/${testId}`);
    // setAnswers(response.data.result);
    setLoading(false);
  };

  useEffect(() => {
    getResult();
  }, []);

  return (
    <>
      <p> Hello there </p>
    </>
  );

  // return (
  //   <ScrollView style={{ backgroundColor: 'white' }}>
  //     <View>
  //       <View style={styles.headingStyle}>
  //         <Text style={styles.headingTextStyle}> {testname} </Text>
  //       </View>
  //       {isLoading ? (
  //         <View
  //           style={{
  //             textAlign: 'center',
  //             width: '100%',
  //             paddingTop: 10,
  //           }}
  //         >
  //           <ActivityIndicator size='large' color={colors.primary} />
  //         </View>
  //       ) : (
  //         <View style={styles.questionAllStyle}>
  //           {questions.map((q, index) => (
  //             <View style={styles.questionStyle} key={index}>
  //               <Text style={styles.questionTextStyle}>
  //                 {index + 1}. {q}
  //               </Text>
  //               <View style={styles.responseStyle}>
  //                 <MaterialCommunityIcons
  //                   name={'arrow-right'}
  //                   style={styles.responseIconStyle}
  //                 />
  //                 <Text style={styles.responseTextStyle}>{answers[index]}</Text>
  //               </View>
  //             </View>
  //           ))}
  //         </View>
  //       )}
  //     </View>
  //   </ScrollView>
  // );
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

export default SuggestedScaleResult;
