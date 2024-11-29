import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import { ApiDefinitions } from '../../services/api';
import { formatDateTime } from '../../utils/date';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBackPress, useHelper } from '../../hooks';
import constants from '../../navigation/constants';

const SCREEN_NAME = constants.APPOINTMENT_STATUS;
const AppointmentStatus = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const route = useRoute();
  const { ApiExecutor } = useHelper();

  const [isLoading, setIsLoading] = useState(true);
  const [curAppointment, setCurAppointment] = useState(null);

  const { appointmentId, notificationId } = route.params;

  const getAppointmentDetails = async () => {
    const response = await ApiExecutor(
      ApiDefinitions.findAppointmentById({
        appointmentId,
      })
    );
    setIsLoading(false);

    if (!response.success) return;

    const { appointment } = response.data;
    setCurAppointment(appointment);
  };

  const dialCall = async (number) => {
    if (Platform.OS === 'android') await Linking.openURL(`tel:${number}`);
    else await Linking.openURL(`telprompt:${number}`);
  };

  useEffect(() => {
    getAppointmentDetails();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View>
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {curAppointment && (
              <>
                <View>
                  <Text style={styles.headingLarge}>{curAppointment.prof.name}</Text>
                  <Text style={styles.textSecondary}>{curAppointment.prof.email}</Text>
                  <TouchableOpacity onPress={() => dialCall(curAppointment.prof.telephone)}>
                    <Text style={styles.textSecondary}>{curAppointment.prof.telephone}</Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text style={styles.infoText}>
                    আপনি এখন প্রফেশনালের সাথে কল বা ইমেইলের মাধ্যমে সরাসরি যোগাযোগ করতে পারবেন
                  </Text>
                </View>

                <View style={styles.section}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Patient:</Text>
                    <Text style={styles.value}>{curAppointment.user.name}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Appointment schedule:</Text>
                    <Text style={styles.value}>
                      {formatDateTime(
                        curAppointment.dateByProfessional || curAppointment.dateByClient
                      )}
                    </Text>
                  </View>

                  {curAppointment.messageFromProf && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Message:</Text>
                      <Text style={styles.value}>{curAppointment.messageFromProf}</Text>
                    </View>
                  )}

                  {curAppointment.initAssessmentId && (
                    <TouchableOpacity
                      style={styles.buttonPrimary}
                      onPress={() =>
                        navigation.navigate('ProfSuggestedScale', {
                          questionId: curAppointment.initAssessmentId,
                          profId: curAppointment.prof._id,
                          notificationId,
                          appointmentId: curAppointment._id,
                        })
                      }
                    >
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>স্কেলটি পূরণ করুন</Text>
                        <MaterialCommunityIcons
                          name="arrow-right-circle"
                          color="white"
                          size={25}
                          style={styles.buttonIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  loader: {
    textAlign: 'center',
    width: '100%',
    paddingTop: 10,
  },
  headingLarge: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 10,
  },
  textSecondary: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 4,
    color: '#444',
  },
  infoText: {
    fontSize: 13,
    padding: 10,
    paddingTop: 5,
    lineHeight: 17,
    textAlign: 'center',
    color: 'gray',
  },
  section: {
    padding: 10,
  },
  row: {
    paddingBottom: 7,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 2,
  },
  value: {
    color: '#222',
    fontSize: 17,
  },
  buttonPrimary: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonIcon: {
    paddingLeft: 10,
    paddingTop: 3,
  },
});

export default AppointmentStatus;
