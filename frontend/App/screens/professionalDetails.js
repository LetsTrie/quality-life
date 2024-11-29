import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import Picker from '../components/Picker';
import Text from '../components/Text';
import colors from '../config/colors';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { numberWithCommas } from '../utils/number';
import { RadioButton } from 'react-native-paper';
import { ApiDefinitions } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const days = [
  { label: 'Sunday', value: 'Sunday', id: 0, genId: 3 },
  { label: 'Monday', value: 'Monday', id: 1, genId: 4 },
  { label: 'Tuesday', value: 'Tuesday', id: 2, genId: 5 },
  { label: 'Wednesday', value: 'Wednesday', id: 3, genId: 6 },
  { label: 'Thursday', value: 'Thursday', id: 4, genId: 7 },
  { label: 'Friday', value: 'Friday', id: 5, genId: 1 },
  { label: 'Saturday', value: 'Saturday', id: 6, genId: 2 },
];

const dayTranslations = {
  Sunday: 'রবিবার',
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার',
  Thursday: 'বৃহস্পতিবার',
  Friday: 'শুক্রবার',
  Saturday: 'শনিবার',
};

const permissions = [
  { label: 'হ্যাঁ', value: true },
  { label: 'না', value: false },
];

const calculateTime = (from, fromAmPm) => {
  if (from > 24) {
    from = from - 24;
    fromAmPm = 'AM';
  } else if (from === 24) {
    from = 12;
    fromAmPm = 'AM';
  } else if (from > 12) {
    from = from - 12;
    fromAmPm = 'PM';
  } else if (from === 12) {
    fromAmPm = 'PM';
  }
  return [from, fromAmPm];
};

const totalTimes = Array.from({ length: 24 }, (_, i) => {
  const [from, fromAmPm] = calculateTime(6 + i, 'AM');
  return { label: `${from}:00${fromAmPm}`, value: `${from}:00${fromAmPm}` };
});

const pos = days.find((d) => d.id === new Date().getDay()).genId;
days.forEach((d) => {
  if (d.genId < pos) d.label = 'পরবর্তী ' + dayTranslations[d.label];
  else d.label = dayTranslations[d.value];
});

