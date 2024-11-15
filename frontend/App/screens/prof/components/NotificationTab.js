import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import Text from '../../../components/Text';
import { logoutAction } from '../../../redux/actions/prof';
import {
  addMoreNotificationAction,
  addNotificationAction,
  removeNotificationAction,
  seenNotificationAction,
} from '../../../redux/actions/prof_noti';
import BaseUrl from '../../../config/BaseUrl';
import axios from 'axios';

const NotificationTab = ({ notificationId, goToBack, ...props }) => {
  const {
    jwtToken,
    notifications,
    seenNotificationAction,
    logoutAction,
    setIsLoading,
  } = props;
  const info = notifications.find((n) => n._id === notificationId);
  const navigation = useNavigation();

  const seenNotifications = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      };
      if (info.type === 'APPOINTMENT_REQUESTED') {
        const response = await axios.post(
          `${BaseUrl}/prof/notifications/seen`,
          { notificationId: info._id, user: info.user._id },
          { headers }
        );
        const { requestInformation } = response.data;
        seenNotificationAction(info);
        navigation.navigate('ResponseClientRequest', {
          appointmentInfo: requestInformation,
          goToBack,
        });
      } else if (info.type === 'SCALE_FILL_UP') {
        setIsLoading(true);
        const response = await axios.post(
          `${BaseUrl}/prof/result-suggested-scale`,
          {
            notificationId: info._id,
            assessmentDbId: info.associateID.assessmentResultId,
          },
          { headers }
        );
        const { assessment } = response.data;
        console.log({ assessment });
        seenNotificationAction(info);
        navigation.navigate('ProfSideScaleResult', {
          assessmentResult: assessment,
          goToBack,
        });
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.status === 401) {
        logoutAction();
        navigation.navigate('LoginPro');
      }
    }
  };

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
      onPress={seenNotifications}
    >
      {!info.hasSeen && (
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
          name={info.icon}
          size={14}
          color={'#333'}
          style={{ alignSelf: 'center', marginRight: 8 }}
        />
        <Text style={{ color: '#333', fontSize: 13.5, lineHeight: 19 }}>
          {info.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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

export default connect(mapStateToProps, mapActionToProps)(NotificationTab);
