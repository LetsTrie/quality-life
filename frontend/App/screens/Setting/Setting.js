import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Text from '../../components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHelper } from '../../contexts/helper';
import { useNavigation } from '@react-navigation/native';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';
import colors from '../../config/colors';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import { ApiDefinitions } from '../../services/api';
import { useSelector } from 'react-redux';
import { isProfessional, isUser } from '../../utils/roles';

const SCREEN_NAME = constants.SETTINGS;
const Setting = () => {
  useBackPress(SCREEN_NAME);

  const { ApiExecutor, logout } = useHelper();
  const navigation = useNavigation();

  const { role } = useSelector((state) => state.auth);
  const [modalVisible, setModalVisible] = useState(false);

  const onDelete = async () => {
    if (isUser(role)) {
      await ApiExecutor(ApiDefinitions.deleteUserAccount());
    } else if (isProfessional(role)) {
      await ApiExecutor(ApiDefinitions.deleteProfessionalAccount());
    }

    setModalVisible(false);
    logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AboutUs')}>
          <MaterialCommunityIcons
            name="account-outline"
            style={styles.iconStyle}
            size={24}
            color="#4A90E2"
          />
          <Text style={styles.textStyle}>আমাদের সম্পর্কিত তথ্য</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            style={styles.iconStyle}
            size={24}
            color="#4A90E2"
          />
          <Text style={styles.textStyle}>গোপনীয়তা নীতি</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate(constants.UPDATE_PASSWORD)}
        >
          <MaterialCommunityIcons
            name="lock-reset"
            style={styles.iconStyle}
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.textStyle}>পাসওয়ার্ড পরিবর্তন করুন</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            style={styles.iconStyle}
            size={24}
            color="#E53935"
          />
          <Text style={styles.textStyle}>অ্যাকাউন্ট ডিলিট করুন</Text>
        </TouchableOpacity>
      </View>

      <DeleteAccountModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onDelete={onDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
