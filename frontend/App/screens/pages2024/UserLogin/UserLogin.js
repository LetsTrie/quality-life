import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../../components/Auth/AuthIcon';
import Container from '../../../components/Auth/Container';
import EndOptions from '../../../components/Auth/EndOptions';
import TopHeading from '../../../components/Auth/TopHeading';
import Button from '../../../components/Button';
import useFormFields from '../../../components/HandleForm';
import TextInput from '../../../components/TextInput';
import colors from '../../../config/colors';
import { useBackPress, useHelper } from '../../../hooks';
import constants from '../../../navigation/constants';
import { storeUserProfile } from '../../../redux/actions/user';
import { ApiDefinitions } from '../../../services/api';
import styles from './UserLogin.style';
import { setAuthToken } from '../../../redux/utils';
import { RoleEnum } from '../../../utils/roles';

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

    if (!payload.email || payload.email === '') {
      setError('Email is required');
      return;
    } else if (!validator.isEmail(payload.email)) {
      setError('Email is not valid');
      return;
    } else if (!payload.password || payload.password === '') {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    payload.email = payload.email.toString().trim().toLowerCase();
    payload.password = payload.password.toString().trim().toLowerCase();

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

      console.log('Access Token in useEffect: ', accessToken);

      const userResponse = await ApiExecutor(ApiDefinitions.userProfile());
      console.log(userResponse);
      if (!userResponse.success) {
        setError(userResponse?.error?.message);
        return;
      }

      setIsLoading(false);
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
      <TopHeading heading="Get Started!" />
      <View style={styles.loginContainer}>
        <AuthIcon />
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            name="email"
            placeholder="Email"
            onChangeText={(text) => createChangeHandler(text, 'email')}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'password')}
          />

          {isLoading && (
            <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
          )}

          {error && (
            <Button title={error} style={styles.errorButton} textStyle={styles.errorButtonText} />
          )}

          <Button title="Sign in" style={styles.submitButton} onPress={submitLoginForm} />

          <EndOptions
            title1={`Don't have an account?`}
            title2={`Register here`}
            title3={`Login as a professional`}
            onPress1={() => navigation.navigate('UserRegisterConsent')}
            onPress2={() => navigation.navigate('LoginPro')}
          />
        </View>
      </View>
    </Container>
  );
};
