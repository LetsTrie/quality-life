import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { Loader, ErrorButton, SubmitButton, AppText } from '../components';
import AppTextInput from '../components/TextInput';
import colors from '../config/colors';
import validator from 'validator';
import { ApiDefinitions } from '../services/api';
import { useBackPress, useHelper } from '../hooks';
import constants from '../navigation/constants';

const SCREEN_NAME = constants.EMAIL_VERIFICATION_PAGE;
export default function EmailVerification() {
    useBackPress(SCREEN_NAME);

    const isFocused = useIsFocused();
    const router = useRoute();
    const { ApiExecutor, redirectToHomepage, logout } = useHelper();

    const [otp, setOtp] = useState('');
    const [OTPLoading, setOTPLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);

    const useCase = 'email-verification';

    const { accountType, email } = router.params;

    const sendOtp = useCallback(async () => {
        const response = await ApiExecutor(
            ApiDefinitions.sendEmailForOtpVerification({
                useCase,
                email,
                accountType,
            })
        );
        if (!response.success) {
            setOtpError(response.error.message);
        }
    }, []);

    useEffect(() => {
        if (!isFocused) return;

        (async () => {
            await sendOtp();
        })();
    }, [isFocused]);

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
                useCase,
            })
        );

        setOTPLoading(false);

        if (!response.success) {
            if (response.type === 'OTP_EXPIRED') {
                setOtpError('আপনার OTP কোডটি বাতিল হয়ে গিয়েছে। পুনরায় একটি কোড পাঠানো হয়েছে।');
                await sendOtp();
            } else {
                setOtpError(response.error.message);
            }
            return;
        }

        redirectToHomepage();
    };

    return (
        <View style={styles.container}>
            <AppText
                style={{
                    fontSize: 16,
                    textAlign: 'justify',
                    paddingHorizontal: 5,
                    paddingVertical: 10,
                    paddingBottom: 5,
                    lineHeight: 24,
                    color: colors.textSecondary,
                    fontWeight: 'bold',
                }}
            >
                {email} এ একটি ভেরিফিকেশন কোড পাঠানো হয়েছে। দয়া করে আপনার ইনবক্স চেক করুন এবং
                কোডটি নিচের ঘরে লিখুন।
            </AppText>
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

            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    marginBottom: 10,
                }}
            >
                <SubmitButton
                    title={'Logout'}
                    style={{ paddingVertical: 14, width: '100%', backgroundColor: colors.danger }}
                    textStyle={{ fontSize: 14 }}
                    onPress={logout}
                />
            </View>
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
    input: {
        height: 50,
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#ffffff',
    },
});
