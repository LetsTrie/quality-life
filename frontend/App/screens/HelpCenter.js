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
                  <MaterialCommunityIcons name={contact.type} size={25} style={styles.iconStyle} />
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
    backgroundColor: '#eee',
  },
  contactButton: {
    marginTop: 7,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  contactButtonText: {
    fontSize: 18,
  },
  helpCenterBox: {
    padding: 20,
    borderRadius: 5,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 14,
    backgroundColor: 'white',
  },
  lastItemMargin: {
    marginBottom: 25,
  },
  place: {
    color: '#333',
    fontSize: 19,
    paddingBottom: 10,
  },
  location: {
    fontSize: 17,
    paddingBottom: 7,
    color: '#666',
  },
  numbersContainer: {
    paddingTop: 10,
  },
  numbers: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  iconContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    fontSize: 30,
  },
  numbersInfo: {
    paddingLeft: 10,
    alignSelf: 'center',
  },
  number: {
    fontSize: 15.5,
    color: '#333',
    paddingBottom: 4,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 14,
    color: '#666',
    paddingBottom: 3,
  },
  toll: {
    fontSize: 14,
    color: '#666',
    paddingBottom: 3,
  },
});

export default HelpCenter;
