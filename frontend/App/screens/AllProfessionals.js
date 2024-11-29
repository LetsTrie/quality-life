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
import Text from '../components/Text';
import colors from '../config/colors';
import { numberWithCommas } from '../utils/number';
import { useNavigation } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import SeeMoreButton from '../components/SeeMoreButton';
import { ApiDefinitions } from '../services/api';
import { Loader } from '../components';

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

const AllProfessionals = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const { ApiExecutor } = useHelper();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    const response = await ApiExecutor(ApiDefinitions.getAllProfessionalsForUser({ page }));

    if (page === 1) setIsLoading(false);
    else setIsSeeMoreLoading(false);

    if (!response.success) {
      return;
    }

    const { professionalsCount, professionals, appointmentsTaken, isClient } = response.data;
    if (Array.isArray(professionals) && professionals.length > 0) setCurrentPage(page);
    setProfessionals((prev) => [...(prev ?? []), ...professionals]);

    if (page === 1) {
      setTotalProfessionalsCount(professionalsCount);
      setContactedProfessionals(appointmentsTaken);
      setProfessionalsClient(isClient);
    }
  };

  const onRefresh = React.useCallback(() => {
    (async () => {
      setIsRefreshing(true);
      await fetchProfessionals();
      setIsRefreshing(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProfessionals();
    })();
  }, []);

  useEffect(() => {
    setIsSeeMoreHidden(professionals.length >= totalProfessionalsCount);
  }, [professionals, totalProfessionalsCount]);

  const RequestAppointmentBtn = ({ prof }) => {
    const isClient = professionalsClient.find((c) => c.prof === prof._id);
    const existingAp = contactedProfessionals.find((c) => c.prof === prof._id);

    let message = 'অ্যাপয়েন্টমেন্ট নিন';

    if (isClient) {
      message = 'যোগাযোগ করুন';
    } else if (existingAp) {
      if (existingAp.status === constants.APPOINTMENT_REQUESTED) {
        message = 'ইতোমধ্যেই অনুরোধ করা হয়েছে';
      } else if (existingAp.status === constants.APPOINTMENT_ACCEPTED) {
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
    const existingAp = contactedProfessionals.find((c) => c.prof === prof._id);
    console.log(isClient, existingAp);

    if (isClient) {
      navigation.navigate(constants.APPOINTMENT_STATUS, {
        appointmentId: existingAp._id,
        professionalId: existingAp.prof,
      });
    } else if (!existingAp) {
      navigation.navigate(constants.PROFESSIONAL_DETAILS, {
        prof,
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

            <Loader visible={isSeeMoreLoading} style={{ marginVertical: 10 }} />
            {!isSeeMoreHidden && (
              <SeeMoreButton
                text={'আরো দেখুন'}
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
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  twoButtonText: {
    color: 'white',
    fontSize: 14,
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
  iconStyle: {
    fontSize: 19,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 2,
    color: '#444',
  },
  textStyle: {
    fontSize: 15,
    paddingLeft: 6,
    color: 'gray',
  },
  HighlightedtextStyle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 3,
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
