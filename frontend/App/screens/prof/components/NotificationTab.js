import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example for icons
import colors from '../../../config/colors';
import { useNavigation } from '@react-navigation/native';
import { TYPES } from '../../../utils/type';
import constants from '../../../navigation/constants';
import { formatDistanceToNow } from 'date-fns';
import { capitalizeFirstLetter } from '../../../utils/string';

const NotificationTab = ({ notification }) => {
  console.log(notification.prof);
  const navigation = useNavigation();

  const username = notification.user?.name;
  if (!username) return null;

  let message = '';
  let screen = '';
  let params = {};

  if (notification.type === TYPES.APPOINTMENT_REQUESTED) {
    message = `{${username}} requested for an appointment.`;
    screen = constants.PROF_RESPONSE_CLIENT_REQUEST;
    params = {
      appointmentId: notification.appointmentId,
      goToBack: constants.PROFESSIONALS_NOTIFICATIONS,
    };
  } else {
    return null;
  }

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const renderMessage = () => {
    const parts = message.split(/(\{.*?\})/); // Split by text inside {}
    return parts.map((part, index) =>
      part.startsWith('{') && part.endsWith('}') ? (
        <Text key={index} style={[styles.messageText, styles.boldText]}>
          {capitalizeFirstLetter(part.slice(1, -1))}
        </Text>
      ) : (
        <Text key={index} style={[styles.messageText]}>
          {part}
        </Text>
      )
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        !notification.hasSeen && {
          backgroundColor: colors.highlight,
          borderColor: colors.highlight,
        },
      ]}
      onPress={() => navigation.replace(screen, params)}
    >
      <View style={styles.iconContainer}>
        <Icon
          name="calendar-check"
          style={[
            styles.iconStyle,
            !notification.hasSeen && {
              color: colors.textPrimary,
            },
          ]}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.messageText}>{renderMessage()}</Text>
        <Text style={styles.timestamp}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  iconStyle: {
    fontSize: 24,
    color: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default NotificationTab;
