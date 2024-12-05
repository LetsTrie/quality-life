import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { ApiDefinitions } from '../../services/api';
import SeeMoreButton from '../../components/SeeMoreButton';
import { Loader } from '../../components';
import NotificationTab from './components/NotificationTab';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

// SCALE_FILL_UP
// modf.message = `"${modf.user.name}" filled up the suggested scale.`;
// modf.icon = 'clipboard-check-outline';

const SCREEN_NAME = constants.NOTIFICATIONS;

const Notification = () => {
  const isFocused = useIsFocused();

  const { role } = useSelector((state) => state.auth);

  const { ApiExecutor, refreshNotificationCount } = useHelper();
  useBackPress(SCREEN_NAME);

  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [hideSeeMoreButton, setHideSeeMoreButton] = useState(true);
  const [totalNotificationCount, setTotalNotificationCount] = useState(0);

  const getNotifications = async (page = 1) => {
    if (page == 1) {
      setIsLoading(true);
      setTotalNotificationCount(0);
      setNotifications([]);
    } else {
      setSeeMoreLoading(true);
    }

    const response = await ApiExecutor(
      ApiDefinitions.getNotifications({
        role,
        page,
      })
    );

    await refreshNotificationCount();

    if (page === 1) setIsLoading(false);
    else setSeeMoreLoading(false);

    if (!response.success) {
      // TODO: handle error and show it in ERROR_BUTTON
      console.error(response);
      return;
    }

    const { notifications, numberOfNotifications } = response.data;

    if (Array.isArray(notifications) && notifications.length > 0) setCurrentPage(page);
    setNotifications((prev) => [...(prev ?? []), ...notifications]);

    if (page === 1) {
      setTotalNotificationCount(numberOfNotifications);
    }
  };

  useEffect(() => {
    setHideSeeMoreButton(notifications.length >= totalNotificationCount);
  }, [notifications, totalNotificationCount]);

  const onRefresh = React.useCallback(() => {
    (async () => {
      setRefreshing(true);
      await getNotifications();
      setRefreshing(false);
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    (async () => {
      await getNotifications();
    })();
  }, [isFocused]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <Loader visible={isLoading} style={{ marginVertical: 10 }} />
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
              <View>
                {notifications.map((notification, index) => (
                  <NotificationTab key={index} notification={notification} />
                ))}
              </View>

              <Loader visible={seeMoreLoading} style={{ marginVertical: 10 }} />
              <SeeMoreButton
                visible={!hideSeeMoreButton}
                text={'আরো দেখুন'}
                onPress={() => getNotifications(currentPage + 1)}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Notification;
