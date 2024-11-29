import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AuthIcon from '../components/Auth/AuthIcon';
import Text from '../components/Text';
import constants from '../navigation/constants';
import { useBackPress } from '../hooks';

const SCREEN_NAME = constants.USER_APPOINTMENT_TAKEN;
const AppointmentSuccess = () => {
  useBackPress(SCREEN_NAME);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.blockContainer}>
        <AuthIcon />
        <Text style={styles.headerText}>
          অ্যাপয়েন্টমেন্ট নেওয়ার জন্য আপনাকে ধন্যবাদ। মেইলের মাধ্যমে আপনাকে পরবর্তী আপডেট জানানো
          হবে!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eee',
  },
  blockContainer: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 17,
    color: '#353535',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 2,
    fontWeight: 'bold',
    lineHeight: 28,
  },
});

export default AppointmentSuccess;