const SCREEN_NAME = constants.PROFESSIONAL_DETAILS;
const ProfessionalDetails = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const route = useRoute();

  const prof = route.params.prof || {};

  const { ApiExecutor } = useHelper();

  const dateTime = {};
  prof.availableTime.forEach((t) => {
    if (t.timeRange.length > 0) {
      dateTime[t.day] = t.timeRange.map((ft) => `${ft.from} - ${ft.to}`);
    }
  });

  const [day, setDay] = useState(null);
  const [times, setTimes] = useState(null);
  const [time, setTime] = useState(null);
  const [permission, setPermission] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!prof) return;
    if (!day) return;

    const fromToArray = prof.availableTime
      .filter((t) => t.day === day.value)
      .flatMap((t) => t.timeRange.map((ft) => ({ from: ft.from, to: ft.to })));

    const finalArray = [];
    fromToArray.forEach((ft) => {
      const fromFlag = ft.from.endsWith('PM') ? 1 : 0;
      const toFlag = ft.to.endsWith('PM') ? 1 : 0;
      const fromValue = parseInt(ft.from.split(':')[0], 10);
      const toValue = parseInt(ft.to.split(':')[0], 10);

      if (fromFlag > toFlag || (fromFlag === toFlag && fromValue > toValue)) {
        setError('Invalid time range: Start time cannot be after end time.');
        return;
      }

      for (let v = fromValue; v <= (fromFlag === toFlag ? toValue : 12); v++) {
        finalArray.push({
          label: `${v}:00${fromFlag ? 'PM' : 'AM'}`,
          value: `${v}:00${fromFlag ? 'PM' : 'AM'}`,
        });
      }

      if (fromFlag !== toFlag) {
        for (let v = 1; v <= toValue; v++) {
          finalArray.push({
            label: `${v}:00${toFlag ? 'PM' : 'AM'}`,
            value: `${v}:00${toFlag ? 'PM' : 'AM'}`,
          });
        }
      }
    });

    setTimes(finalArray.length ? finalArray : totalTimes);
  }, [day]);

  const onPressHandler = async () => {
    if (!day || !time) {
      setError('Please select day and time');
      return;
    }
    setIsLoading(true);

    const payload = {
      profId: prof._id,
      permissionToSeeProfile: permission,
    };

    const today = new Date();
    let appointmentDate = new Date();
    const selectedDay = days.find((d) => d.value === day.value).id;

    const daysUntilAppointment = (selectedDay - today.getDay() + 7) % 7 || 7;
    appointmentDate.setDate(today.getDate() + daysUntilAppointment);

    const [hourStr, amPm] = time.label.split(/(AM|PM)/);
    let [hours, minutes] = hourStr.split(':').map(Number);
    if (amPm === 'PM' && hours !== 12) hours += 12;
    if (amPm === 'AM' && hours === 12) hours = 0;

    appointmentDate.setHours(hours, minutes, 0, 0);
    payload.dateByClient = appointmentDate.toISOString();

    const response = await ApiExecutor(
      ApiDefinitions.takeAppointment({
        payload,
      })
    );
    setIsLoading(false);
    if (!response.success) return;

    navigation.navigate(constants.USER_APPOINTMENT_TAKEN);
  };
  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        <View style={styles.generalInformationContainer}>
          <Text style={styles.gIName}>{prof.name}</Text>
          <Text style={styles.gIOther}>{prof.profession} </Text>
          <Text style={styles.gIOther}>{prof.designation} </Text>
          <Text style={styles.gIOther}>{prof.email} </Text>
        </View>

        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}> Available Time </Text>
          {days.map(
            (d) =>
              dateTime[d.value] && (
                <View style={styles.block} key={d.value}>
                  <Text style={styles.blockHeader}> {dayTranslations[d.value]} </Text>
                  <View style={styles.allBlocks}>
                    {dateTime[d.value].map((times) => (
                      <Text style={styles.eachBlock} key={times}>
                        {' '}
                        {times}{' '}
                      </Text>
                    ))}
                  </View>
                </View>
              )
          )}
        </View>

        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}> দিন সময় বাছাই করুন </Text>
          <View style={styles.pickerContainer}>
            <Picker
              width="48%"
              placeholder="দিন"
              selectedItem={day}
              onSelectItem={(g) => setDay(g)}
              items={
                Object.keys(dateTime).length === 0 ? days : days.filter((d) => dateTime[d.value])
              }
              style={{
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc',
                marginRight: 5,
                padding: 10,
                backgroundColor: '#fff',
              }}
            />
            <Picker
              width="48%"
              placeholder="সময়"
              selectedItem={time}
              onSelectItem={(g) => setTime(g)}
              items={times?.length === 0 ? totalTimes : times}
              style={{
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                backgroundColor: '#fff',
              }}
            />
          </View>
        </View>

        <View style={styles.blockContainer}>
          <Text style={styles.bigHeader}>
            {' '}
            আপনি কি আপনার প্রোফাইলটি প্রফেশনালের সাথে শেয়ার করতে ইচ্ছুক?{' '}
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
        {isLoading && (
          <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
        )}
        {error && (
          <Button
            title={error}
            style={{
              marginVertical: 10,
              marginBottom: -6,
              padding: 15,
              backgroundColor: 'white',
              borderColor: colors.primary,
              borderWidth: 3,
            }}
            textStyle={{
              fontSize: 14.5,
              color: colors.primary,
            }}
          />
        )}
        <Button
          title="অ্যাপয়েন্টমেন্ট নিন"
          style={{ marginTop: 15, marginBottom: 15 }}
          onPress={onPressHandler}
          disabled={!(day && time)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  generalInformationContainer: {
    padding: 10,
    paddingBottom: 15,
  },
  gIName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    textTransform: 'uppercase',
  },
  gIOther: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    fontWeight: '300',
    paddingTop: 2,
  },
  blockContainer: {
    padding: 5,
  },
  bigHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingBottom: 4,
  },
  block: {},
  blockHeader: {
    fontSize: 18,
    color: '#333',
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
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
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
