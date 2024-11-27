import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import TextInput from '../components/TextInput';
import constants from '../navigation/constants';
import AuthIcon from '../components/Auth/AuthIcon';
import Container from '../components/Auth/Container';
import EndOptions from '../components/Auth/EndOptions';
import TopHeading from '../components/Auth/TopHeading';
import { storeUserProfile } from '../redux/actions/user';
import useFormFields from '../components/HandleForm';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useBackPress, useHelper } from '../hooks';
import validator from 'validator';
import { ApiDefinitions } from '../services/api';
import { setAuthToken } from '../redux/utils';
import { RoleEnum } from '../utils/roles';
import { ErrorButton, Loader } from '../components';
import { SubmitButton } from '../components/SubmitButton';

let borderRadius = 35;

const SCREEN_SIZE = constants.REGISTER;

const Register = () => {
  useBackPress(SCREEN_SIZE);
  const { ApiExecutor } = useHelper();

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const initialState = { email: '', password: '', confirmPassword: '' };
  const { formFields, createChangeHandler } = useFormFields(initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleBackButtonClick() {
    navigation.reset({
      index: 0,
      routes: [{ name: constants.WELCOME }],
    });

    return true;
  }
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const submitLoginForm = async () => {
    const payload = { ...formFields };

    if (!payload.email || payload.email === '' || !payload.password || payload.password === '') {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    } else if (!validator.isEmail(payload.email)) {
      setError('ইমেলটি বৈধ নয়');
      return;
    } else if (payload.password !== payload.confirmPassword) {
      setError('পাসওয়ার্ড মেলেনি');
      return;
    }

    setError(null);

    payload.email = payload.email.toString().trim().toLowerCase();
    payload.password = payload.password.toString().trim().toLowerCase();

    delete payload['confirmPassword'];

    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.registerAsUser({ payload }));
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    dispatch(storeUserProfile(response.data.user));
    dispatch(setAuthToken(RoleEnum.USER, response.data.accessToken, response.data.refreshToken));

    navigation.navigate(constants.REGISTER_WITH_EXTRA_INFORMATION);
  };

  return (
    <Container>
      <TopHeading heading="রেজিস্ট্রেশন করুন" />
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

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="confirmPassword"
            placeholder="পুনরায় পাসওয়ার্ড দিন "
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'confirmPassword')}
            style={{ marginBottom: 8 }}
          />

          <Loader visible={isLoading} style={{ paddingTop: 10 }} />
          <ErrorButton visible={!!error} title={error} />
          <SubmitButton title="অ্যাকাউন্ট তৈরি করুন" onPress={submitLoginForm} />

          <EndOptions
            title1={`ইতোমধ্যে একটি অ্যাকাউন্ট আছে?`}
            title2={`লগইন করুন`}
            title3={`প্রফেশনাল হিসেবে যোগদান করুন`}
            onPress1={() => navigation.navigate(constants.LOGIN)}
            onPress2={() => navigation.navigate(constants.PROF_REGISTRATION_CONSENT)}
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  },
  BtnStyle: {
    letterSpacing: 0.2,
  },
  loginButtons: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 20,
  },
  BtnWrapper: {
    marginVertical: 0,
    marginBottom: 0,
  },
});

export default Register;
