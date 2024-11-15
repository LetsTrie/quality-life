import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import YesNoModal from '../../components/YesNoModal';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { useHelper } from '../../contexts/helper';
import { logoutAction as profLogoutAction } from '../../redux/actions/prof';

const DrawerContent = () => {
  const { _id: userId, isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isProfAuthenticated } = useSelector((state) => state.prof);
  const navigation = useNavigation();
  const { logout } = useHelper();
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);

  const deleteAccount = async () => {
    const variable = { _id: userId };
    await axios.post(`${BaseUrl}/user/delete`, variable).then((res) => {
      if (res.data === 'success') {
        logout();
      }
    });
  };

  const profSignOutHandler = async () => {
    if (isProfAuthenticated) {
      // TODO: Needs to update the logic!
      dispatch(profLogoutAction());
      navigation.navigate('LoginPro');
      return;
    }

    logout();
  };

  return (
    <Screen>
      {isAuthenticated ? (
        <View style={{ flex: 1 }}>
          <DrawerContentScrollView>
            <View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Image
                  style={[styles.logo]}
                  source={require('../../assests/images/drawer_logo.png')}
                />
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'account'} size={size} color={color} />
                )}
                label={({ focused, color }) => <Text style={{ color }}>আমার প্রোফাইল</Text>}
                onPress={() => navigation.navigate('Profile')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons
                    name={'badge-account-horizontal'}
                    size={size}
                    color={color}
                  />
                )}
                label="আমাদের প্রোফেসনালস"
                onPress={() => navigation.navigate('AllProfessionals')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'bell'} size={size} color={color} />
                )}
                label="নোটিফিকেশান"
                onPress={() => navigation.navigate('UserNotifications')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'phone-plus'} size={size} color={color} />
                )}
                label="হেল্প সেন্টার"
                onPress={() => navigation.navigate('CentralHelpCenter')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'calendar-text'} size={size} color={color} />
                )}
                label="ব্যবহারিক নির্দেশিকা"
                onPress={() => navigation.navigate('DrawerGuideline')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />

              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'cog'} size={size} color={color} />
                )}
                label="সেটিংস"
                onPress={() => navigation.navigate('Setting')}
                style={{ paddingHorizontal: 10, marginBottom: 3 }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name={'account'} size={size} color={color} />
                )}
                label="ডিলিট অ্যাকাউন্ট"
                onPress={() => setModalVisible(true)}
                style={{ paddingHorizontal: 10 }}
              />
              <YesNoModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                deleteAccount={deleteAccount}
              />
            </View>
          </DrawerContentScrollView>
          <View style={{ paddingBottom: 2, backgroundColor: colors.danger }}>
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialCommunityIcons name={'exit-to-app'} size={size} color={colors.white} />
              )}
              label="লগ আউট করুন"
              labelStyle={{ color: colors.white }}
              onPress={logout}
              style={{ paddingHorizontal: 10 }}
              pressColor={colors.danger}
            />
          </View>
        </View>
      ) : (
        <View style={styles.logoContainer}>
          <Image
            style={[styles.logo, { height: 200 }]}
            source={require('../../assests/images/new_logo.png')}
          />

          <Button
            title={isProfAuthenticated ? 'লগ আউট করুন' : 'লগ ইন করুন'}
            style={{ borderRadius: 5, marginTop: 15, paddingVertical: 12 }}
            onPress={profSignOutHandler}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginTop: 17,
    width: 105,
    height: 120,
  },
});

export default DrawerContent;
