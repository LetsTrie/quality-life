import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import scales from '../../data/profScales';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';

const SCREEN_NAME = constants.PROF_ASSESSMENT_TOOL_DETAILS;
const AssessmentDetails = ({ route }) => {
  useBackPress(SCREEN_NAME);

  const { assessmentId } = route.params;
  const scale = scales.find((scale) => scale.id === assessmentId);

  if (!scale) return null;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.name}>{scale.name}</Text>
        <Text style={styles.copyright}>{scale.copyright}</Text>
        <View>
          {scale.ques.map((s) => (
            <View key={s.question} style={styles.scaleWrapper}>
              <MaterialCommunityIcons name={'arrow-right-circle'} style={styles.icon} size={14.5} />
              <Text style={styles.question}>{s.question}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: { backgroundColor: 'white' },
  container: {
    padding: 10,
    paddingTop: 15,
  },
  name: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 10,
    lineHeight: 30,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    paddingBottom: 25,
    lineHeight: 20,
  },
  scaleWrapper: {
    flexDirection: 'row',
    paddingRight: 15,
  },
  icon: {
    paddingTop: 4,
    paddingRight: 5,
  },
  question: {
    marginBottom: 10,
    fontSize: 15,
    paddingBottom: 10,
    lineHeight: 20,
  },
});

export default AssessmentDetails;
