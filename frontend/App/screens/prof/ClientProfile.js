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
import AppButton from '../../components/Button';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import colors from '../../config/colors';
import assessments from '../../data/profScales';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserProfileFromProfessional, suggestScaleToClient } from '../../services/api';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

let assessmentList = assessments.map((assessment) => ({
  label: assessment.name,
  value: assessment.name,
  id: assessment.id,
}));

const SCREEN_NAME = constants.CLIENT_PROFILE;

const ClientProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { processApiError } = useHelper();

  const { jwtToken } = useSelector((state) => state.auth);

  const { goToBack, userId } = route.params;

  useBackPress(SCREEN_NAME, goToBack);

  const [refreshing, setRefreshing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [scaleLoading, setScaleLoading] = useState(false);

  const [showAdviceToDoTest, setShowAdviceToDoTest] = useState(false);

  const [userData, setUserData] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const getProfileDetails = async () => {
    setIsLoading(true);

    const response = await getUserProfileFromProfessional({
      jwtToken,
      userId,
    });

    if (!response.success) {
      processApiError(response);
    } else {
      setUserData(response.data);
      setUserStatus(
        response.data.user.isMarried === 'Unmarried'
          ? `অবিবাহিত, বয়স - ${response.data.user.age}`
          : `বিবাহিত, বয়স - ${response.data.user.age}`
      );
    }

    setIsLoading(false);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfileDetails();
    wait(1000).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    getProfileDetails();
  }, []);

  const suggestScaleHandler = async () => {
    if (!userId || !assessment) return;

    setShowAdviceToDoTest(false);
    setScaleLoading(true);

    const assessmentSlug = assessment.id;
    const payload = { userId, assessmentSlug };

    const response = await suggestScaleToClient({ jwtToken, payload });
    if (!response.success) {
      processApiError(response);
    } else {
      setShowAdviceToDoTest(true);
      setTimeout(function () {
        setShowAdviceToDoTest(false);
      }, 2000);
    }

    setScaleLoading(false);
  };

  const ThreeScaleTestBlock = (props) => {
    const { name, data } = props;
    const onPress = () => {
      navigation.navigate('ClientTestResult', { ...data, testname: name });
    };
    return (
      <TouchableOpacity style={styles.testBlock} onPress={data ? onPress : undefined}>
        <Text style={styles.testName}> {name} </Text>
        {data ? (
          <View>
            <View style={styles.matraResultBlock}>
              <Text style={styles.matraStyle}>{data.stage}</Text>
              <View style={styles.seeResult}>
                <Text style={styles.seeResultText}> রেজাল্ট দেখুন </Text>
                <MaterialCommunityIcons name={'arrow-right'} style={styles.seeResultIcon} />
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      style={styles.scrollView}
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
            <ActivityIndicator size="large" color={colors.primary} />
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
                <MaterialCommunityIcons name={'card-account-details'} style={styles.iconStyle} />
                <Text style={styles.descStyle}> {userStatus} </Text>
              </View>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons name={'map-marker-radius'} style={styles.iconStyle} />
                <Text style={styles.descStyle}>{userData.user.address}</Text>
              </View>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons name={'email'} style={styles.iconStyle} />
                <Text style={styles.descStyle}>{userData.user.email}</Text>
              </View>
            </View>
          </View>
          {(true || goToBack === 'ProMyClients') && (
            <View style={styles.oneBigBlock}>
              <View style={styles.heading}>
                <Text style={styles.headingTextStyle}> Suggest Scale </Text>
              </View>
              <View>
                <View style={styles.pickerContainer}>
                  <Picker
                    width="100%"
                    placeholder="Assessment Tools"
                    selectedItem={assessment}
                    onSelectItem={(item) => setAssessment(item)}
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
                {scaleLoading ? (
                  <View
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      paddingTop: 5,
                    }}
                  >
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <>
                    {showAdviceToDoTest && (
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
                    <AppButton title="Send" onPress={suggestScaleHandler} />
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
              <Text style={styles.headingTextStyle}> গুরুত্বপূর্ণ তথ্যাবলী </Text>
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
  scrollView: {
    marginTop: 10,
  },
  oneBigBlock: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 0,
  },
  heading: {
    paddingBottom: 12,
  },
  headingTextStyle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  someDetails: {
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  iconBlockStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconStyle: {
    fontSize: 22,
    marginRight: 8,
    color: '#f44336',
  },
  descStyle: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  testDetails: {
    paddingTop: 8,
  },
  testBlock: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testName: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  matraResultBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  matraStyle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  seeResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeResultText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
  seeResultIcon: {
    fontSize: 20,
    marginLeft: 6,
    color: '#f44336',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
  },
});

export default ClientProfile;
