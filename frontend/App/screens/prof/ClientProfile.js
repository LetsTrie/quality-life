import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import AppButton from '../../components/Button';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import assessments from '../../data/profScales';
import { logoutAction } from '../../redux/actions/prof';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const routeName = 'ClientProfile';

const ClientProfile = ({ navigation, route, ...props }) => {
  let goToBack = route.params.goToBack ?? 'ProHomepage';
  const { userId } = route.params;

  const [refreshing, setRefreshing] = React.useState(false);
  const [scaleLoading, setScaleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Remove
  const [userData, setUserData] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const { jwtToken, isAuthenticated, clients, logoutAction, addAllMyClient } =
    props;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };

  const signOutHandler = () => {
    logoutAction();
    navigation.navigate('LoginPro');
  };

  let asList = assessments.map((ap) => ({
    label: ap.name,
    value: ap.name,
    id: ap.id,
  }));

  const getProfileDetails = async () => {
    if (!isAuthenticated) {
      signOutHandler();
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${BaseUrl}/prof/user-profile/${userId}`,
        { headers }
      );
      setUserData(response.data);
      setUserStatus(
        response.data.user.isMarried === 'Unmarried'
          ? `অবিবাহিত, বয়স - ${response.data.user.age}`
          : `বিবাহিত, বয়স - ${response.data.user.age}`
      );
    } catch (err) {
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfileDetails();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  function handleBackButtonClick() {
    navigation.navigate(goToBack);
    return true;
  }

  useEffect(() => {
    getProfileDetails();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick
      );
    };
  }, []);

  const suggestScaleHandler = async () => {
    if (!isAuthenticated) {
      signOutHandler();
      return;
    }
    if (!userId || !assessment) return;
    setSuccess(false);
    setScaleLoading(true);
    const assessmentId = assessment.id;
    const data = { userId, assessmentId };

    try {
      await axios.post(`${BaseUrl}/prof/suggest-scale`, data, {
        headers,
      });
      setScaleLoading(false);
      setSuccess(true);
      setAssessment(null);
      setTimeout(function () {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setScaleLoading(false);
    }
  };

  const ThreeScaleTestBlock = (props) => {
    const { name, data } = props;
    const onPress = () => {
      navigation.navigate('ClientTestResult', { ...data, testname: name });
    };
    return (
      <TouchableOpacity
        style={styles.testBlock}
        onPress={data ? onPress : undefined}
      >
        <Text style={styles.testName}> {name} </Text>
        {data ? (
          <View>
            <View style={styles.matraResultBlock}>
              <Text style={styles.matraStyle}>{data.stage}</Text>
              <View style={styles.seeResult}>
                <Text style={styles.seeResultText}> রেজাল্ট দেখুন </Text>
                <MaterialCommunityIcons
                  name={'arrow-right'}
                  style={styles.seeResultIcon}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text
            style={{
              textAlign: 'right',
              paddingRight: 10,
              fontSize: 15,
              color: 'gray',
              fontWeight: 'bold',
            }}
          >
            পূরণ করেনি{' '}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <View style={styles.oneBigBlock}>
            <View style={styles.heading}>
              <Text style={styles.headingTextStyle}>{userData.user.name}</Text>
            </View>
            <View style={styles.someDetails}>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons
                  name={'card-account-details'}
                  style={styles.iconStyle}
                />
                <Text style={styles.descStyle}> {userStatus} </Text>
              </View>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons
                  name={'map-marker-radius'}
                  style={styles.iconStyle}
                />
                <Text style={styles.descStyle}>{userData.user.address}</Text>
              </View>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons
                  name={'email'}
                  style={styles.iconStyle}
                />
                <Text style={styles.descStyle}>{userData.user.email}</Text>
              </View>
            </View>
          </View>
          {goToBack === 'ProMyClients' && (
            <View style={styles.oneBigBlock}>
              <View style={styles.heading}>
                <Text style={styles.headingTextStyle}> Suggest Scale </Text>
              </View>
              <View>
                <View style={styles.pickerContainer}>
                  <Picker
                    width='100%'
                    placeholder='Assessment Tools'     
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
                {scaleLoading ? (
                  <View
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      paddingTop: 5,
                    }}
                  >
                    <ActivityIndicator size='large' color={colors.primary} />
                  </View>
                ) : (
                  <>
                    {success && (
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 13,
                          paddingBottom: 5,
                          fontWeight: 'bold',
                          color: colors.primary,
                        }}
                      >
                        "{userData.user.name}" has been adviced to do this test
                      </Text>
                    )}
                    <AppButton title='Send' onPress={suggestScaleHandler} />
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.oneBigBlock}>
            <View style={styles.heading}>
              <Text style={styles.headingTextStyle}> Three Scales </Text>
            </View>
            <View style={styles.testDetails}>
              <ThreeScaleTestBlock
                name={'মানসিক অবস্থা যাচাইকরণ'}
                data={userData.progress.manoshikObosthaJachaikoron}
              />
              <ThreeScaleTestBlock
                name={'মানসিক চাপ নির্ণয়'}
                data={userData.progress.manoshikChapNirnoy}
              />
              <ThreeScaleTestBlock
                name={'দুশ্চিন্তা নির্ণয়'}
                data={userData.progress.duschintaNirnoy}
              />
            </View>
          </View>
          <View style={styles.oneBigBlock}>
            <View style={styles.heading}>
              <Text style={styles.headingTextStyle}>
                {' '}
                গুরুত্বপূর্ণ তথ্যাবলী{' '}
              </Text>
            </View>
            <View style={styles.testDetails}>
              <ThreeScaleTestBlock
                name={'করোনা সম্পর্কিত তথ্য'}
                data={userData.progress.coronaProfile}
              />
              <ThreeScaleTestBlock
                name={'গুরুতর সমস্যা সম্পর্কিত তথ্য'}
                data={userData.progress.psychoticProfile}
              />
              <ThreeScaleTestBlock
                name={'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য'}
                data={userData.progress.suicideIdeation}
              />
              <ThreeScaleTestBlock
                name={'পারিবারিক সহিংসতা সম্পর্কিত তথ্য'}
                data={userData.progress.domesticViolence}
              />
              <ThreeScaleTestBlock
                name={'সন্তান পালন সম্পর্কিত তথ্য'}
                data={userData.progress.childCare}
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  timeStyle: {},
  timeStyleIcon: {
    fontSize: 16,
    color: '#666',
  },
  timeTextStyle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    paddingLeft: 10,
  },
  testDetails: {},
  testBlock: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    borderRadius: 4,
    elevation: 1,
    padding: 4,
    paddingVertical: 6,
  },
  testName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  matraResultBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 3,
  },
  matraStyle: {
    fontSize: 15,
    color: '#666',
  },
  seeResult: {
    flexDirection: 'row',
  },
  seeResultText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  seeResultIcon: {
    fontSize: 18,
    marginRight: 4,
    color: colors.primary,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  someDetails: {
    paddingTop: 10,
  },
  iconBlockStyle: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: 5,
  },
  iconStyle: {
    fontSize: 20,
    marginRight: 4,
    color: '#444',
  },
  descStyle: {
    color: '#333',
    fontSize: 16.5,
    paddingLeft: 3.5,
  },
  oneBigBlock: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 2,
    borderRadius: 5,
    padding: 10,
    marginBottom: 0,
    backgroundColor: 'white',
  },
  heading: {
    paddingBottom: 12,
  },
  headingTextStyle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

const mapStateToProps = (state) => ({
  jwtToken: state.prof.jwtToken,
  isAuthenticated: state.prof.isAuthenticated,
});

const mapActionToProps = { logoutAction };

export default connect(mapStateToProps, mapActionToProps)(ClientProfile);
