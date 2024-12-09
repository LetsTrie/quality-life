import React, { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import { ApiDefinitions } from '../../services/api';
import { formatDateTime } from '../../utils/date';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBackPress, useHelper } from '../../hooks';
import constants from '../../navigation/constants';
import scalesData from '../../data/profScales';
import { Loader } from '../../components';

const SCREEN_NAME = constants.APPOINTMENT_STATUS;
const AppointmentStatus = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ApiExecutor } = useHelper();

  const { appointmentId, goToBack } = route.params || {};

  useBackPress(SCREEN_NAME, goToBack);

  const [isLoading, setIsLoading] = useState(true);
  const [curAppointment, setCurAppointment] = useState(null);
  const [suggestedScales, setSuggestedScales] = useState([]);

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

    setIsLoading(true);
    const scaleResponse = await ApiExecutor(
      ApiDefinitions.findSuggestedScales({
        professionalId: appointment.prof._id,
      })
    );
    setIsLoading(false);

    if (!scaleResponse.success) return;
    setSuggestedScales(scaleResponse.data.scales ?? []);
  };

  const dialCall = async (number) => {
    if (Platform.OS === 'android') await Linking.openURL(`tel:${number}`);
    else await Linking.openURL(`telprompt:${number}`);
  };

  useEffect(() => {
    getAppointmentDetails();
  }, []);

  if (!curAppointment) return null;

  return (
    <ScrollView style={styles.container}>
      <View>
        {isLoading ? (
          <Loader visible={isLoading} style={{ marginVertical: 20 }} />
        ) : (
          curAppointment && (
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

                {suggestedScales.length > 0 && (
                  <>
                    <View style={[styles.row]}>
                      <Text style={[styles.infoText, { paddingTop: 10, marginBottom: 0 }]}>
                        দয়া করে প্রফেশনাল নির্দেশিত এই স্কেলগুলো পূরণ করুন
                      </Text>
                    </View>

                    {suggestedScales
                      .filter((scale) => !!scalesData.find((_s) => _s.id === scale.assessmentSlug))
                      .map((scale, index) => (
                        <TouchableOpacity
                          style={styles.buttonPrimary}
                          key={index}
                          onPress={() =>
                            // TODO: Update it to TEST
                            navigation.replace(constants.PROF_SUGGESTED_SCALE, {
                              assessmentId: scale._id,
                              slug: scale.assessmentSlug,
                              goToBack,
                              appointmentId,
                            })
                          }
                        >
                          <Text style={styles.buttonText}>
                            {scalesData.find((_s) => _s.id === scale.assessmentSlug).name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </>
                )}
              </View>
            </>
          )
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  headingLarge: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 15,
  },
  textSecondary: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 8, // Rounded corners for modern look
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'center', // Center the button
    width: '100%', // Make it full-width
    marginBottom: 10,
    paddingBottom: 14,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    paddingLeft: 8, // Add some spacing for the icon
  },
});

export default AppointmentStatus;
