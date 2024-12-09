import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../../components/Auth/AuthIcon';
import Container from '../../../components/Auth/Container';
import EndOptions from '../../../components/Auth/EndOptions';
import TopHeading from '../../../components/Auth/TopHeading';
import useFormFields from '../../../components/HandleForm';
import TextInput from '../../../components/TextInput';
import { useBackPress, useHelper } from '../../../hooks';
import constants from '../../../navigation/constants';
import { storeUserProfile } from '../../../redux/actions/user';
import { ApiDefinitions } from '../../../services/api';
import styles from './UserLogin.style';
import { setAuthToken } from '../../../redux/utils';
import { RoleEnum } from '../../../utils/roles';
import { AppText, ErrorButton, Loader } from '../../../components';
import { SubmitButton } from '../../../components/SubmitButton';
import colors from '../../../config/colors';
import { lightenColor } from '../../../utils/ui';

const SCREEN_SIZE = constants.LOGIN;

export const UserLogin = () => {
  useBackPress(SCREEN_SIZE);

  const { ApiExecutor } = useHelper();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { accessToken } = useSelector((state) => state.auth);

  const initialState = { email: '', password: '' };
  const { formFields, createChangeHandler } = useFormFields(initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLoginDone, setUserLoginDone] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);

  const submitLoginForm = async () => {
    const payload = { ...formFields };

    if (!payload.email || payload.email === '' || !payload.password || payload.password === '') {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    } else if (!validator.isEmail(payload.email)) {
      setError('ইমেলটি বৈধ নয়');
      return;
    }

    setIsLoading(true);
    setError(null);

    payload.email = payload.email.toString().trim().toLowerCase();
    payload.password = payload.password.toString().trim();

    const lResponse = await ApiExecutor(ApiDefinitions.userLogin({ payload }));

    if (!lResponse.success) {
      setError(lResponse?.error?.message);
      return;
    }

    dispatch(setAuthToken(RoleEnum.USER, lResponse.data.accessToken, lResponse.data.refreshToken));
    setTimeout(() => {
      setUserLoginDone(true);
      setLoginResponse(lResponse.data);
    }, 500);
  };

  useEffect(() => {
    if (error) setIsLoading(false);
  }, [error]);

  useEffect(() => {
    (async () => {
      if (!(loginResponse && userLoginDone && accessToken)) return;

      const userResponse = await ApiExecutor(ApiDefinitions.userProfile());
      setIsLoading(false);

      if (!userResponse.success) {
        return;
      }

      dispatch(storeUserProfile(userResponse.data.user));

      if (loginResponse.isNewUser) {
        navigation.replace(constants.REGISTER_WITH_EXTRA_INFORMATION);
      } else {
        navigation.replace(constants.HOMEPAGE);
      }
    })();
  }, [loginResponse, userLoginDone, accessToken]);

  return (
    <Container>
      <TopHeading heading="অ্যাপে প্রবেশ করুন" />
      <View style={styles.loginContainer}>
        <AuthIcon />
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            name="email"
            placeholder="ইমেইল"
            onChangeText={(text) => createChangeHandler(text, 'email')}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="পাসওয়ার্ড"
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'password')}
          />

          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              marginRight: 20,
              paddingTop: 8,
            }}
            onPress={() =>
              navigation.navigate(constants.FORGET_PASSWORD, {
                accountType: RoleEnum.USER,
              })
            }
          >
            <AppText
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: colors.primary,
              }}
            >
              পাসওয়ার্ড ভুলে গিয়েছেন?
            </AppText>
          </TouchableOpacity>

          <Loader visible={isLoading} style={{ marginTop: 10 }} />
          <ErrorButton visible={!!error && !isLoading} title={error} />
          <SubmitButton title={'লগইন করুন'} onPress={submitLoginForm} visible={!isLoading} />

          <EndOptions
            title1={'আপনার কি অ্যাকাউন্ট নেই?'}
            title2={'রেজিস্ট্রেশন করুন'}
            title3={'প্রফেশনাল হিসেবে লগইন করুন'}
            onPress1={() => navigation.navigate(constants.USER_REGISTER_CONSENT)}
            onPress2={() => navigation.navigate(constants.PROF_LOGIN)}
          />
        </View>
      </View>
    </Container>
  );
};
