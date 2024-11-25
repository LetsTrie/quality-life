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
import { numOfNewNotificationsAction } from '../../redux/actions/prof';
import { connect } from 'react-redux';
import YesNoModal from '../../components/YesNoModal';
import ProfileActModal from './ProfileActModal';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { AppButton } from '../../components';
import { ApiDefinitions } from '../../services/api';
import { numberWithCommas } from '../../utils/number';
import { MaterialIcons } from '@expo/vector-icons';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const SCREEN_NAME = constants.PROF_HOMEPAGE;

const colors = {
  primary: '#2C3E50',
  secondary: '#34495E',
  accent: '#3498DB',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  text: {
    primary: '#2C3E50',
    secondary: '#5D6D7E',
    light: '#8395A7',
  },
};

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
      },
    ]}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardIcon}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
        )}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={24} color={colors.text.light} />
    </View>
  </TouchableOpacity>
);

const Homepage = ({ navigation, route, ...props }) => {
  useBackPress(SCREEN_NAME);

  const { ApiExecutor, logout } = useHelper();

  const {
    _id,
    visibility,
    numOfNewNotifications,
    numOfNewClientRequests,
    numOfNewNotificationsAction,
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleAct, setModalVisibleAct] = useState(false);
  const [activeText, setActiveText] = useState(visibility);
  const [error, setError] = useState(null);

  const logoutHandler = logout;

  async function getHomepageData() {
    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.getProfessionalHomepageNotificationCount());
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    console.log(response);

    const { notificationCount, appointmentCount } = response.data;
    numOfNewNotificationsAction(parseFloat(notificationCount), parseFloat(appointmentCount));
  }

  const anyNewNotifications = !(!numOfNewNotifications || numOfNewNotifications <= 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getHomepageData();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const deleteAccount = async () => {
    setIsLoading(true);
    setError(null);

    const response = await ApiExecutor(ApiDefinitions.deleteProfessionalAccount({ profId: _id }));
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    logoutHandler();
  };

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
    getHomepageData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <View style={styles.content}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {anyNewNotifications && (
            <CardItem
              icon="notifications-active"
              title="New Notifications"
              subtitle={`You have ${numberWithCommas(numOfNewNotifications)} new notifications`}
              color={colors.warning}
              onPress={() => navigation.navigate('ProNotification', { goToBack: SCREEN_NAME })}
            />
          )}

          <CardItem
            icon="people"
            title="Client Requests"
            badge={numOfNewClientRequests > 0 ? numOfNewClientRequests.toString() : null}
            color={colors.accent}
            onPress={() => navigation.navigate(constants.PROF_CLIENT_REQUEST)}
          />

          <CardItem
            icon="assessment"
            title="Assessment Tools"
            color={colors.secondary}
            onPress={() => navigation.navigate('ProAssessments', { goToBack: SCREEN_NAME })}
          />

          <CardItem
            icon="person"
            title="My Profile"
            color={colors.success}
            onPress={() => navigation.navigate(constants.PROF_PROFILE)}
          />

          <CardItem
            icon="group"
            title="My Clients"
            color={colors.primary}
            onPress={() => navigation.navigate('ProMyClients', { goToBack: SCREEN_NAME })}
          />

          {!anyNewNotifications && (
            <CardItem
              icon="notifications"
              title="Notifications"
              color={colors.text.light}
              onPress={() => navigation.navigate('ProNotification', { goToBack: SCREEN_NAME })}
            />
          )}

          <CardItem
            icon="visibility"
            title="Account Visibility"
            subtitle={!activeText ? 'Activate Account' : 'Deactivate Account'}
            color={colors.secondary}
            onPress={() => setModalVisibleAct(true)}
          />

          <CardItem
            icon="delete"
            title="Delete Account"
            color={colors.danger}
            onPress={() => setModalVisible(true)}
          />

          <View style={styles.buttonContainer}>
            <AppButton title="Sign Out" onPress={logoutHandler} style={styles.signOutButton} />
          </View>

          <YesNoModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            deleteAccount={deleteAccount}
          />

          <ProfileActModal
            modalVisibleAct={modalVisibleAct}
            setModalVisibleAct={setModalVisibleAct}
            activation={activation}
          />
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
    backgroundColor: colors.cardBackground,
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
    fontWeight: '600',
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
    color: colors.cardBackground,
    fontSize: 12,
    fontWeight: '600',
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
const mapStateToProps = (state) => ({
  _id: state.prof?.prof?._id,
  numOfNewNotifications: state.prof.numOfNewNotifications,
  numOfNewClientRequests: state.prof.numOfNewClientRequests,
  visibility: state.prof?.prof?.visibility,
});

export default connect(mapStateToProps, { numOfNewNotificationsAction })(Homepage);
