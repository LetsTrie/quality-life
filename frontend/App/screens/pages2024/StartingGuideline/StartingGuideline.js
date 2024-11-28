import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Text from '../../../components/Text';
import constants from '../../../navigation/constants';
import { storeUserProfile } from '../../../redux/actions/user';
import { ApiDefinitions } from '../../../services/api';
import { useBackPress, useHelper } from '../../../hooks';
import { SubmitButton } from '../../../components/SubmitButton';
import { ErrorButton, Loader } from '../../../components';
import colors from '../../../config/colors';

const SCREEN_NAME = constants.ONBOARDING_GUIDELINE;
export const StartingGuideline = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { ApiExecutor } = useHelper();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.userProfile());
    setIsLoading(false);

    console.log(response);

    if (!response.success) {
      setError(response?.error?.message);
      return;
    }

    setError(null);

    dispatch(storeUserProfile(response.data.user));
    navigation.replace(constants.HOMEPAGE);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ব্যবহারিক নির্দেশিকা</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.descText}>
          এই মোবাইল এপ্লিকেশনটি একটি ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক স্বাস্থ্যের
          অবস্থা যাচাই করতে পারবেন। এতে মানসিক অবস্থা উন্নয়নের সহজ পদ্ধতি প্রদান করা হয় এবং প্রয়োজনে
          মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে যোগাযোগের ব্যবস্থাও রয়েছে।
        </Text>
        <Text style={[styles.descText, styles.extraSpacing]}>
          আপনার প্রদত্ত তথ্যের গোপনীয়তা বজায় রাখা আমাদের অগ্রাধিকার। তথ্যগুলো শুধুমাত্র গবেষণা কাজে
          ব্যবহৃত হবে এবং কেবলমাত্র তিনজন গবেষকের জন্য উপলব্ধ থাকবে। অনুগ্রহ করে প্রশ্ন এবং রেটিং
          মনোযোগ দিয়ে পূরণ করুন।
        </Text>
      </View>

      <Loader visible={isLoading} style={{ marginTop: 10 }} />
      <ErrorButton visible={!!error} title={error} />
      <SubmitButton title={'হোমপেইজে প্রবেশ করুন'} onPress={handleClick} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  header: {
    marginTop: 25,
    marginBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  descText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  extraSpacing: {
    marginTop: 10,
  },
});

export default StartingGuideline;
