import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Text from '../components/Text';
import BaseUrl from '../config/BaseUrl';
import colors from '../config/colors';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const seenNotifications = async (info, props, navigation) => {
  const {
    message,
    icon,
    _id: notificationId,
    prof,
    hasSeen,
    associateID: { assessmentId, appointmentId, assessmentDbId },
    type,
    user: { _id: user },
  } = info;
  try {
    if (type === 'SUGGESTED_SCALE') {
      navigation.navigate('ProfSuggestedScale', {
        questionId: assessmentId,
        profId: prof._id,
        notificationId,
      });
    } else {
      await axios.post(`${BaseUrl}/user/notification/seen`, {
        notification_id: notificationId,
      });
      navigation.navigate('AppointmentStatus', {
        appointmentId,
        questionId: assessmentId,
        profId: prof._id,
        notificationId,
      });
    }
  } catch (err) {
    console.log(err.response);
  }
};

const NotificationTab = ({ info, ...props }) => {
  const {
    message,
    icon,
    _id: notificationId,
    prof,
    hasSeen,
    type,
    user: { _id: user },
  } = info;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#eee',
        padding: 8,
        paddingVertical: 10,
        borderColor: '#eee',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 8,
      }}
      onPress={() => seenNotifications(info, props, navigation)}
    >
      {!hasSeen && (
        <Text
          style={{
            fontSize: 12,
            backgroundColor: '#17b978',
            color: 'white',
            textAlign: 'center',
            width: 40,
            paddingVertical: 3,
            borderRadius: 3,
            marginBottom: 2,
          }}
        >
          New
        </Text>
      )}
      <View style={{ flexDirection: 'row', width: '95%' }}>
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={'#333'}
          style={{ alignSelf: 'center', marginRight: 8 }}
        />
        <Text style={{ color: '#333', fontSize: 13.5, lineHeight: 19 }}>
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ButtonComp = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row-reverse', paddingBottom: 10 }}
      onPress={onPress}
    >
      <View
        style={{
          backgroundColor: '#139b64',
          flexDirection: 'row',
          padding: 8,
          paddingRight: 12,
          borderRadius: 4,
          elevation: 1,
        }}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            style={[
              styles.iconStyle,
              { color: colors.white, paddingRight: 3, marginRight: -3 },
            ]}
          />
        )}
        <Text style={[styles.textStyle, { color: colors.white, fontSize: 15 }]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const modifyNotifications = (allNotifs) => {
  return allNotifs.map((a) => {
    let modf = a;
    if (modf.type === 'ADDED_AS_CLIENT') {
      modf.message = `"${modf.prof.name}" আপনাকে ক্লায়েন্ট হিসাবে যুক্ত করেছে।`;
      modf.icon = 'badge-account-horizontal';
    }
    if (modf.type === 'SUGGESTED_SCALE') {
      modf.message = `"${modf.prof.name}" আপনাকে স্কেলটি পূরণের পরামর্শ দিয়াছেন।`;
      modf.icon = 'badge-account-horizontal';
    }
    if (modf.type === 'APPOINTMENT_ACCEPTED') {
      modf.message = `"${modf.prof.name}" আপনার অ্যাপয়েন্টমেন্ট অনুরোধে গ্রহণ করেছেন, বিস্তারিত দেখতে এখানে ক্লিক করুন।`;
      modf.icon = 'badge-account-horizontal';
    }
    return modf;
  });
};

const Notification = ({ navigation, ...props }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [hideSeeMoreButton, setHideSeeMoreButton] = useState(true);
  const [totalNotifs, setTotalNotifs] = useState(0);

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
  } = props;

  const signOutHandler = () => {
    AsyncStorage.removeItem('JWT_AUTH_TOKEN').then(() => {
      navigation.navigate('LoginPro');
    });
  };

  const getNotificationData = async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.jwtToken}`,
    };

    try {
      const response = await axios.get(`${BaseUrl}/user/notifications?page=1`, {
        headers,
      });

      let allNotifs = modifyNotifications(response.data.notifications);
      setNotifications(allNotifs);

      let { numberOfNotifications } = response.data;
      setTotalNotifs(numberOfNotifications);
      if (numberOfNotifications === allNotifs.length) {
        setHideSeeMoreButton(true);
      } else {
        setHideSeeMoreButton(false);
      }

      setPage(1);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err.response.data);
      if (err?.response?.status === 401) {
        signOutHandler();
      }
    }
  };

  const seeMoreHandler = async () => {
    setSeeMoreLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.jwtToken}`,
      };

      const response = await axios.get(
        `${BaseUrl}/user/notifications?page=${page + 1}`,
        { headers }
      );
      let allNotifs = modifyNotifications(response.data.notifications);

      if (allNotifs.length > 0) {
        if (allNotifs.length + notifications.length === totalNotifs) {
          setHideSeeMoreButton(true);
        }
        setPage(page + 1);
        setNotifications((prev) => [...prev, ...allNotifs]);
      } else {
        setHideSeeMoreButton(true);
      }
    } catch (err) {
      console.log(err.response);
    } finally {
      setSeeMoreLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getNotificationData();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    getNotificationData();
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: 'white' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {isLoading ? (
        <View
          style={{
            textAlign: 'center',
            width: '100%',
            paddingTop: 10,
          }}
        >
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : (
        <>
          {notifications.length === 0 ? (
            <View style={{ marginTop: 15 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 25,
                  fontWeight: 'bold',
                }}
              >
                No new notifications
              </Text>
            </View>
          ) : (
            <View style={{ padding: 10 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 25,
                  fontWeight: 'bold',
                  color: '#222',
                  paddingBottom: 10,
                }}
              >
                Notifications
              </Text>

              <View>
                {notifications.map((n, i) => (
                  <NotificationTab info={n} key={i} />
                ))}
              </View>
              {seeMoreLoading && (
                <View
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    paddingTop: 10,
                  }}
                >
                  <ActivityIndicator size='large' color={colors.primary} />
                </View>
              )}
              {!hideSeeMoreButton && (
                <ButtonComp text={'See more'} onPress={seeMoreHandler} />
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  iconStyle: { fontSize: 19, paddingLeft: 2, paddingRight: 2, color: '#444' },
  textStyle: {
    fontSize: 15,
    paddingLeft: 6,
    color: 'gray',
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

export default connect(mapStateToProps, {})(Notification);
