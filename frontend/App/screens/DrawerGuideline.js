import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../components/Text';
import colors from '../config/colors';
import constants from '../navigation/constants';
import { useBackPress } from '../hooks';

const SCREEN_NAME = constants.SIDEBAR_APP_GUIDELINE;
const DrawerGuideline = () => {
  useBackPress(SCREEN_NAME);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.desc}>
        <Text style={styles.descText}>
          এই মোবাইল এপ্লিকেশনটি এমনি একটা ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক
          স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন ও তার সাথে মানসিক অবস্থা উন্নয়নের কিছু সহজ পদ্ধতি
          প্রদান করা হবে। এছাড়া প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে আপনার যোগাযোগ করার
          ব্যবস্থাও রয়েছে।
          {'\n\n'}
          এই এপ্লিকেশনটি ব্যবহার করতে গিয়ে আপনি যেই তথ্যগুলো প্রদান করবেন তা আমাদের কাছে খুবই
          গুরুত্বপূর্ণ এবং অত্যন্ত সতর্কতার সাথে তথ্যগুলোর গোপনীয়তা বজায় রাখা হবে। পরিচয় সম্পূর্ণ
          গোপন রেখে এই এপ্লিকেশনটির ব্যবহারকারীদের তথ্যগুলো একটি গবেষণা কাজে ব্যবহৃত হবে। এই তথ্য
          গুলো বিশ্লেষণ করার জন্য কেবলমাত্র তিন জন গবেষক ব্যতিত অন্যকেউ দেখতে পাবে না। অনুগ্রহ করে
          প্রশ্নের উত্তর ও রেটিং গুলো মনোযোগ সহকারে প্রদান করুন।
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 10,
  },
  desc: {
    marginVertical: 15,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  descText: {
    fontSize: 18,
    letterSpacing: 0.4,
    textAlign: 'justify',
    lineHeight: 26,
    color: colors.textPrimary,
  },
});

export default DrawerGuideline;
