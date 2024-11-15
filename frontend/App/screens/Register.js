import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import TextInput from '../components/TextInput';
import colors from '../config/colors';
import constants from '../navigation/constants';
import AuthIcon from '../components/Auth/AuthIcon';
import Container from '../components/Auth/Container';
import EndOptions from '../components/Auth/EndOptions';
import TopHeading from '../components/Auth/TopHeading';
import Button from '../components/Button';
import { loginAction } from '../redux/actions/auth';
import { storeUserProfile } from '../redux/actions/user';
import useFormFields from '../components/HandleForm';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useBackPress } from '../hooks';
import validator from 'validator';
import { register } from '../services/api';

let borderRadius = 35;

const SCREEN_SIZE = constants.REGISTER;

const Register = () => {
  useBackPress(SCREEN_SIZE);

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

    if (!payload.email || payload.email === '') {
      setError('Email is required');
      return;
    } else if (!validator.isEmail(payload.email)) {
      setError('Email is not valid');
      return;
    } else if (!payload.password || payload.password === '') {
      setError('Password is required');
      return;
    } else if (payload.password !== payload.confirmPassword) {
      setError('Password is not matching');
      return;
    }

    setIsLoading(true);
    setError(null);

    payload.email = payload.email.toString().trim().toLowerCase();
    payload.password = payload.password.toString().trim().toLowerCase();

    const response = await register(payload);
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    dispatch(storeUserProfile(response.data.user));
    dispatch(loginAction(response.data.user._id, response.data.accessToken));

    navigation.navigate(constants.REGISTER_WITH_EXTRA_INFORMATION);
  };

  return (
    <Container>
      <TopHeading heading="Join now!" />
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

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="confirmPassword"
            placeholder="Confirm Password"
            secureTextEntry
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'confirmPassword')}
            style={{ marginBottom: 8 }}
          />

          {isLoading && (
            <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
          )}

          {error && (
            <Button title={error} style={styles.errorButton} textStyle={styles.errorButtonText} />
          )}

          <Button title="Sign up" style={styles.submitButton} onPress={submitLoginForm} />

          <EndOptions
            title1={`Already have an account?`}
            title2={`Login here`}
            title3={`Register as a professional`}
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
