import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../../components/Auth/AuthIcon';
import Container from '../../../components/Auth/Container';
import EndOptions from '../../../components/Auth/EndOptions';
import TopHeading from '../../../components/Auth/TopHeading';
import Button from '../../../components/Button';
import useFormFields from '../../../components/HandleForm';
import TextInput from '../../../components/TextInput';
import colors from '../../../config/colors';
import { useBackPress } from '../../../hooks';
import constants from '../../../navigation/constants';
import { loginAction } from '../../../redux/actions/auth';
import { storeUserProfile } from '../../../redux/actions/user';
import { getUserProfile, login } from '../../../services/api';
import styles from './UserLogin.style';

const SCREEN_SIZE = constants.LOGIN;

export const UserLogin = () => {
  useBackPress(SCREEN_SIZE);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const initialState = { email: '', password: '' };
  const { formFields, createChangeHandler } = useFormFields(initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

    const loginResponse = await login(payload);
    setIsLoading(false);

    if (!loginResponse.success) {
      setError(loginResponse.error.message);
      return;
    }

    const userResponse = await getUserProfile({ jwtToken: loginResponse.data.accessToken });
    if (userResponse.success) {
      console.log(userResponse.data);
      dispatch(storeUserProfile(userResponse.data));
    } else {
      processApiError(userResponse);
    }

    dispatch(loginAction(loginResponse.data.user._id, loginResponse.data.accessToken));

    if (loginResponse.data.isNewUser) {
      navigation.navigate(constants.REGISTER_WITH_EXTRA_INFORMATION);
    } else if (loginResponse.data.didIntroTest) {
      navigation.navigate(constants.TEST_PAGE, { ToHomepage: true });
    } else {
      navigation.navigate(constants.HOMEPAGE);
    }
  };

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
