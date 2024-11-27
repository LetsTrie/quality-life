import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../components/Text';
import helpCenterNumbers from '../data/helpCenter';
import colors from '../config/colors';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

const dialCall = async (number, type) => {
  if (type === 'whatsapp') {
    if (number.startsWith('01')) number = '+88' + number;
    await Linking.openURL(`whatsapp://send?text=Hello&phone=${number}`);
  } else {
    if (Platform.OS === 'android') await Linking.openURL(`tel:${number}`);
    else await Linking.openURL(`telprompt:${number}`);
  }
};

const SCREEN_NAME = constants.CENTRAL_HELP_CENTER;
const CentralHelpCenter = () => {
  useBackPress(SCREEN_NAME);

  const lists = helpCenterNumbers;

  return (
    <>
      <ScrollView style={{ flex: 1, paddingTop: 10, backgroundColor: colors.background }}>
        {lists.map((l, index) => (
          <View
            key={l.place}
            style={[styles.helpCenterBox, index === lists.length - 1 ? { marginBottom: 25 } : {}]}
          >
            <Text style={styles.place}>{l.place}</Text>
            {l.location && <Text style={styles.location}>{l.location}</Text>}
            <View style={styles.numbersContainer}>
              {l.contacts.map((c) => (
                <TouchableOpacity
                  style={styles.numbers}
                  key={c.number}
                  onPress={() => dialCall(c.number, c.type)}
                >
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={c.type} size={25} style={styles.iconStyle} />
                  </View>
                  <View style={styles.numbersInfo}>
                    <Text style={styles.number}>{c.number}</Text>
                    {c.time && <Text style={styles.time}>{c.time}</Text>}
                    {c.hasToll && <Text style={styles.toll}>টোল ফ্রি</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  helpCenterBox: {
    padding: 20,
    paddingBottom: 15,
    paddingTop: 25,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 14,
    backgroundColor: colors.white,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  place: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  location: {
    fontSize: 15,
    paddingBottom: 7,
    color: colors.textSecondary,
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
    alignSelf: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingBottom: 15,
  },
  iconStyle: {
    fontSize: 25,
  },
  numbersInfo: {
    paddingLeft: 10,
    alignSelf: 'center',
  },
  number: {
    fontSize: 15,
    color: colors.textPrimary,
    paddingBottom: 4,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingBottom: 3,
  },
  toll: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingBottom: 3,
  },
});

export default CentralHelpCenter;
