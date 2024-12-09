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
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import { numOfNewNotificationsAction, storeProfessionalsProfile } from '../../redux/actions/prof';
import { useDispatch, useSelector } from 'react-redux';
import ProfileActModal from './ProfileActModal';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { ApiDefinitions } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../config/colors';
import { useNavigation } from '@react-navigation/native';
import { setUnreadNotificationCount } from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';
import { ErrorButton } from '../../components';

const SCREEN_NAME = constants.PROF_HOMEPAGE;

const CardItem = ({ icon, title, subtitle, color, onPress, badge }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.card,
      {
        borderWidth: 0.5,
        borderLeftWidth: 4,
        borderLeftColor: color,
        borderColor: color,
        transform: [{ translateX: 0 }],
        marginRight: 5,
        backgroundColor: colors.white,
      },
    ]}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardIcon}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
    </View>
  </TouchableOpacity>
);

const Homepage = () => {
  const isFocused = useIsFocused();

  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { ApiExecutor } = useHelper();

  const unreadNotificationCount = useSelector((state) => state.notifications.unreadCount);
  const { numOfNewClientRequests } = useSelector((state) => state.prof);
  const { _id, visibility } = useSelector((state) => state.prof?.prof || {});

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisibleAct, setModalVisibleAct] = useState(false);
  const [activeText, setActiveText] = useState(visibility);
  const [error, setError] = useState(null);

  async function getHomepageData() {
    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.getProfessionalHomepageNotificationCount());
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    const { notificationCount, appointmentCount } = response.data;

    dispatch(numOfNewNotificationsAction(parseFloat(appointmentCount)));
    dispatch(setUnreadNotificationCount(parseFloat(notificationCount)));
  }

  const anyNewNotifications = !(!unreadNotificationCount || unreadNotificationCount <= 0);

  const onRefresh = React.useCallback(() => {
    (async () => {
      setRefreshing(true);
      await getHomepageData();
      setRefreshing(false);
    })();
  }, []);

  const activation = async () => {
    const variable = { _id: _id, visibility: activeText };
    await axios.post(`${BaseUrl}/prof/activation`, variable).then((res) => {
      if (res.data === 'success') {
        setActiveText(!activeText);
        setModalVisibleAct(!modalVisibleAct);
      }
    });
  };

  useEffect(() => {
    if (!isFocused) return;

    setError(null);

    (async () => {
      await getHomepageData();

      setIsLoading(true);
      const response = await ApiExecutor(ApiDefinitions.getProfessionalsProfile());
      if (response.success) {
        const { prof } = response.data;
        dispatch(storeProfessionalsProfile(prof));
      }
      setIsLoading(false);
    })();
  }, [isFocused]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          {error && <ErrorButton title={error} visible={!!error} />}

          {anyNewNotifications && (
            <CardItem
              icon="notifications-active"
              title="New Notifications"
              subtitle={`You have ${unreadNotificationCount} new notifications`}
              color={colors.highlight}
              onPress={() => navigation.navigate(constants.NOTIFICATIONS)}
            />
          )}

          <CardItem
            icon="people"
            title="Client Requests"
            badge={numOfNewClientRequests > 0 ? numOfNewClientRequests : null}
            color={colors.focus}
            onPress={() => navigation.navigate(constants.PROF_CLIENT_REQUEST)}
          />

          <CardItem
            icon="assessment"
            title="Assessment Tools"
            color={colors.secondary}
            onPress={() => navigation.navigate(constants.PROF_ASSESSMENT_TOOLS)}
          />

          <CardItem
            icon="group"
            title="My Clients"
            color={colors.primary}
            onPress={() =>
              navigation.navigate(constants.PROFESSIONALS_CLIENT, { goToBack: SCREEN_NAME })
            }
          />
          {/* 
          {!anyNewNotifications && (
            <CardItem
              icon="notifications"
              title="Notifications"
              color={colors.highlight}
              onPress={() => navigation.navigate(constants.NOTIFICATIONS)}
            />
          )} */}
          {/* 
          <>
            <CardItem
              icon="visibility"
              title="Account Visibility"
              subtitle={!activeText ? 'Activate Account' : 'Deactivate Account'}
              color={colors.secondary}
              onPress={() => setModalVisibleAct(true)}
            />

            <ProfileActModal
              modalVisibleAct={modalVisibleAct}
              setModalVisibleAct={setModalVisibleAct}
              activation={activation}
            />
          </> */}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  card: {
    marginVertical: 8,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.background}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.light,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  signOutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
  },
});

export default Homepage;
