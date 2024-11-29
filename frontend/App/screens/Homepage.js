import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Box from '../components/Homepage/Box';
import Text from '../components/Text';
import colors from '../config/colors';
import * as T from '../data/type';
import getMatra from '../helpers/getMatra';
import { storeUserProfile } from '../redux/actions/user';
import BaseUrl from '../config/BaseUrl';
import { useNavigation } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { ApiDefinitions } from '../services/api';
import { ErrorButton, Loader } from '../components';
import { numberWithCommas } from '../utils/number';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const SCREEN_NAME = constants.HOMEPAGE;
const Homepage = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  useBackPress(SCREEN_NAME);

  const [refreshing, setRefreshing] = useState(false);
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { ApiExecutor } = useHelper();

  const {
    msm_score,
    msm_date,
    moj_score,
    moj_date,
    mcn_score,
    mcn_date,
    dn_score,
    dn_date,
    mentalHealthProfile,
  } = useSelector((state) => state.user);

  let isProfileCompleted = true;

  if (
    Array.isArray(mentalHealthProfile) &&
    [...new Set(mentalHealthProfile?.filter(Boolean) ?? [])].length !== 5
  ) {
    isProfileCompleted = false;
  }

  const [lastMsmScore, lastMojScore, lastMcnScore, lastDnScore] = getMatra(
    msm_score,
    moj_score,
    mcn_score,
    dn_score
  );

  const getNotifications = async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.jwtToken}`,
    };
    try {
      const response = await axios.get(`${BaseUrl}/user/notifications/unread/h/`, { headers });
      setNotificationCounter(response.data.nNotifications ?? 0);
    } catch (err) {
      console.log(err.response);
      setNotificationCounter(0);
    }
  };

  const onRefresh = React.useCallback(() => {
    (async () => {
      setRefreshing(true);
      await getNotifications();
      setRefreshing(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await getNotifications();

      const userResponse = await ApiExecutor(ApiDefinitions.userProfile());
      setIsLoading(false);

      if (!userResponse.success) {
        setError(userResponse?.error?.message);
        return;
      }

      dispatch(storeUserProfile(userResponse.data.user));
    })();
  }, []);

  const notificationMessage = `আপনার কাছে ${numberWithCommas(notificationCounter)} টি নতুন নোটিফিকেশন রয়েছে`;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <Loader visible={isLoading} style={{ marginVertical: 20 }} />
      ) : error ? (
        <ErrorButton visible={error} title={error} style={{ marginVertical: 20 }} />
      ) : (
        <View>
          {!isProfileCompleted && (
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.secondary }]}
              onPress={() => navigation.navigate(constants.PROFILE)}
            >
              <Text style={styles.buttonText}>আপনার প্রোফাইল সম্পূর্ণ করুন</Text>
            </TouchableOpacity>
          )}
          {notificationCounter !== 0 && (
            <TouchableOpacity
              style={[
                styles.profileButton,
                { paddingVertical: 15 },
                !isProfileCompleted && { marginTop: 10 },
              ]}
              onPress={() => navigation.navigate('UserNotifications')}
            >
              <Text style={[styles.buttonText, { fontSize: 16 }]}>{notificationMessage}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headingText}>
            আপনি কোন মানসিক রোগে ভুগছেন কিনা সেটা যাচাই করতে নিচে দেয়া যেকোনো টেস্ট করুন।
          </Text>

          <View style={styles.boxContainer}>
            <Box
              source={require('../assests/images/mentalexcercise.jpeg')}
              name="মানসিক স্বাস্থ্য মূল্যায়ন"
              lastScore={msm_date ? lastMsmScore : undefined}
              lastDate={msm_date ? msm_date : undefined}
              onPress={() =>
                navigation.navigate(constants.MENTAL_HEALTH_ASSESSMENT, {
                  type: 'manoshikShasthoMullayon',
                  preTest: true,
                })
              }
            />
            <Box
              source={require('../assests/images/picture_1.png')}
              name="মানসিক অবস্থা যাচাইকরণ (GHQ-12)"
              lastScore={moj_date ? lastMojScore : undefined}
              lastDate={moj_date ? moj_date : undefined}
              onPress={() =>
                navigation.navigate(constants.ASK_FOR_TEST, {
                  scaleId: T.GHQ,
                  label: 'মানসিক অবস্থা যাচাইকরণ',

                  link: T.GHQ,
                  redirectTo: T.RESULT_OUT_OF_100,
                  type: 'manoshikObosthaJachaikoron',
                  preTest: true,
                })
              }
            />
            <Box
              source={require('../assests/images/picture_2.jpg')}
              name="মানসিক চাপ নির্ণয় (PSS-10)"
              lastScore={mcn_date ? lastMcnScore : undefined}
              lastDate={mcn_date ? mcn_date : undefined}
              onPress={() =>
                navigation.navigate(constants.ASK_FOR_TEST, {
                  scaleId: T.PSS,
                  label: 'মানসিক চাপ নির্ণয়',

                  link: T.PSS,
                  redirectTo: T.RESULT_OUT_OF_100,
                  type: 'manoshikChapNirnoy',
                  preTest: true,
                })
              }
            />
            <Box
              source={require('../assests/images/picture_3.png')}
              name="দুশ্চিন্তা নির্ণয় (Anxiety Scale)"
              lastScore={dn_date ? lastDnScore : undefined}
              lastDate={dn_date ? dn_date : undefined}
              onPress={() =>
                navigation.navigate(constants.ASK_FOR_TEST, {
                  scaleId: T.ANXIETY,
                  label: 'দুশ্চিন্তা নির্ণয়',

                  link: T.ANXIETY,
                  redirectTo: T.RESULT_OUT_OF_100,
                  type: 'duschintaNirnoy',
                  preTest: true,
                })
              }
              boxStyle={dn_date || mcn_date || moj_date ? {} : { marginBottom: 15 }}
            />
            {(dn_date || mcn_date || moj_date) && (
              <Box
                source={require('../assests/images/picture_4.png')}
                name="মানসিক স্বাস্থ্যের গুণগত মান উন্নয়ন"
                onPress={() => navigation.navigate(constants.VIDEO_EXERCISE_LIST)}
                boxStyle={{
                  marginBottom: 15,
                }}
              />
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headingText: {
    fontSize: 17.5,
    marginTop: 13,
    marginBottom: 7,
    marginHorizontal: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333333',
  },
  horizontalTab: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  tab: {
    borderColor: colors.primary,
    borderWidth: 2,
    marginRight: 8,
    padding: 3,
    paddingTop: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: '#fff',
    elevation: 1,
    fontSize: 16,
    backgroundColor: colors.primary,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.highlight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingVertical: 4,
  },
});

export default Homepage;
