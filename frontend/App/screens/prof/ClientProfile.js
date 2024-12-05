import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import colors from '../../config/colors';
import assessments from '../../data/profScales';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiDefinitions } from '../../services/api';
import { ErrorButton, Loader, SubmitButton } from '../../components';
import { capitalizeFirstLetter } from '../../utils/string';
import { lightenColor } from '../../utils/ui';
import { typeLabelMap } from '../../utils/type';
import { useIsFocused } from '@react-navigation/native';

let assessmentList = assessments.map((assessment) => ({
  label: assessment.name,
  value: assessment.name,
  id: assessment.id,
}));

const SCREEN_NAME = constants.CLIENT_PROFILE;

const ClientProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { ApiExecutor } = useHelper();
  const isFocused = useIsFocused();

  const { goToBack, userId, clientId } = route.params;

  useBackPress(SCREEN_NAME, goToBack);

  const [refreshing, setRefreshing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [scaleLoading, setScaleLoading] = useState(false);

  const [showAdviceToDoTest, setShowAdviceToDoTest] = useState(false);

  const [userData, setUserData] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);

  const [prevSuggestedScalesLoading, setPrevSuggestedScalesLoading] = useState(false);
  const [prevSuggestedScales, setPrevSuggestedScales] = useState([]);

  const getProfileDetails = async () => {
    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.getUserProfileForProfessional({ userId }));
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setUserData(response.data);
    setUserStatus(
      response.data.user.isMarried === 'Unmarried'
        ? `অবিবাহিত, বয়স - ${response.data.user.age}`
        : `বিবাহিত, বয়স - ${response.data.user.age}`
    );
  };

  const getSuggestedScalesByClient = async () => {
    if (!clientId) {
      throw new Error('clientId is not defined');
    }

    setPrevSuggestedScalesLoading(true);
    const response = await ApiExecutor(
      ApiDefinitions.getSuggestedScalesByClient({
        clientId,
      })
    );
    setPrevSuggestedScalesLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }
    const { scales } = response.data;
    setPrevSuggestedScales(scales);
  };

  const init = async () => {
    await getProfileDetails();
    await getSuggestedScalesByClient();
  };

  useEffect(() => {
    if (!isFocused) return;

    (async () => {
      await init();
    })();
  }, [isFocused]);

  const onRefresh = React.useCallback(() => {
    (async () => {
      setRefreshing(true);
      await init();
      setRefreshing(false);
    })();
  }, []);

  const suggestScaleHandler = async () => {
    if (!assessment) return;

    if (!userId || !clientId) {
      throw new Error('userId or clientId is not defined');
    }

    setShowAdviceToDoTest(false);
    setScaleLoading(true);

    const assessmentSlug = assessment.id;
    const payload = { userId, clientId, assessmentSlug };

    const response = await ApiExecutor(
      ApiDefinitions.suggestScaleToClient({
        payload,
      })
    );

    setScaleLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setAssessment(null);
    await getSuggestedScalesByClient();
  };

  const ThreeScaleTestBlock = ({ name, isDataPresent, testId, stage, isSpecialTest }) => {
    const onPress = () => {
      if (!isDataPresent) return;
      navigation.navigate(constants.CLIENT_TEST_RESULT, {
        testId,
        isSpecialTest,
      });
    };
    return (
      <TouchableOpacity style={styles.testBlock} onPress={onPress}>
        <Text style={styles.testName}>{name}</Text>
        {isDataPresent ? (
          <View>
            <View style={styles.matraResultBlock}>
              <View style={styles.seeResult}>
                <Text style={styles.seeResultText}> স্কোর দেখুন </Text>
                <MaterialCommunityIcons name={'arrow-right'} style={styles.seeResultIcon} />
              </View>
              <Text style={styles.matraStyle}>{stage}</Text>
            </View>
          </View>
        ) : (
          <Text
            style={{
              textAlign: 'right',
              paddingRight: 10,
              fontSize: 14,
              color: colors.shadow,
              fontWeight: 'bold',
            }}
          >
            পূরণ করেনি
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!userData) return null;
  if (!userData?.user?.name) return null;

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      style={styles.scrollView}
    >
      {isLoading ? (
        <Loader visible={isLoading} style={{ marginVertical: 10 }} />
      ) : error ? (
        <ErrorButton visible={error} title={error} style={{ marginVertical: 10 }} />
      ) : (
        <>
          <View style={styles.oneBigBlock}>
            <View style={[styles.heading, { marginBottom: 3 }]}>
              <Text style={styles.headingTextStyle}>
                {capitalizeFirstLetter(userData.user.name)}
              </Text>
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
          <View style={styles.oneBigBlock}>
            <View style={styles.heading}>
              <Text style={styles.headingTextStyle}> Three Scales </Text>
            </View>
            <View style={[styles.testDetails, { marginTop: 10 }]}>
              <ThreeScaleTestBlock
                name={'মানসিক অবস্থা যাচাইকরণ'}
                isDataPresent={!!userData?.progress?.manoshikObosthaJachaikoron}
                testId={userData?.progress?.manoshikObosthaJachaikoron?.test_id}
                stage={userData?.progress?.manoshikObosthaJachaikoron?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'মানসিক চাপ নির্ণয়'}
                isDataPresent={!!userData?.progress?.manoshikChapNirnoy}
                testId={userData?.progress?.manoshikChapNirnoy?.test_id}
                stage={userData?.progress?.manoshikChapNirnoy?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'দুশ্চিন্তা নির্ণয়'}
                isDataPresent={!!userData?.progress?.duschintaNirnoy}
                testId={userData?.progress?.duschintaNirnoy?.test_id}
                stage={userData?.progress?.duschintaNirnoy?.stage}
                isSpecialTest={false}
              />
            </View>
          </View>
          <View style={styles.oneBigBlock}>
            <View style={styles.heading}>
              <Text style={[styles.headingTextStyle, { marginBottom: 12 }]}>
                গুরুত্বপূর্ণ তথ্যাবলী
              </Text>
            </View>
            <View style={styles.testDetails}>
              <ThreeScaleTestBlock
                name={'করোনা সম্পর্কিত তথ্য'}
                isDataPresent={!!userData?.progress?.coronaProfile}
                testId={userData?.progress?.coronaProfile?.test_id}
                stage={userData?.progress?.coronaProfile?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'গুরুতর সমস্যা সম্পর্কিত তথ্য'}
                isDataPresent={!!userData?.progress?.psychoticProfile}
                testId={userData?.progress?.psychoticProfile?.test_id}
                stage={userData?.progress?.psychoticProfile?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য'}
                isDataPresent={!!userData?.progress?.suicideIdeation}
                testId={userData?.progress?.suicideIdeation?.test_id}
                stage={userData?.progress?.suicideIdeation?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'পারিবারিক সহিংসতা সম্পর্কিত তথ্য'}
                isDataPresent={!!userData?.progress?.domesticViolence}
                testId={userData?.progress?.domesticViolence?.test_id}
                stage={userData?.progress?.domesticViolence?.stage}
                isSpecialTest={false}
              />
              <ThreeScaleTestBlock
                name={'সন্তান পালন সম্পর্কিত তথ্য'}
                isDataPresent={!!userData?.progress?.childCare}
                testId={userData?.progress?.childCare?.test_id}
                stage={userData?.progress?.childCare?.stage}
                isSpecialTest={false}
              />
            </View>
          </View>

          {goToBack === constants.PROFESSIONALS_CLIENT && (
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
                      marginBottom: 3,
                    }}
                  />
                </View>
                {scaleLoading ? (
                  <Loader visible={scaleLoading} />
                ) : (
                  <>
                    {showAdviceToDoTest && (
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 13,
                          marginTop: -5,
                          paddingBottom: 5,
                          fontWeight: 'bold',
                          color: colors.primary,
                        }}
                      >
                        Assessment recommended for {capitalizeFirstLetter(userData.user.name)}
                      </Text>
                    )}
                    <SubmitButton
                      title={'Recommend Assessment'}
                      onPress={suggestScaleHandler}
                      style={{
                        width: '100%',
                        marginTop: 0,
                        marginBottom: 10,
                        backgroundColor: colors.secondary,
                        paddingVertical: 14,
                      }}
                      textStyle={{
                        fontSize: 14,
                      }}
                    />
                  </>
                )}
              </View>
            </View>
          )}

          {prevSuggestedScalesLoading && (
            <Loader visible={prevSuggestedScalesLoading} style={{ marginVertical: 10 }} />
          )}
          {goToBack === constants.PROFESSIONALS_CLIENT && prevSuggestedScales.length > 0 && (
            <View style={[styles.oneBigBlock, { marginBottom: 25 }]}>
              <View style={styles.heading}>
                <Text style={styles.headingTextStyle}> Previous Suggested Scales </Text>
              </View>

              <View style={[styles.testDetails, { marginTop: 10 }]}>
                {prevSuggestedScales.map((suggScale) => (
                  <ThreeScaleTestBlock
                    name={typeLabelMap(suggScale.assessmentSlug)}
                    isDataPresent={suggScale.hasCompleted}
                    testId={suggScale._id}
                    key={suggScale._id}
                    stage={suggScale.stage}
                    isSpecialTest={true}
                  />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  oneBigBlock: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 0,
  },
  heading: {},
  headingTextStyle: {
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.secondary,
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
    fontSize: 20,
    marginRight: 8,
    paddingTop: 2,
    color: colors.secondary,
  },
  descStyle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  testDetails: {
    paddingTop: 8,
  },
  testBlock: {
    borderWidth: 1,
    borderColor: lightenColor(colors.shadow, 80),
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: lightenColor(colors.background, 80),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: 3,
    color: colors.textPrimary,
  },
  matraResultBlock: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  matraStyle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  seeResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeResultText: {
    fontSize: 14,
    color: colors.highlight,
    fontWeight: 'bold',
  },
  seeResultIcon: {
    fontSize: 17,
    paddingTop: 3,
    color: colors.highlight,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
});

export default ClientProfile;
