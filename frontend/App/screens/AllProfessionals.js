import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../components/Text';
import colors from '../config/colors';
import { numberWithCommas } from '../utils/number';
import { useNavigation } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import SeeMoreButton from '../components/SeeMoreButton';
import { findProfessionalsForUser } from '../services/api';

const SEE_FEE = 'ফি দেখুন';
const SCREEN_NAME = constants.PROFESSIONALS_LIST;

const FeeComponent = ({ feeValue }) => {
  const [fee, setFee] = useState(SEE_FEE);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setFee(isVisible ? `${numberWithCommas(feeValue)} টাকা` : SEE_FEE);
  }, [isVisible, feeValue]);

  return (
    <TouchableOpacity
      style={styles.twoButtonTouchable}
      onPress={() => setIsVisible((prev) => !prev)}
    >
      <Text style={styles.twoButtonText}>{fee}</Text>
    </TouchableOpacity>
  );
};

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const AllProfessionals = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const { processApiError } = useHelper();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { jwtToken } = useSelector((state) => state.auth);

  const [professionals, setProfessionals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSeeMoreLoading, setIsSeeMoreLoading] = useState(false);
  const [isSeeMoreHidden, setIsSeeMoreHidden] = useState(true);
  const [totalProfessionalsCount, setTotalProfessionalsCount] = useState(0);
  const [contactedProfessionals, setContactedProfessionals] = useState([]);
  const [professionalsClient, setProfessionalsClient] = useState([]);

  const fetchProfessionals = async (page = 1) => {
    if (page == 1) {
      setIsLoading(true);
      setProfessionals([]);
      setTotalProfessionalsCount(0);
      setContactedProfessionals([]);
    } else {
      setIsSeeMoreLoading(true);
    }

    const response = await findProfessionalsForUser({ jwtToken, page });

    if (response.success) {
      const { professionalsCount, professionals, appointmentsTaken, isClient } = response.data;

      if (Array.isArray(professionals) && professionals.length > 0) setCurrentPage(page);

      setProfessionals((prev) => [...(prev ?? []), ...professionals]);

      if (page === 1) {
        setTotalProfessionalsCount(professionalsCount);
        setContactedProfessionals(appointmentsTaken);
        setProfessionalsClient(isClient);
      }
    } else {
      console.log(response.error.message);
      processApiError(response);
    }

    if (page === 1) setIsLoading(false);
    else setIsSeeMoreLoading(false);
  };

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchProfessionals();
    wait(2000).then(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [jwtToken]);

  useEffect(() => {
    setIsSeeMoreHidden(professionals.length >= totalProfessionalsCount);
  }, [professionals, totalProfessionalsCount]);

  const RequestAppointmentBtn = ({ prof }) => {
    const isClient = professionalsClient.find((c) => c.prof === prof._id);
    const exists = contactedProfessionals.find((c) => c.prof === prof._id);

    let message = 'অ্যাপয়েন্টমেন্ট নিন';

    if (isClient) {
      message = 'যোগাযোগ করুন';
    } else if (exists) {
      if (exists.status === constants.APPOINTMENT_REQUESTED) {
        message = 'ইতোমধ্যেই অনুরোধ করা হয়েছে';
      } else if (exists.status === constants.APPOINTMENT_ACCEPTED) {
        message = 'আপডেট দেখুন';
      }
    }

    console.log(message);

    return (
      <TouchableOpacity
        style={styles.twoButtonTouchable}
        onPress={() => requestAppointmentButton(prof)}
      >
        <Text style={styles.twoButtonText}>{message}</Text>
      </TouchableOpacity>
    );
  };

  const requestAppointmentButton = (prof) => {
    const isClient = professionalsClient.find((c) => c.prof === prof._id);
    const exists = contactedProfessionals.find((c) => c.prof === prof._id);

    if (isClient) {
      navigation.navigate(constants.APPOINTMENT_STATUS, {
        appointmentId: exists.appointmentId,
        stage: 'is_a_client',
      });
    } else if (!exists) {
      navigation.navigate(constants.PROFESSIONAL_DETAILS, {
        prof,
      });
    } else if (exists.status === constants.APPOINTMENT_ACCEPTED) {
      navigation.navigate(constants.APPOINTMENT_STATUS, {
        appointmentId: exists.appointmentId,
        profId: exists.prof,
      });
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#eee', padding: 10 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
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
          <View>
            {professionals.length === 0 && !isLoading && (
              <Text style={styles.noProfessionalsText}>
                No professionals available at the moment.
              </Text>
            )}
          </View>
          <View style={{ paddingBottom: 10 }}>
            {professionals.map((professional, index) => (
              <React.Fragment key={index}>
                <View style={styles.eProContiner} key={professional._id}>
                  <View style={[styles.proInfoContainer, { paddingBottom: 5 }]}>
                    <Text style={styles.HighlightedtextStyle}>{professional.name}</Text>
                  </View>
                  <View style={styles.proInfoContainer}>
                    <MaterialCommunityIcons
                      name={'card-account-details-star'}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.textStyle}>{professional.profession}</Text>
                  </View>
                  <View style={styles.proInfoContainer}>
                    <MaterialCommunityIcons name={'briefcase-account'} style={styles.iconStyle} />
                    <Text style={styles.textStyle}>{professional.designation}</Text>
                  </View>
                  <View style={styles.proInfoContainer}>
                    <MaterialCommunityIcons name={'map-marker'} style={styles.iconStyle} />
                    <Text style={styles.textStyle}>
                      {[professional.union, professional.upazila, professional.zila]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                  <View style={styles.twoButtonContainer}>
                    <FeeComponent feeValue={professional.fee} />
                    <RequestAppointmentBtn prof={professional} />
                  </View>
                </View>
              </React.Fragment>
            ))}

            {isSeeMoreLoading && (
              <View
                style={{
                  textAlign: 'center',
                  width: '100%',
                  paddingTop: 10,
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {!isSeeMoreHidden && (
              <SeeMoreButton
                text={'See more'}
                onPress={() => fetchProfessionals(currentPage + 1)}
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  twoButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  twoButtonTouchable: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  twoButtonText: {
    color: 'white',
    fontSize: 16,
  },
  eProContiner: {
    elevation: 2,
    padding: 13,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    elevation: 1,
    borderColor: '#ddd',
  },
  proInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  iconStyle: { fontSize: 19, paddingLeft: 2, paddingRight: 2, color: '#444' },
  textStyle: {
    fontSize: 15,
    paddingLeft: 6,
    color: 'gray',
  },
  HighlightedtextStyle: {
    color: '#333',
    fontSize: 24,
    fontWeight: '700',
  },
  noProfessionalsText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
  },
});

export default AllProfessionals;
