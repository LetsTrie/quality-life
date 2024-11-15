import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
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
import { connect } from 'react-redux';
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { logoutAction } from '../../redux/actions/auth';

const AppointmentStatus = ({ navigation, route, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [appointmentScale, setAppointmentScale] = useState();
  const { appointmentId, questionId, profId, notificationId, stage } = route.params;

  const getAppointmentDetails = async () => {
    try {
      const { data: response } = await axios.get(
        `${BaseUrl}/user/appointment/status/${appointmentId}`
      );
      setData(response.appointment);
      if (questionId) {
        await setAppointmentScale(questionId)
      }
      else {
        await setAppointmentScale(response?.appointment?.appointmentScale)
      }
    } catch (err) {
      console.log(err?.response);
    } finally {
      setIsLoading(false);
    }
  };

  const dialCall = async (number) => {
    if (Platform.OS === 'android') await Linking.openURL(`tel:${number}`);
    else await Linking.openURL(`telprompt:${number}`);
  };

  useEffect(() => {
    getAppointmentDetails();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        {isLoading ? (
          <>
            <View
              style={{
                textAlign: 'center',
                width: '100%',
                paddingTop: 10,
              }}
            >
              <ActivityIndicator size='large' color={colors.primary} />
            </View>
          </>
        ) : (
          <>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 28,
                  fontWeight: 'bold',
                  paddingTop: 10,
                }}
              >
                {data.profName}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  paddingTop: 4,
                  color: '#444',
                }}
              >
                {data.profEmail}
              </Text>
              <TouchableOpacity onPress={() => dialCall(data.profPhoneNumber)}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    paddingTop: 5,
                    color: '#444',
                  }}
                >
                  {data.profPhoneNumber}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 13,
                  padding: 10,
                  paddingTop: 5,
                  lineHeight: 17,
                  textAlign: 'center',
                  color: 'gray',
                }}
              >
                আপনি এখন প্রফেশনালের সাথে কল বা ইমেইলের মাধ্যমে সরাসরি যোগাযোগ
                করতে পারবেন
              </Text>
            </View>
            {stage !== 'is_a_client' && <>
              < View style={{ padding: 10 }}>
                <View style={{ paddingBottom: 7 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
                    Patient:
                  </Text>
                  <Text style={{ color: '#222', fontSize: 17 }}>
                    {data.userName}
                  </Text>
                </View>
                <View style={{ paddingBottom: 7 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: 'bold', paddingBottom: 2 }}
                  >
                    Appointmnet schedule:
                  </Text>
                  <Text style={{ color: '#222', fontSize: 17 }}>
                    {data.appointmentTime}
                  </Text>
                </View>

                {data.appointmentMessage && (
                  <View style={{ paddingBottom: 7 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        paddingBottom: 2,
                      }}
                    >
                      Message:
                    </Text>
                    <Text style={{ color: '#222', fontSize: 17 }}>
                      {data.appointmentMessage}
                    </Text>
                  </View>
                )}
                {data.appointmentScale && (
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      backgroundColor: colors.primary,
                      borderRadius: 5,
                      paddingVertical: 15,
                      marginTop: 10,
                    }}
                    onPress={() =>
                      navigation.navigate('ProfSuggestedScale', {
                        questionId: appointmentScale,
                        profId,
                        notificationId, appointmentId,
                      })
                    }
                  >
                    <View
                      style={{ flexDirection: 'row', justifyContent: 'center' }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          color: 'white',
                          fontSize: 20,
                          fontWeight: 'bold',
                        }}
                      >
                        স্কেলটি পূরণ করুন
                      </Text>
                      <MaterialCommunityIcons
                        name='arrow-right-circle'
                        color='white'
                        size={25}
                        style={{ paddingLeft: 10, paddingTop: 3 }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </>
            }
          </>
        )
        }
      </View >
    </ScrollView >
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
    fontSize: 20,
    fontWeight: 'bold',
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
    backgroundColor: colors.primary,
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
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  jwtToken: state.auth.jwtToken,
});

export default connect(mapStateToProps, { logoutAction })(AppointmentStatus);
