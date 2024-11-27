import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { connect } from 'react-redux';
import validator from 'validator';
import AuthIcon from '../../components/Auth/AuthIcon';
import Container from '../../components/Auth/Container';
import TopHeading from '../../components/Auth/TopHeading';
import Button from '../../components/Button';
import useFormFields from '../../components/HandleForm';
import TextInput from '../../components/TextInput';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { loginAction } from '../../redux/actions/prof';

let borderRadius = 35;

const RecoverAccount = ({ navigation, route, ...props }) => {
  const [step1, setStep1] = useState(true);
  const [getCode, setGetCode] = useState(false);
  const [enterCode, setEnterCode] = useState(false);
  const [changepass, setChangePass] = useState(false);
  const { jwtToken, isAuthenticated, loginAction } = props;

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialState = {
    email: '',
    password: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  };

  const { formFields, createChangeHandler } = useFormFields(initialState);

  const handleSteps = (step) => {
    if (step === 'getCode') {
      setError(null);
      setGetCode(true);
      setStep1(false);
      setEnterCode(false);
    }
    if (step === 'enterCode') {
      setError(null);
      setEnterCode(true);
      setGetCode(false);
      setStep1(false);
    }
  };

  const handleGetCode = (step) => {
    const fld = { ...formFields };
    setError(null);
    if (!validator.isEmail(fld.email)) {
      setError('Email is not valid');
    } else {
      setIsLoading(true);
      axios
        .post(`${BaseUrl}/prof/getCode`, fld)
        .then(async (res) => {
          setIsLoading(false);
          setError(null);
          setGetCode(false);
          setEnterCode(true);
        })
        .catch((e) => {
          setIsLoading(false);
          console.log(e);
          setError(e.response.data.message);
        });
    }
  };

  const handleVCode = () => {
    const fld = { ...formFields };
    if (fld.email && fld.verificationCode) {
      setError(null);
      setChangePass(true);
      setEnterCode(false);
      setGetCode(false);
      setStep1(false);
    } else {
      setError('Fill up the fields properly');
    }
  };

  const handlePassChange = () => {
    const fld = { ...formFields };
    if (fld.confirmPassword === fld.newPassword) {
      setError(null);
      axios
        .post(`${BaseUrl}/prof/changePassword`, fld)
        .then(async (res) => {
          setIsLoading(false);
          setError(null);

          dispatch(
            setProfAuthToken({
              _id: res?.data?.data?.prof._id,
              jwtToken: res.data.data.accessToken,
            })
          );
          loginAction(res?.data?.data?.prof, res.data.data.accessToken);

          if (res.data.data.prof.step == 1) {
            navigation.navigate('RegisterProStep2');
          } else if (res.data.data.prof.step == 2) {
            navigation.navigate('RegisterProStep3');
          } else if (res.data.data.prof.step == 3) {
            navigation.navigate('RegisterProStep4');
          } else if (res.data.data.prof.step >= 4) {
            navigation.navigate('ProHomepage');
          }
        })
        .catch((e) => {
          setIsLoading(false);
          console.log(e);
          setError(e.response.data.message);
        });
    } else {
      setError('Password is not matching');
    }
  };

  return (
    <Container>
      <TopHeading heading="Recover Account" subHeading="professional" />
      <View style={styles.loginContainer}>
        <AuthIcon />
        <View style={styles.loginButtons}>
          {/* step 1 */}
          {step1 && (
            <>
              <Button
                title="Get Code"
                style={{
                  marginVertical: 10,
                  marginBottom: 0,
                }}
                onPress={() => handleSteps('getCode')}
              />

              <Button
                title="Enter Code"
                style={{
                  marginVertical: 10,
                  marginBottom: 0,
                }}
                onPress={() => handleSteps('enterCode')}
              />
            </>
          )}

          {/* get verification code  */}
          {getCode && (
            <>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                icon="email"
                name="email"
                placeholder="Email"
                onChangeText={(text) => createChangeHandler(text, 'email')}
              />

              {isLoading && (
                <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
              )}

              <Button
                title="Cofirm"
                style={{
                  marginVertical: 10,
                  marginBottom: 0,
                }}
                onPress={() => handleGetCode('getCode')}
              />
              <TouchableOpacity>
                <Text style={styles.textStyle} onPress={() => handleSteps('enterCode')}>
                  Enter Code
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* enter verification code */}
          {enterCode && (
            <>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                icon="email"
                name="email"
                placeholder="Email"
                defaultValue={formFields.email ? formFields.email : ''}
                onChangeText={(text) => createChangeHandler(text, 'email')}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                icon="check"
                name="verificationCode"
                placeholder="Verification Code"
                onChangeText={(text) => createChangeHandler(text, 'verificationCode')}
              />

              {isLoading && (
                <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
              )}

              <Button
                title="Confirm"
                style={{
                  marginVertical: 10,
                  marginBottom: 0,
                }}
                onPress={handleVCode}
              />
              <TouchableOpacity>
                <Text style={styles.textStyle} onPress={() => handleSteps('getCode')}>
                  Get Code
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* change password */}
          {changepass && (
            <>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock"
                name="newPassword"
                placeholder="New Password"
                // secureTextEntry
                textContentType="password"
                keyboardType="default"
                onChangeText={(text) => createChangeHandler(text, 'newPassword')}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock"
                name="confirmPassword"
                placeholder="Confirm Password"
                // secureTextEntry
                textContentType="password"
                keyboardType="default"
                onChangeText={(text) => createChangeHandler(text, 'confirmPassword')}
              />

              {isLoading && (
                <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
              )}

              <Button
                title="Sign in"
                style={{
                  marginVertical: 10,
                  marginBottom: 0,
                }}
                onPress={handlePassChange}
              />
            </>
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
            />
          )}
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
    backgroundColor: '#000',
  },
  textStyle: {
    fontWeight: 'bold',
    fontSize: 14.5,
    color: '#5e5e5e',
    marginTop: 6,
    paddingTop: 10,
  },
});

const mapStateToProps = (state) => ({
  jwtToken: state.prof.jwtToken,
  isAuthenticated: state.prof.isAuthenticated,
});

export default connect(mapStateToProps, { loginAction })(RecoverAccount);
