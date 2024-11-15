import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/Text';
import scales from '../../data/profScales';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';
import { useNavigation } from '@react-navigation/native';

const SCREEN_NAME = constants.PROF_ASSESSMENT_TOOLS;
const Assessments = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();

  const formattedScales = scales.map((scale) => ({
    id: scale.id,
    name: scale.name,
  }));

  const onScalePress = (assessmentId) => {
    navigation.navigate('ProAssessmentDetails', {
      assessmentId,
    });
  };

  return (
    <ScrollView>
      <View>
        <Text style={styles.noticeText}>
          এখানে সর্বমোট ১০ টি অ্যাসেসমেন্ট টুলস রয়েছে। এগুলো সম্পর্কে বিস্তারিত জানতে নিচে ক্লিক
          করুন।
        </Text>

        <View style={styles.AssessmentContainer}>
          {formattedScales.map((scale) => (
            <TouchableOpacity
              style={styles.block}
              key={scale.id}
              onPress={() => onScalePress(scale.id)}
            >
              <Text style={styles.blockText}>{scale.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noticeText: {
    padding: 5,
    paddingTop: 10,
    textAlign: 'center',
    lineHeight: 25,
  },
  AssessmentContainer: {
    paddingVertical: 5,
  },
  block: {
    padding: 7,
    margin: 12,
    marginVertical: 5,
    backgroundColor: '#e5e5e5',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  blockText: {
    lineHeight: 25,
    fontSize: 16,
    color: '#333',
  },
});

export default Assessments;
