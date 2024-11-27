import React, { useState } from 'react';
import { StyleSheet, ToastAndroid, View } from 'react-native';
import TextInput from '../../components/TextInput';
import { SubmitButton, ErrorButton, Loader } from '../../components';
import colors from '../../config/colors';
import { ApiDefinitions } from '../../services/api';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import constants from '../../navigation/constants';

const SCREEN_NAME = constants.UPDATE_PASSWORD;
const UpdatePassword = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { ApiExecutor } = useHelper();

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মেলেনি।');
      return;
    }

    setError('');

    const payload = { oldPassword, newPassword };

    setLoading(true);
    const response = await ApiExecutor(ApiDefinitions.resetUserPassword({ payload }));
    setLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    ToastAndroid.show('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে', ToastAndroid.SHORT);
    navigation.replace(constants.SETTINGS);
  };

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        icon="lock"
        name="current-password"
        placeholder="বর্তমান পাসওয়ার্ড"
        textContentType="password"
        keyboardType="default"
        onChangeText={(text) => setOldPassword(text)}
        width="100%"
        style={styles.inputFieldStyle}
      />

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        icon="lock"
        name="new-password"
        placeholder="নতুন পাসওয়ার্ড"
        textContentType="password"
        keyboardType="default"
        onChangeText={(text) => setNewPassword(text)}
        width="100%"
        style={styles.inputFieldStyle}
      />

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        icon="lock"
        name="confirm-new-password"
        placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
        textContentType="password"
        keyboardType="default"
        onChangeText={(text) => setConfirmPassword(text)}
        width="100%"
        style={[styles.inputFieldStyle, { marginBottom: 5 }]}
      />

      <Loader visible={loading} style={{ marginTop: 10 }} />
      <ErrorButton visible={error} title={error} style={{ width: '100%' }} />
      <SubmitButton onPress={handleSubmit} title="পরিবর্তন করুন" style={{ width: '100%' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
    paddingHorizontal: 15,
  },
  inputFieldStyle: {
    backgroundColor: colors.white,
    borderColor: colors.neutral,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default UpdatePassword;
