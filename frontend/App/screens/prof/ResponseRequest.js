import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import colors from '../../config/colors';
import assessments from '../../data/profScales';

import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiDefinitions } from '../../services/api';
import { formatDateTime, isValidDate } from '../../utils/date';
import AppDateTimePicker from '../../components/DateTimePicker';
import { ErrorButton, Loader, SubmitButton } from '../../components';
import backScreenMap from '../../navigation/backScreenMap';
import { lightenColor } from '../../utils/ui';
import defaultStyles from '../../config/styles';

function calculateTime(from, fromAmPm) {
  if (from > 24) {
    (from = from - 24), (fromAmPm = 'AM');
  } else if (from === 24) {
    from = 12;
    fromAmPm = 'AM';
  } else if (from > 12) {
    (from = from - 12), (fromAmPm = 'PM');
  } else if (from === 12) {
    fromAmPm = 'PM';
  }
  return [from, fromAmPm];
}

const times = [];
for (let i = 0; i < 24; i++) {
  let [from, fromAmPm] = calculateTime(6 + i, 'AM');
  times.push({
    label: `${from}:00${fromAmPm}`,
    value: `${from}:00${fromAmPm}`,
  });
}

const assessmentList = assessments.map((ap) => ({
  label: ap.name,
  value: ap.name,
  id: ap.id,
}));

