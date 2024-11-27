import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../components/Auth/AuthIcon';
import Container from '../../components/Auth/Container';
import EndOptions from '../../components/Auth/EndOptions';
import useFormFields from '../../components/HandleForm';
import TextInput from '../../components/TextInput';
import colors from '../../config/colors';
import constants from '../../navigation/constants';
import { setProfessionalInfo } from '../../redux/actions/prof';
import { useBackPress, useHelper } from '../../hooks';
import { ApiDefinitions } from '../../services/api';
import { RoleEnum } from '../../utils/roles';
import { setAuthToken } from '../../redux/utils';
import { ErrorButton, Loader } from '../../components';
import { SubmitButton } from '../../components/SubmitButton';

const SCREEN_NAME = constants.PROF_LOGIN;
const ProfLoginComponent = () => {
  useBackPress(SCREEN_NAME);
  const { ApiExecutor } = useHelper();

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

    const response = await ApiExecutor(
      ApiDefinitions.loginProfessional({
        payload: fields,
      })
    );

    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    const { prof, accessToken, refreshToken } = response.data;

    console.log(response);

    if (!('step' in prof)) {
      setError('Step count not found');
      return;
    }

    dispatch(setAuthToken(RoleEnum.PROFESSIONAL, accessToken, refreshToken));
    dispatch(setProfessionalInfo(prof));

    if (prof.step == 1) {
      navigation.navigate(constants.PROF_REGISTER_STEP_2);
    } else if (prof.step == 2) {
      navigation.navigate(constants.PROF_REGISTER_STEP_3);
    } else if (prof.step == 3) {
      navigation.navigate(constants.PROF_REGISTER_STEP_4);
    } else {
      navigation.navigate(constants.PROF_HOMEPAGE);
    }
  };

  return (
    <Container>
      <View style={styles.header}>
        <Text style={styles.headerText}>প্রফেশনাল হিসেবে</Text>
        <Text style={styles.subHeaderText}> লগইন করুন</Text>
      </View>
      <View style={styles.loginContainer}>
        <AuthIcon />
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            name="email"
            placeholder="ইমেইল"
            keyboardType="email-address"
            textContentType="emailAddress"
            onChangeText={(text) => createChangeHandler(text, 'email')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="পাসওয়ার্ড"
            secureTextEntry
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'password')}
          />

          <Loader style={{ paddingTop: 10 }} visible={isLoading} />
          <ErrorButton title={error} visible={!!error} />
          <SubmitButton title={'লগইন করুন'} onPress={HandleFormSubmit} style={{ marginTop: 8 }} />

          {/* <TouchableOpacity
            style={styles.forgetPassword}
            onPress={() => navigation.navigate('RecoverAccount')}
          >
            <Text style={styles.lowerTexts}>পাসওয়ার্ড ভুলে গেছেন?</Text>
          </TouchableOpacity> */}

          <EndOptions
            title1={`আপনার কি অ্যাকাউন্ট নেই?`}
            title2={`রেজিস্ট্রেশন করুন`}
            title3={`ইউজার হিসেবে লগইন করুন`}
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
  forgetPassword: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 25,
    marginTop: 10,
    marginBottom: 5,
  },
  lowerTexts: {
    fontSize: 14.5,
    fontWeight: 'bold',
    fontSize: 14.5,
    color: colors.textSecondary,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
  },
  headerText: {
    color: 'white',
    fontSize: 26,
    alignSelf: 'center',
    letterSpacing: 1,
    fontWeight: '700',
  },
  subHeaderText: {
    color: 'white',
    fontSize: 23,
    alignSelf: 'center',
    letterSpacing: 1.2,
    fontWeight: '400',
    paddingTop: 15,
  },
});

export default ProfLoginComponent;
