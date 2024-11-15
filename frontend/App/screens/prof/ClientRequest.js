import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Text from '../../components/Text';
import colors from '../../config/colors';
import { useBackPress, useHelper } from '../../hooks';
import constants from '../../navigation/constants';
import {
  addClientRequests,
  clearClientRequests,
  seenRequestAction,
} from '../../redux/actions/prof_req';
import { getAppointments } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import SeeMoreButton from '../../components/SeeMoreButton';
import { formatDateTime } from '../../utils/date';

const SCREEN_NAME = constants.PROF_CLIENT_REQUEST;

const ClientRequest = () => {
  useBackPress(SCREEN_NAME);
  const { processApiError } = useHelper();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hideSeeMoreButton, setHideSeeMoreButton] = useState(true);
  const [requestsCount, setRequestsCount] = useState(0);

  const { jwtToken } = useSelector((state) => state.prof);
  const { requests } = useSelector((state) => state.profRequests);

  const clearPageData = useCallback(() => {
    setPage(1);
    setRequestsCount(0);
    dispatch(clearClientRequests());
  }, [dispatch]);

  const getClientRequests = async (page = 1) => {
    if (page === 1) {
      clearPageData();
      setIsLoading(true);
    } else {
      setSeeMoreLoading(true);
    }

    const response = await getAppointments({ jwtToken, page });
    if (!response.success) {
      processApiError(response);
      ToastAndroid.show(response.error.message, ToastAndroid.SHORT);
    } else {
      if (page === 1) {
        setRequestsCount(response.data.requestsCount);
      }
      setPage(page);
      dispatch(addClientRequests(response.data.requests));
    }

    page === 1 ? setIsLoading(false) : setSeeMoreLoading(false);
  };

  useEffect(() => {
    setHideSeeMoreButton(requests.length >= requestsCount);
  }, [requests, requestsCount]);

  const handleSendResponse = (apRequest) => {
    dispatch(seenRequestAction(apRequest));
    navigation.navigate(constants.PROF_RESPONSE_CLIENT_REQUEST, {
      appointmentInfo: apRequest,
      goToBack: SCREEN_NAME,
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  useEffect(() => {
    if (refreshing) {
      getClientRequests().finally(() => setRefreshing(false));
    } else {
      getClientRequests();
    }
  }, [refreshing]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View>
          {!requests || requests.length === 0 ? (
            <Text style={styles.noRequestsText}>No Client Request Available</Text>
          ) : (
            <>
              {
                requests.map((apRequest) => (
                  <View style={styles.requestBlock} key={apRequest._id}>
                    <Text style={styles.requestName}> {apRequest.user.name} </Text>
                    <View style={styles.requestInfo}>
                      <MaterialCommunityIcons name="card-account-details" style={styles.icon} />
                      <Text style={styles.requestText}>
                        {`${
                          apRequest.user.isMarried ? 'বিবাহিত' : 'অবিবাহিত'
                        }, বয়স - ${apRequest.user.age}`}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <MaterialCommunityIcons name="map-marker-radius" style={styles.icon} />
                      <Text style={styles.requestText}>
                        {[
                          apRequest.user.location.union,
                          apRequest.user.location.upazila,
                          apRequest.user.location.zila,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <MaterialCommunityIcons name="clock-time-three" style={styles.icon} />
                      <Text style={styles.requestText}> {formatDateTime(apRequest.dateByClient)} </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.responseButton}
                      onPress={() => handleSendResponse(apRequest)}
                    >
                      <View style={styles.responseButtonContent}>
                        <Text style={styles.responseButtonText}>Send Response</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              {seeMoreLoading && (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
              {!hideSeeMoreButton && (
                <View style={styles.seeMoreContainer}>
                  <SeeMoreButton text="See more" onPress={() => getClientRequests(page + 1)} />
                </View>
              )}
            </>
          )}
        </View>
      )}
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
  noRequestsText: {
    textAlign: 'center',
    paddingTop: 15,
    fontWeight: 'bold',
    fontSize: 22,
    color: '#333',
  },
  requestBlock: {
    padding: 10,
    margin: 10,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 5,
    elevation: 1,
    backgroundColor: 'white',
  },
  requestName: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 3,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  icon: {
    color: '#444',
    fontSize: 18.5,
    paddingHorizontal: 5,
  },
  requestText: {
    color: '#333',
    fontSize: 15.5,
  },
  responseButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  responseButtonContent: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    elevation: 1,
  },
  responseButtonText: {
    color: '#eee',
    padding: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    paddingBottom: 10,
  },
  buttonContent: {
    backgroundColor: '#139b64',
    flexDirection: 'row',
    padding: 8,
    paddingRight: 12,
    borderRadius: 4,
    elevation: 1,
  },
  buttonIcon: {
    color: colors.white,
    paddingRight: 3,
    marginRight: -3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
  },
});

export default ClientRequest;
