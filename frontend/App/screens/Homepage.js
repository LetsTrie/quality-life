import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import Box from '../components/Homepage/Box';
import Text from '../components/Text';
import colors from '../config/colors';
import * as T from '../data/type';
import getMatra from '../helpers/getMatra';
import { logoutAction } from '../redux/actions/auth';
import { storeUserProfile } from '../redux/actions/user';
import BaseUrl from '../config/BaseUrl';
import { useNavigation } from '@react-navigation/native';
import { useHelper } from '../hooks';
import constants from '../navigation/constants';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const Homepage = (props) => {
  const navigation = useNavigation();
  const { logout } = useHelper();

  const [refreshing, setRefreshing] = useState(false);
  const [notificationCounter, setNotificationCounter] = useState(0);

  const {
    msm_score,
    msm_date,
    moj_score,
    moj_date,
    mcn_score,
    mcn_date,
    dn_score,
    dn_date,
    isAuthenticated,
    mentalHealthProfile,
    name,
    age,
    gender,
    isMarried,
    address,
    jwtToken,
  } = props;

  let isProfileCompleted = true;
  if (!name || !age || !gender || !isMarried || !address) {
    isProfileCompleted = false;
  }
  if (
    Array.isArray(mentalHealthProfile) &&
    [...new Set(mentalHealthProfile.filter(Boolean))].length !== 5
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
      setNotificationCounter(response.data.nNotifications);
    } catch (err) {
      console.log(err.response);
      setNotificationCounter(0);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getNotifications();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !jwtToken) {
      logout();
      return;
    }

    getNotifications();
  }, []);

  let notificationMessage;
  if (notificationCounter === 1) {
    notificationMessage = `You have ${notificationCounter} new notification!!`;
  } else if (notificationCounter > 1) {
    notificationMessage = `You have ${notificationCounter} new notifications!!`;
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View>
        {!isProfileCompleted && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderColor: colors.secondary,
              borderWidth: 3,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              justifyContent: 'center',
              elevation: 1,
              backgroundColor: colors.secondary,
            }}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons
              name="account-cog"
              size={33.5}
              style={{ alignSelf: 'center', marginLeft: 8, marginRight: 9 }}
              color={'#fff'}
            />
            <Text
              style={{
                fontSize: 23,
                alignSelf: 'center',
                color: colors.white,
                fontWeight: 'bold',
              }}
            >
              Complete your profile
            </Text>
          </TouchableOpacity>
        )}
        {notificationCounter !== 0 && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderColor: colors.secondary,
              borderWidth: 3,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              justifyContent: 'center',
              elevation: 1,
              backgroundColor: colors.secondary,
            }}
            onPress={() => navigation.navigate('UserNotifications')}
          >
            <Text
              style={[
                styles.boxText,
                {
                  color: 'white',
                  textAlign: 'center',
                  fontSize: 19.5,
                  paddingVertical: 5,
                  fontWeight: 'bold',
                },
              ]}
            >
              {notificationMessage}
            </Text>
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
              navigation.navigate('HomepageScale', {
                ToHomepage: false,
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
});

const mapStateToProps = (state) => ({
  jwtToken: state.auth.jwtToken,
  isAuthenticated: state.auth.isAuthenticated,
  msm_score: state.user.msm_score,
  msm_date: state.user.msm_date,
  moj_score: state.user.moj_score,
  moj_date: state.user.moj_date,
  mcn_score: state.user.mcn_score,
  mcn_date: state.user.mcn_date,
  dn_score: state.user.dn_score,
  dn_date: state.user.dn_date,
  name: state.user.name,
  age: state.user.age,
  gender: state.user.gender,
  isMarried: state.user.isMarried,
  address: state.user.address,
  mentalHealthProfile: state.user.mentalHealthProfile,
});

export default connect(mapStateToProps, { storeUserProfile, logoutAction })(Homepage);