const SCREEN_NAME = constants.PROF_RESPONSE_CLIENT_REQUEST;
const ResponseClientRequest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ApiExecutor, refreshNotificationCount } = useHelper();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [appointmentInfo, setAppointmentInfo] = useState(null);

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [message, setMessage] = useState(null);

  const { goToBack: previousPage = backScreenMap[SCREEN_NAME], appointmentId } = route.params;
  useBackPress(SCREEN_NAME, previousPage);

  useEffect(() => {
    if (!appointmentId) {
      setError('অনুগ্রহ করে আবার চেষ্টা করুন');
      return;
    }

    (async () => {
      const seenResponse = await ApiExecutor(
        ApiDefinitions.seenAppointmentRequest({ appointmentId })
      );

      if (!seenResponse.success) {
        setError(seenResponse.error?.message);
        return;
      }

      if (seenResponse.hasProfRespondedToClient) {
        setError('ইতোমধ্যে রেসপন্স দেওয়া হয়েছে');
        return;
      }

      await refreshNotificationCount();

      setError(null);
      setAppointmentInfo(seenResponse.data.appointment);
      setIsLoading(false);
    })();
  }, [appointmentId]);

  const onSubmitHandler = async () => {
    let appointmentDateTime = new Date(appointmentInfo.dateByClient);

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

    const payload = {
      dateByProfessional: appointmentDateTime,
      message,
      initAssessmentSlug: assessment?.id,
      userId,
    };

    setIsSubmitLoading(true);
    const response = await ApiExecutor(
      ApiDefinitions.respondToClientRequest({
        appointmentId,
        payload,
      })
    );
    if (!response.success) {
      setError(response.error?.message);
      return;
    }

    await refreshNotificationCount();
    setIsSubmitLoading(false);

    ToastAndroid.show('ক্লায়েন্টের অনুরোধটি গ্রহণ করা হয়েছে', ToastAndroid.SHORT);
    navigation.replace(previousPage);
  };

  useEffect(() => {
    if (!!error) {
      setIsLoading(false);
      setIsSubmitLoading(false);
    }
  }, [error]);

  if (!appointmentInfo) return null;

  console.log(appointmentInfo);
  const userId = appointmentInfo?.user?._id;
  const username = appointmentInfo?.user?.name;
  const proposedAppointmentDate = formatDateTime(appointmentInfo?.dateByClient);
  const { permissionToSeeProfile } = appointmentInfo;

  return (
    <ScrollView style={{ backgroundColor: lightenColor(colors.background, 60) }}>
      {isLoading ? (
        <Loader visible={isLoading} style={{ marginVertical: 10 }} />
      ) : error ? (
        <ErrorButton visible={error} title={error} style={{ marginVertical: 10 }} />
      ) : (
        <View style={{ marginHorizontal: 10 }}>
          <View style={styles.nameContainer}>
            <Text style={styles.nameTextStyle}> {username} </Text>
          </View>
          {permissionToSeeProfile === true ? (
            <TouchableOpacity style={styles.seeProfileContainerStyle}>
              <TouchableOpacity
                style={styles.seeProfileStyle}
                onPress={() =>
                  navigation.navigate(constants.CLIENT_PROFILE, {
                    userId,
                    goToBack: SCREEN_NAME,
                  })
                }
              >
                <Text style={styles.seeProfileTextStyle}> See Profile </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              ইউজার তার প্রফাইলের তথ্য দেখার অনুমতি প্রদান করেনি
            </Text>
          )}

          <View>
            <View style={{ paddingTop: 10 }}>
              <Text style={styles.blockHeadingStyle}>Proposed time:</Text>
              <Text
                style={{
                  fontSize: 16,
                  paddingTop: 2,
                  color: '#333',
                  paddingBottom: 7,
                }}
              >
                {proposedAppointmentDate}
              </Text>
            </View>
            <View>
              <Text style={styles.blockHeadingStyle}>
                Select a flexible time:{' '}
                <Text
                  style={{
                    fontWeight: 'normal',
                    fontSize: 14.5,
                    color: '#555',
                  }}
                >
                  (optional)
                </Text>
              </Text>
              <View style={styles.pickerContainer}>
                <View style={{ width: '50%' }}>
                  <AppDateTimePicker
                    width="98%"
                    placeholder="Select Date"
                    mode="date" // or "time"
                    onSelectDateTime={(date) => setDay(date)}
                    selectedDateTime={day}
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <AppDateTimePicker
                    placeholder="Select Time"
                    mode="time"
                    onSelectDateTime={(date) => setTime(date)}
                    selectedDateTime={time}
                  />
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.blockHeadingStyle}>
                Select an Assessment Tool:{' '}
                <Text
                  style={{
                    fontWeight: 'normal',
                    fontSize: 14.5,
                    color: '#555',
                  }}
                >
                  (optional)
                </Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  width="100%"
                  placeholder="Assessment Tools"
                  selectedItem={assessment}
                  onSelectItem={(g) => setAssessment(g)}
                  items={assessmentList}
                  style={{
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginRight: 5,
                    padding: 10,
                    backgroundColor: '#fff',
                  }}
                />
              </View>
            </View>
            <View>
              <Text style={styles.blockHeadingStyle}>
                Send a message:{' '}
                <Text
                  style={{
                    fontWeight: 'normal',
                    fontSize: 14.5,
                    color: '#555',
                  }}
                >
                  (optional)
                </Text>
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={5}
                onChangeText={(text) => setMessage(text)}
                style={styles.textAreaStyle}
                placeholder="Details about how to communicate with you. (i.e. please contact me from Sunday to Thursday within 9 AM to 3 PM at +8801*****)"
                placeholderTextColor={defaultStyles.colors.medium}
              />
            </View>
            <Text
              style={{
                color: 'gray',
                fontSize: 13,
                marginBottom: 6,
                lineHeight: 16,
                textAlign: 'center',
              }}
            >
              After confirming the request, your phone number will be send to client.
            </Text>

            <Loader visible={isSubmitLoading} style={{ marginVertical: 10 }} />
            <SubmitButton title={'Confirm Request'} onPress={onSubmitHandler} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nameContainer: {},
  nameTextStyle: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 22.5,
    fontWeight: 'bold',
    color: '#222',
    textTransform: 'uppercase',
  },
  seeProfileContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  seeProfileStyle: {
    backgroundColor: colors.primary,
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  seeProfileTextStyle: {
    color: '#eee',
    fontSize: 15,
  },
  blockHeadingStyle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 0,
    color: '#222',
  },
  textAreaStyle: {
    marginTop: 5,
    paddingHorizontal: 10,
    marginBottom: 6,

    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: colors.white,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default ResponseClientRequest;
