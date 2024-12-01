import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import colors from '../config/colors';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { numberWithCommas } from '../utils/number';
import { RadioButton } from 'react-native-paper';
import { ApiDefinitions } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ErrorButton, Loader, SubmitButton } from '../components';
import AppDateTimePicker from '../components/DateTimePicker';
import { days, isValidDate } from '../utils/date';

const permissions = [
  { label: 'হ্যাঁ', value: true },
  { label: 'না', value: false },
];

const SCREEN_NAME = constants.PROFESSIONAL_DETAILS;
const ProfessionalDetails = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const route = useRoute();

  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [permission, setPermission] = useState(true);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const prof = route?.params?.prof || {};

  const { ApiExecutor } = useHelper();

  const dateTime = {};
  (prof?.availableTime || []).forEach((t) => {
    if (t?.timeRange?.length > 0) {
      dateTime[t.day] = t.timeRange.map((ft) => `${ft.from} - ${ft.to}`);
    }
  });

  const onPressHandler = async () => {
    if (!day || !time) {
      setError('দয়া করে দিন ও সময় নির্বাচন করুন');
      return;
    }

    const payload = {
      profId: prof?._id,
      permissionToSeeProfile: permission,
    };

    const appointmentDateTime = new Date();
    if (day && isValidDate(day)) {
      appointmentDateTime.setFullYear(day.getFullYear());
      appointmentDateTime.setMonth(day.getMonth());
      appointmentDateTime.setDate(day.getDate());
    }

    if (time && isValidDate(time)) {
      appointmentDateTime.setHours(time.getHours());
      appointmentDateTime.setMinutes(time.getMinutes());
    }

    appointmentDateTime.setSeconds(0);
    appointmentDateTime.setMilliseconds(0);

    payload.dateByClient = appointmentDateTime;
    console.log(payload);

    setIsLoading(true);
    const response = await ApiExecutor(
      ApiDefinitions.requestForAppointment({
        payload,
      })
    );
    setIsLoading(false);
    if (!response.success) return;

    navigation.replace(constants.USER_APPOINTMENT_TAKEN);
  };

  if (!prof) return null;

  return (
    <ScrollView style={{ backgroundColor: colors.white }}>
      <View>
        <View style={styles.generalInformationContainer}>
          <Text style={styles.gIName}>{prof.name}</Text>
          <Text style={styles.gIOther}>{prof.profession}</Text>
          <Text style={styles.gIOther}>{prof.designation}</Text>
          <Text style={styles.gIOther}>{prof.email}</Text>
        </View>
        {Object.values(dateTime).some((times) => times.length > 0) && (
          <View style={styles.blockContainer}>
            <Text style={styles.bigHeader}>প্রফেশনালদের নির্ধারিত সময়</Text>
            {days.map(
              (d) =>
                dateTime[d.value] && (
                  <View style={styles.block} key={d.value}>
                    <Text style={styles.blockHeader}>{d.label}</Text>
                    <View style={styles.allBlocks}>
                      {dateTime[d.value].map((times) => (
                        <Text style={styles.eachBlock} key={times}>
                          {times}
                        </Text>
                      ))}
                    </View>
                  </View>
                )
            )}
          </View>
        )}
        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}>দিন সময় বাছাই করুন </Text>
          <View style={styles.pickerContainer}>
            <View style={{ width: '49%' }}>
              <AppDateTimePicker
                width="97%"
                placeholder="দিন"
                mode="date"
                onSelectDateTime={(date) => setDay(date)}
                selectedDateTime={day}
              />
            </View>
            <View style={{ width: '49%' }}>
              <AppDateTimePicker
                placeholder="সময়"
                mode="time"
                onSelectDateTime={(date) => setTime(date)}
                selectedDateTime={time}
              />
            </View>
          </View>
        </View>
        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}>
            আপনি কি আপনার প্রোফাইলটি প্রফেশনালের সাথে শেয়ার করতে ইচ্ছুক?
          </Text>
          <RadioButton.Group onValueChange={(p) => setPermission(p)} value={permission}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {permissions.map((p) => (
                <View style={styles.permissionContainer} key={p.value}>
                  <RadioButton value={p.value} />
                  <Text style={styles.permissionText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        </View>
        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}> অ্যাপয়েন্টমেন্ট ফি </Text>
          <Text style={styles.appointmentFee}>{numberWithCommas(prof.fee)} টাকা</Text>
        </View>
        <Loader visible={isLoading} style={{ marginVertical: 10 }} />
        <ErrorButton title={error} visible={!!error} />
        <SubmitButton
          title="অ্যাপয়েন্টমেন্ট নিন"
          onPress={onPressHandler}
          style={styles.submitBtn}
          disabled={!(day && time)}
          visible={!isLoading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    marginVertical: 15,
    marginBottom: 15,
    borderColor: colors.secondary,
    borderWidth: 0.5,
    borderRadius: 50,
  },
  generalInformationContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  gIName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  gIOther: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'center',
  },
  blockContainer: {
    padding: 5,
    paddingHorizontal: 10,
  },
  bigHeader: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
    paddingBottom: 4,
  },
  block: {
    paddingHorizontal: 3.5,
  },
  blockHeader: {
    fontSize: 17.5,
    color: colors.textPrimary,
    paddingBottom: 3.5,
  },
  allBlocks: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  eachBlock: {
    backgroundColor: colors.secondary,
    color: 'white',
    margin: 2,
    padding: 4,
    fontSize: 14,
    borderRadius: 3,
    marginBottom: 3,
    paddingHorizontal: 7,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 3,
  },
  appointmentFee: {
    color: '#444',
    fontSize: 16.5,
    paddingTop: 5,
    paddingLeft: 5,
  },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  permissionText: {
    fontSize: 15,
    marginBottom: 3,
  },
});

export default ProfessionalDetails;
