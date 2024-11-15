import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import { useHelper } from '../../../contexts/helper';
import constants from '../../../navigation/constants';
import { storeUserProfile } from '../../../redux/actions/user';
import { getUserInformations } from '../../../services/api';
import styles from './StartingGuideline.style';

export const StartingGuideline = () => {
  const dispatch = useDispatch();
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const navigation = useNavigation();
  const { processApiError } = useHelper();

  const handleClick = async () => {
    const response = await getUserInformations({ jwtToken });
    if (response.success) {
      dispatch(storeUserProfile(response.data));
      navigation.navigate(constants.TEST_PAGE, { ToHomepage: true, goToBack: constants.HOMEPAGE });
    } else {
      processApiError(response);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ব্যবহারিক নির্দেশিকা</Text>
      </View>
      <View style={styles.desc}>
        <Text style={styles.descText}>
          এই মোবাইল এপ্লিকেশনটি এমনি একটা ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক
          স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন ও তার সাথে মানসিক অবস্থা উন্নয়নের কিছু সহজ পদ্ধতি
          প্রদান করা হবে।এছাড়া প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে আপনার যোগাযোগ করার
          ব্যবস্থাও রয়েছে।
        </Text>
        <Text style={[styles.descText, styles.descExtraSpace]}>
          এই এপ্লিকেশনটি ব্যবহার করতে গিয়ে আপনি যেই তথ্যগুলো প্রদান করবেন তা আমাদের কাছে খুবই
          গুরুত্বপূর্ণ এবং অত্যন্ত সতর্কতার সাথে তথ্যগুলোর গোপনীয়তা বজায় রাখা হবে। পরিচয় সম্পূর্ণ
          গোপন রেখে এই এপ্লিকেশনটির ব্যবহারকারীদের তথ্যগুলো একটি গবেষনা কাজে ব্যবহৃত হবে। এই তথ্য
          গুলো বিশ্লেষণ করার জন্য কেবলমাত্র তিন জন গবেষক ব্যতিত অন্যকেউ দেখতে পাবে না। অনুগ্রহ করে
          প্রশ্নের উত্তর ও রেটিং গুলো মনোযোগ সহকারে প্রদান করুন।
        </Text>
      </View>
      <Button title="মানসিক স্বাস্থ্য মূল্যায়ন করুন" style={styles.btn} onPress={handleClick} />
    </ScrollView>
  );
};
