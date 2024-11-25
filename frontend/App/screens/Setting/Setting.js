import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Text from '../../components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHelper } from '../../contexts/helper';
import { useNavigation } from '@react-navigation/native';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';

const SCREEN_NAME = constants.SETTINGS;
const Setting = () => {
  useBackPress(SCREEN_NAME);
  const navigation = useNavigation();
  const { logout } = useHelper();

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AboutUs')}>
          <MaterialCommunityIcons
            name="information-outline"
            style={styles.iconStyle}
            size={24}
            color="#4A90E2"
          />
          <Text style={styles.textStyle}> আমাদের সম্পর্কিত তথ্য </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <MaterialCommunityIcons
            name="shield-account-outline"
            style={styles.iconStyle}
            size={24}
            color="#4A90E2"
          />
          <Text style={styles.textStyle}> গোপনীয়তা নীতি </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={logout}>
          <MaterialCommunityIcons
            name="exit-to-app"
            style={styles.iconStyle}
            size={24}
            color="#E94E77"
          />
          <Text style={styles.textStyle}> সাইন আউট </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
  },
  cardContainer: {
    marginHorizontal: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconStyle: {
    marginRight: 15,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333333',
    flex: 1,
  },
});

export default Setting;
