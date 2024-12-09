import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example for icons
import colors from '../../../config/colors';
import { useNavigation } from '@react-navigation/native';
import { TYPES, typeLabelMap } from '../../../utils/type';
import constants from '../../../navigation/constants';
import { formatDistanceToNow } from 'date-fns';
import { capitalizeFirstLetter } from '../../../utils/string';

const NotificationTab = ({ notification }) => {
  const navigation = useNavigation();

  const username = capitalizeFirstLetter(notification.user?.name);
  const profname = capitalizeFirstLetter(notification.prof?.name);

  if (!username || !profname) return null;

  // console.log('Received notification: ', notification);

  let message = '';
  let screen = '';
  let params = {};
  let icon = 'calendar-check';

  if (notification.type === TYPES.APPOINTMENT_REQUESTED) {
    message = `{${username}} has requested an appointment.`;
    screen = constants.PROF_RESPONSE_CLIENT_REQUEST;
    params = {
      appointmentId: notification.appointment._id,
      goToBack: constants.NOTIFICATIONS,
    };
    icon = 'account-clock';
  } else if (notification.type === TYPES.APPOINTMENT_ACCEPTED) {
    // TODO: When to delete this notification
    const dateTime = notification.appointment.dateByProfessional;
    const date = new Date(dateTime).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const time = new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    message = `{${profname}} has scheduled an appointment on ${date} at ${time}.`;
    screen = constants.APPOINTMENT_STATUS;
    params = {
      appointmentId: notification.appointment._id,
      professionalId: notification.prof._id,
      goToBack: constants.NOTIFICATIONS,
    };
    icon = 'calendar-check';
  } else if (notification.type === TYPES.SUGGEST_A_SCALE) {
    const scaleName = typeLabelMap(notification.assessment.assessmentSlug);
    message = `{${profname}} suggested scale - ${scaleName}.`;
    screen = constants.PROF_SUGGESTED_SCALE;
    params = {
      assessmentId: notification.assessment._id,
      goToBack: constants.NOTIFICATIONS,
    };
    icon = 'clipboard-text';
  } else if (notification.type === TYPES.SCALE_FILLUP_BY_USER) {
    const scaleName = typeLabelMap(notification.assessment.assessmentSlug);
    message = `{${username}} has completed the {${scaleName}} assessment.`;
    screen = constants.CLIENT_TEST_RESULT;
    params = {
      testId: notification.assessment._id,
      isSpecialTest: true,
    };
    icon = 'check-circle';
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

  const onPress = async () => {
    navigation.navigate(screen, params);
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
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
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
