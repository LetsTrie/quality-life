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
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { connect } from 'react-redux';
import { logoutAction } from '../../redux/actions/prof';
import {
  addMoreNotificationAction,
  addNotificationAction,
  removeNotificationAction,
  seenNotificationAction,
} from '../../redux/actions/prof_noti';
import NotificationTab from './components/NotificationTab';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
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

const modfNoti = (allNotifs) => {
  return allNotifs.map((a) => {
    let modf = a;
    if (modf.type === 'APPOINTMENT_REQUESTED') {
      modf.message = `"${modf.user.name}" requested for an appointment.`;
      modf.icon = 'badge-account-horizontal';
    } else if (modf.type === 'SCALE_FILL_UP') {
      modf.message = `"${modf.user.name}" filled up the suggested scale.`;
      modf.icon = 'clipboard-check-outline';
    }
    return modf;
  });
};

const routeName = 'ProNotification';

const Notification = ({ navigation, route, ...props }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { goToBack } = route.params;

  const [page, setPage] = useState(1);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [hideSeeMoreButton, setHideSeeMoreButton] = useState(true);
  const [totalNotifs, setTotalNotifs] = useState(0);

  const {
    jwtToken,
    isAuthenticated,
    logoutAction,
    notifications,
    addNotificationAction,
    addMoreNotificationAction,
    seenNotificationAction,
    removeNotificationAction,
  } = props;

  const signOutHandler = () => {
    logoutAction();
    navigation.navigate('LoginPro');
  };
  const getNotificationData = async () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginPro');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    };

    try {
      const response = await axios.get(
        `${BaseUrl}/prof/notifications/unread?page=1`,
        { headers }
      );
      // Store notifications in redux
      const allNotifs = modfNoti(response.data.notifications);
      addNotificationAction(allNotifs);
      setPage(1);

      // Pagination ----------------------------------
      let { numberOfNotifications } = response.data;
      setTotalNotifs(numberOfNotifications);
      if (numberOfNotifications === allNotifs.length) {
        setHideSeeMoreButton(true);
      } else {
        setHideSeeMoreButton(false);
      }
      // End -----------------------------------------
    } catch (err) {
      console.log(err.response);
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setIsLoading(false);
    }
  };
  const seeMoreHandler = async () => {
    if (!isAuthenticated) {
      navigation.navigate('LoginPro');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    };

    setSeeMoreLoading(true);
    try {
      const response = await axios.get(
        `${BaseUrl}/prof/notifications/unread?page=${page + 1}`,
        { headers }
      );

      let allNotifs = modfNoti(response.data.notifications);

      // All data fetched
      if (allNotifs.length === 0) {
        setHideSeeMoreButton(true);
        return;
      }

      // All data fetched
      if (allNotifs.length + notifications.length === totalNotifs) {
        setHideSeeMoreButton(true);
      }

      // Add new data to redux
      setPage(page + 1);
      addMoreNotificationAction(allNotifs);
    } catch (err) {
      console.log(err.response);
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setSeeMoreLoading(false);
    }
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getNotificationData();
    wait(2000).then(() => setRefreshing(false));
  }, []);
  function handleBackButtonClick() {
    navigation.navigate(goToBack);
    return true;
  }
  useEffect(() => {
    getNotificationData();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick
      );
    };
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
                  <NotificationTab
                    notificationId={n._id}
                    key={i}
                    goToBack={routeName}
                    setIsLoading={setIsLoading}
                  />
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
  jwtToken: state.prof.jwtToken,
  isAuthenticated: state.prof.isAuthenticated,
  notifications: state.profNotifications.notifications,
});

const mapActionToProps = {
  logoutAction,
  addNotificationAction,
  addMoreNotificationAction,
  seenNotificationAction,
  removeNotificationAction,
};

export default connect(mapStateToProps, mapActionToProps)(Notification);
