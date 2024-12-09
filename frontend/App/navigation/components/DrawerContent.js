import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import colors from '../../config/colors';
import { useHelper } from '../../contexts/helper';
import { isProfessional, isUser } from '../../utils/roles';
import constants from '../constants';

const DrawerContent = () => {
  const { role } = useSelector((state) => state.auth);

  const isAuthenticated = !!role;
  const isUserRole = isUser(role);
  const isProfessionalRole = isProfessional(role);

  const navigation = useNavigation();
  const { logout } = useHelper();

  const onProfileClick = () => {
    if (isUserRole) navigation.navigate(constants.PROFILE);
    if (isProfessionalRole) navigation.navigate(constants.PROF_PROFILE);
  };

  const onNotificationClick = () => {
    navigation.navigate(constants.NOTIFICATIONS);
  };

  return (
    <Screen>
      {isAuthenticated && (
        <View style={{ flex: 1 }}>
          <>
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
                    <MaterialCommunityIcons name={'home'} size={size} color={colors.primary} />
                  )}
                  label={({ color }) => <Text style={{ color }}>হোমপেইজ</Text>}
                  onPress={() =>
                    navigation.navigate(isUserRole ? constants.HOMEPAGE : constants.PROF_HOMEPAGE)
                  }
                  style={{ paddingHorizontal: 5, marginBottom: 3 }}
                />

                {isUserRole && (
                  <DrawerItem
                    icon={({ color, size }) => (
                      <MaterialCommunityIcons name={'account'} size={size} color={colors.success} />
                    )}
                    label={({ color }) => <Text style={{ color }}>আমার প্রোফাইল</Text>}
                    onPress={onProfileClick}
                    style={{ paddingHorizontal: 5, marginBottom: 3 }}
                  />
                )}

                {isUserRole && (
                  <DrawerItem
                    icon={({ color, size }) => (
                      <MaterialCommunityIcons
                        name={'badge-account-horizontal'}
                        size={size}
                        color={colors.info}
                      />
                    )}
                    label="আমাদের প্রোফেসনালস"
                    onPress={() => navigation.navigate('AllProfessionals')}
                    style={{
                      paddingHorizontal: 5,
                      marginBottom: 3,
                    }}
                  />
                )}

                <DrawerItem
                  icon={({ color, size }) => (
                    <MaterialCommunityIcons name={'bell'} size={size} color={colors.highlight} />
                  )}
                  label="নোটিফিকেশন"
                  onPress={onNotificationClick}
                  style={{ paddingHorizontal: 5, marginBottom: 3 }}
                />

                <DrawerItem
                  icon={({ color, size }) => (
                    <MaterialCommunityIcons
                      name={'phone-plus'}
                      size={size}
                      color={colors.textSecondary}
                    />
                  )}
                  label="হেল্প সেন্টার"
                  onPress={() => navigation.navigate('CentralHelpCenter')}
                  style={{ paddingHorizontal: 5, marginBottom: 3 }}
                />

                <DrawerItem
                  icon={({ color, size }) => (
                    <MaterialCommunityIcons
                      name={'calendar-text'}
                      size={size}
                      color={colors.focus}
                    />
                  )}
                  label="ব্যবহারিক নির্দেশিকা"
                  onPress={() => navigation.navigate('DrawerGuideline')}
                  style={{ paddingHorizontal: 5, marginBottom: 3 }}
                />

                {isUserRole && (
                  <DrawerItem
                    icon={({ color, size }) => (
                      <MaterialCommunityIcons name={'cog'} size={size} color={colors.accent} />
                    )}
                    label="সেটিংস"
                    onPress={() => navigation.navigate(constants.SETTINGS)}
                    style={{ paddingHorizontal: 5, marginBottom: 3 }}
                  />
                )}
              </View>
            </DrawerContentScrollView>
            <View style={{ paddingBottom: 2, backgroundColor: colors.danger }}>
              <DrawerItem
                icon={({ size }) => (
                  <MaterialCommunityIcons name={'exit-to-app'} size={size} color={colors.white} />
                )}
                label="লগ আউট করুন"
                labelStyle={{ color: colors.white }}
                onPress={logout}
                style={{ paddingHorizontal: 5 }}
                pressColor={colors.danger}
              />
            </View>
          </>
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
