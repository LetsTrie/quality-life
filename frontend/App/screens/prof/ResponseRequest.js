import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/Button';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import colors from '../../config/colors';
import assessments from '../../data/profScales';

import { useDispatch, useSelector } from 'react-redux';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation, useRoute } from '@react-navigation/native';
import { respondToClientRequest, seenAppointmentRequest } from '../../services/api';
import { formatDateTime, isValidDate } from '../../utils/date';
import AppDateTimePicker from '../../components/DateTimePicker';

const days = [
  {
    value: 'Sunday',
    label: 'রবিবার',
  },
  {
    value: 'Monday',
    label: 'সোমবার',
  },
  {
    value: 'Tuesday',
    label: 'মঙ্গলবার',
  },
  {
    value: 'Wednesday',
    label: 'বুধবার',
  },
  {
    value: 'Thursday',
    label: 'বৃহস্পতিবার',
  },
  {
    value: 'Friday',
    label: 'শুক্রবার',
  },
  {
    value: 'Saturday',
    label: 'শনিবার',
  },
];

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

const SCREEN_NAME = constants.PROF_RESPONSE_CLIENT_REQUEST;
const ResponseClientRequest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { jwtToken } = useSelector((state) => state.prof);
  const { processApiError } = useHelper();

  const { goToBack: previousPage, appointmentInfo } = route.params;
  useBackPress(SCREEN_NAME, previousPage);

  const { permissionToSeeProfile } = appointmentInfo;

  const userId = appointmentInfo?.user?._id;

  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [responseAlreadySent, setResponseAlreadySent] = useState(false);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [message, setMessage] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  useEffect(() => {
    async function seenAppointment() {
      const { _id: appointmentId } = appointmentInfo;
      const response = await seenAppointmentRequest({
        jwtToken,
        appointmentId,
      });
      if (!response.success) {
        processApiError(response);
      } else {
        const { appointment } = response.data;

        setResponseAlreadySent(appointment.hasProfRespondedToClient);

        if (appointment.hasProfRespondedToClient) {
          setAlreadyExists(true);
        }
      }
      setIsLoading(false);
    }

    seenAppointment();
  }, []);

  let asList = assessments.map((ap) => ({
    label: ap.name,
    value: ap.name,
    id: ap.id,
  }));

  const onSubmitHandler = async () => {
    setIsLoading2(true);

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

    console.log(assessment)

    const payload = {
      dateByProfessional: appointmentDateTime,
      message,
      initAssessmentSlug: assessment?._id,
      userId, 
    }

    console.log(payload)

    const response = await respondToClientRequest({
      jwtToken,
      appointmentId: appointmentInfo._id,
      payload,
    });

    if(!response.success) {
      processApiError(response);
    } else {
      ToastAndroid.show("ক্লায়েন্টের অনুরোধটি গ্রহণ করা হয়েছে", ToastAndroid.SHORT);
      navigation.replace(goToBack)
    }

    setIsLoading2(false);
  };

  const proposedAppointmentDate = formatDateTime(appointmentInfo?.dateByClient);

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      {isLoading ? (
        <View
          style={{
            textAlign: 'center',
            width: '100%',
            paddingTop: 10,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {alreadyExists ? (
            <Text
              style={{
                padding: 10,
                marginTop: 15,
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              ইতোমধ্যে রেসপন্স দেওয়া হয়েছে
            </Text>
          ) : (
            <View style={{ marginHorizontal: 10 }}>
              <View style={styles.nameContainer}>
                <Text style={styles.nameTextStyle}> {appointmentInfo.user.name} </Text>
              </View>
              {permissionToSeeProfile === true ? (
                <TouchableOpacity style={styles.seeProfileContainerStyle}>
                  <TouchableOpacity
                    style={styles.seeProfileStyle}
                    onPress={() =>
                      navigation.navigate('ClientProfile', {
                        userId: appointmentInfo.user._id,
                        goToBack: 'ResponseClientRequest',
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
              {responseAlreadySent ? (
                <Text style={{ textAlign: 'center', paddingTop: 15, fontSize: 20 }}>
                  Response has been sent to Client!
                </Text>
              ) : (
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
                        items={asList}
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
                      placeholderTextColor="#6e6969"
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
                  {isLoading2 && (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                      style={{ paddingTop: 10 }}
                    />
                  )}
                  <Button title="Confirm Request" onPress={onSubmitHandler} />
                </View>
              )}
            </View>
          )}
        </>
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
    borderColor: 'gray',
    marginTop: 5,
    paddingHorizontal: 10,
    marginBottom: 6,

    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default ResponseClientRequest;
