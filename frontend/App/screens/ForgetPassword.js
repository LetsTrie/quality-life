import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';
import { ErrorButton, Loader, SubmitButton } from '../components';
import AppTextInput from '../components/TextInput';
import colors from '../config/colors';
import validator from 'validator';
import { ApiDefinitions } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RoleEnum, isUser } from '../utils/roles';

const SCREEN_NAME = constants.FORGET_PASSWORD;
export default function ForgetPassword() {
    const navigation = useNavigation();
    const route = useRoute();
    const { accountType } = route.params || {};

    const { ApiExecutor } = useHelper();
    useBackPress(SCREEN_NAME, constants.GO_TO_BACK);

    if (![RoleEnum.USER, RoleEnum.PROFESSIONAL].includes(accountType)) {
        throw new Error('Invalid account type');
    }

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
    const [emailVerificationError, setEmailVerificationError] = useState(null);

    const [otp, setOtp] = useState('');
    const [OTPLoading, setOTPLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [PasswordLoading, setPasswordLoading] = useState(false);
    const [PasswordError, setPasswordError] = useState(null);

    const handleMessageVerification = async () => {
        if (!validator.isEmail(email)) {
            setEmailVerificationError('Invalid email address');
            return;
        }

        setEmailVerificationError(null);
        setEmailVerificationLoading(true);
        const response = await ApiExecutor(
            ApiDefinitions.sendEmailForOtpVerification({
                email,
                accountType,
                useCase: 'forget-password',
            })
        );
        setEmailVerificationLoading(false);

        if (!response.success) {
            setEmailVerificationError(response.error.message);
            return;
        }

        setStep(2);
    };

    const handleOtpVerification = async () => {
        if (!validator.isNumeric(otp)) {
            setOtpError('OTP must be a number');
            return;
        }

        setOtpError(null);
        setOTPLoading(true);
        const response = await ApiExecutor(
            ApiDefinitions.verificationByOtp({
                email,
                otp,
                accountType,
                useCase: 'forget-password',
            })
        );
        setOTPLoading(false);

        if (!response.success) {
            if (response.type === 'OTP_EXPIRED') {
                setOtpError('আপনার OTP কোডটি বাতিল হয়ে গিয়েছে। পুনরায় একটি কোড পাঠানো হয়েছে।');
                await handleMessageVerification();
            } else {
                setOtpError(response.error.message);
            }
            return;
        }

        setStep(3);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        const payload = {
            password: newPassword,
            email,
            accountType,
        };

        setPasswordError(null);
        setPasswordLoading(true);
        const response = await ApiExecutor(
            ApiDefinitions.resetPasswordAfterForgetPassword({
                payload,
            })
        );
        setPasswordLoading(false);

        if (!response.success) {
            setPasswordError(response.error.message);
            return;
        }

        if (isUser(accountType)) {
            navigation.replace(constants.LOGIN);
        } else {
            navigation.replace(constants.PROF_LOGIN);
        }
    };

    return (
        <View style={styles.container}>
            {step === 1 && (
                <>
                    <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="email"
                        name="email"
                        placeholder="ইমেইল"
                        onChangeText={(text) => setEmail(text)}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        width="100%"
                        style={{
                            borderColor: colors.primary,
                            borderWidth: 1,
                            marginBottom: 5,
                        }}
                    />
                    <Loader visible={emailVerificationLoading} style={{ marginTop: 10 }} />
                    <ErrorButton
                        visible={!!emailVerificationError}
                        title={emailVerificationError}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                    />
                    <SubmitButton
                        visible={!emailVerificationLoading}
                        title={'Send OTP'}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                        onPress={handleMessageVerification}
                        disabled={!validator.isEmail(email)}
                    />
                </>
            )}

            {step === 2 && (
                <>
                    <AppTextInput
                        icon="lock-outline"
                        name="otp"
                        placeholder="OTP"
                        onChangeText={(text) => setOtp(text)}
                        width="100%"
                        style={{
                            borderColor: colors.primary,
                            borderWidth: 1,
                            marginBottom: 5,
                        }}
                        keyboardType="number-pad"
                    />

                    <Loader visible={OTPLoading} style={{ marginTop: 10 }} />
                    <ErrorButton
                        visible={!!otpError}
                        title={otpError}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                    />
                    <SubmitButton
                        visible={!OTPLoading}
                        title={'Verify OTP'}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                        onPress={handleOtpVerification}
                        disabled={!otp}
                    />
                </>
            )}

            {step === 3 && (
                <>
                    <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="password"
                        placeholder="নতুন পাসওয়ার্ড"
                        textContentType="password"
                        keyboardType="default"
                        onChangeText={(text) => setNewPassword(text)}
                        width="100%"
                        style={{
                            borderColor: colors.primary,
                            borderWidth: 1,
                            marginBottom: 5,
                        }}
                    />
                    <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="confirm-password"
                        placeholder="পুনরায় পাসওয়ার্ড দিন"
                        textContentType="password"
                        keyboardType="default"
                        onChangeText={(text) => setConfirmPassword(text)}
                        width="100%"
                        style={{
                            borderColor: colors.primary,
                            borderWidth: 1,
                            marginBottom: 5,
                        }}
                    />
                    <Loader visible={PasswordLoading} style={{ marginTop: 10 }} />
                    <ErrorButton
                        visible={!!PasswordError}
                        title={PasswordError}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                    />
                    <SubmitButton
                        visible={!PasswordLoading}
                        title={'Update Password'}
                        style={{ paddingVertical: 14, width: '100%' }}
                        textStyle={{ fontSize: 14 }}
                        onPress={handleChangePassword}
                        disabled={
                            !newPassword || !confirmPassword || newPassword !== confirmPassword
                        }
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingVertical: 10,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#343a40',
    },
    dropdown: {
        height: 50,
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
    },
    input: {
        height: 50,
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#007bff',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#6c757d',
    },
});
