import React from 'react';
import { StyleSheet, View } from 'react-native';
import AuthIcon from '../../components/Auth/AuthIcon';
import Text from '../../components/Text';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';

const SCREEN_NAME = constants.WAIT_FOR_VERIFICATION;

const AccountConfirmation = () => {
  useBackPress(SCREEN_NAME);

  return (
    <>
      <View style={styles.confirmationContainer}>
        <AuthIcon />
        <Text style={[styles.textStyle, { paddingTop: 15 }]}>আপনার নিবন্ধনের জন্য ধন্যবাদ।</Text>
        <Text style={styles.textStyle}>
          অনুগ্রহ করে যাচাইয়ের জন্য অপেক্ষা করুন। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  confirmationContainer: {
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 20,
  },
  textStyle: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 18,
    lineHeight: 38,
    color: '#444',
    fontWeight: 'bold',
  },
});

export default AccountConfirmation;
