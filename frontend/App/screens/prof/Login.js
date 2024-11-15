import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../components/Auth/AuthIcon';
import Container from '../../components/Auth/Container';
import EndOptions from '../../components/Auth/EndOptions';
import TopHeading from '../../components/Auth/TopHeading';
import Button from '../../components/Button';
import useFormFields from '../../components/HandleForm';
import TextInput from '../../components/TextInput';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import constants from '../../navigation/constants';
import { setProfAuthToken } from '../../redux/actions/auth';
import { loginAction } from '../../redux/actions/prof';
import { useBackPress } from '../../hooks';
import { profLogin } from '../../services/api';

const SCREEN_NAME = constants.PROF_LOGIN;
const ProfLogin = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialState = {
    email: '',
    password: '',
  };
  const { formFields, createChangeHandler } = useFormFields(initialState);

  const HandleFormSubmit = async () => {
    const fields = { ...formFields };

    let fieldAbsent = false;
    for (let key in initialState) {
      if (fields[key] === '') {
        fieldAbsent = true;
      }
    }

    if (fieldAbsent) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    } else if (!validator.isEmail(fields.email)) {
      setError('ইমেলটি বৈধ নয়');
      return;
    }

    setIsLoading(true);
    setError(null);

    fields.email = fields.email.toString().trim().toLowerCase();
    fields.password = fields.password.toString().trim().toLowerCase();

    const response = await profLogin(fields);
    console.log(response);

    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    const {data} = response;

    dispatch(setProfAuthToken({ _id: data.prof._id, jwtToken: data.accessToken }));
    dispatch(loginAction(data?.prof, data.accessToken));

    if (data.prof.step == 1) {
      navigation.navigate(constants.PROF_REGISTER_STEP_2);
    } else if (data.prof.step == 2) {
      navigation.navigate(constants.PROF_REGISTER_STEP_3);
    } else if (data.prof.step == 3) {
      navigation.navigate(constants.PROF_REGISTER_STEP_4);
    } else {
      navigation.navigate(constants.PROF_HOMEPAGE);
    }
  };

  return (
    <Container>
      <TopHeading heading="Get Started!" subHeading="professional" />
      <View style={styles.loginContainer}>
        <AuthIcon />
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            name="email"
            placeholder="Email"
            keyboardType="email-address"
            textContentType="emailAddress"
            onChangeText={(text) => createChangeHandler(text, 'email')}
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
            <Button
              title={error}
              style={{
                marginVertical: 10,
                marginBottom: 0,
                padding: 15,
                backgroundColor: 'white',
                borderColor: colors.primary,
                borderWidth: 3,
              }}
              textStyle={{
                fontSize: 14.5,
                color: colors.primary,
              }}
              onPress={HandleFormSubmit}
            />
          )}

          <Button
            title="Sign in"
            style={{
              marginVertical: 10,
              marginBottom: 0,
            }}
            onPress={HandleFormSubmit}
          />

          <TouchableOpacity
            style={styles.ForgetPass}
            onPress={() => navigation.navigate('RecoverAccount')}
          >
            <Text style={styles.lowerTexts}>Forget password?</Text>
          </TouchableOpacity>

          <EndOptions
            title1={`Don't have an account?`}
            title2={`Register here`}
            title3={`Login as a user`}
            onPress1={() => navigation.navigate(constants.PROF_REGISTRATION_CONSENT)}
            onPress2={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </Container>
  );
};

let borderRadius = 35;
const styles = StyleSheet.create({
  loginContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  },
  loginButtons: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
  lowerTexts: {
    fontWeight: 'bold',
    fontSize: 14.5,
    color: '#5e5e5e',
    marginTop: 6,
    paddingTop: 10,
    textAlign: 'right',
  },
  ForgetPass: {
    width: '88%',
  },
});

export default ProfLogin;
