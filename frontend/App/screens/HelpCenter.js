import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Text from '../components/Text';
import helpCenterNumbers from '../data/helpCenter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';
import colors from '../config/colors';

const SCREEN_NAME = constants.HELP_CENTER;

const HelpCenter = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { scaleId, goToBack } = route.params;
  useBackPress(SCREEN_NAME, goToBack);

  const filteredNumbers = helpCenterNumbers.filter((item) => item.keywords.includes(scaleId));

  const dialCall = async (number, type) => {
    try {
      if (type === 'whatsapp') {
        const formattedNumber = number.startsWith('01') ? `+88${number}` : number;
        await Linking.openURL(`whatsapp://send?text=Hello&phone=${formattedNumber}`);
      } else {
        const scheme = Platform.OS === 'android' ? 'tel:' : 'telprompt:';
        await Linking.openURL(`${scheme}${number}`);
      }
    } catch (error) {
      console.error('Error dialing call:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        title="প্রফেশনালের সাথে যোগাযোগ করুন"
        style={styles.contactButton}
        textStyle={styles.contactButtonText}
        onPress={() => navigation.replace(constants.PROFESSIONALS_LIST)}
      />
      {filteredNumbers.map((item, index) => (
        <View
          key={item.place}
          style={[
            styles.helpCenterBox,
            index === filteredNumbers.length - 1 && styles.lastItemMargin,
          ]}
        >
          <Text style={styles.place}>{item.place}</Text>
          {item.location && <Text style={styles.location}>{item.location}</Text>}
          <View style={styles.numbersContainer}>
            {item.contacts.map((contact) => (
              <TouchableOpacity
                key={contact.number}
                style={styles.numbers}
                onPress={() => dialCall(contact.number, contact.type)}
                accessible
                accessibilityRole="button"
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={contact.type} size={25} color={colors.primary} />
                </View>
                <View style={styles.numbersInfo}>
                  <Text style={styles.number}>{contact.number}</Text>
                  {contact.time && <Text style={styles.time}>{contact.time}</Text>}
                  {contact.hasToll && <Text style={styles.toll}>টোল ফ্রি</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  contactButton: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    elevation: 3,
  },
  contactButtonText: {
    fontSize: 18,
    color: colors.white,
  },
  helpCenterBox: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  lastItemMargin: {
    marginBottom: 25,
  },
  place: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 10,
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  numbersContainer: {
    paddingTop: 10,
  },
  numbers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.light,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  numbersInfo: {
    paddingLeft: 12,
    flex: 1,
  },
  number: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toll: {
    fontSize: 14,
    color: colors.success,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default HelpCenter;
