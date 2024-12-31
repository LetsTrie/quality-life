import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements';
import React from 'react';
import colors from '../config/colors.js';
import AdditionalInformation from '../screens/AdditionalInformation.js';
import AllProfessionals from '../screens/AllProfessionals.js';
import AppointmentSuccess from '../screens/AppointmentSuccess.js';
import AskForTest from '../screens/AskForTest.js';
import CentralHelpCenter from '../screens/CentralHelpCenter.js';
import MentalHealthAssessmentResult from '../screens/CircularQuizResult.js';
import DrawerGuideline from '../screens/DrawerGuideline.js';
import HelpCenter from '../screens/HelpCenter.js';
import Homepage from '../screens/Homepage.js';
import MentalHealthAssessment from '../screens/HomepageScale.js';
import { StartingGuideline, Welcome, UserLogin } from '../screens/pages2024/index.js';
import WaitForVerification from '../screens/prof/WaitForVerification.js';
import ProAssessmentDetails from '../screens/prof/AssessmentDetails.js';
import ProAssessments from '../screens/prof/Assessments.js';
import ClientProfile from '../screens/prof/ClientProfile.js';
import ClientRequestPro from '../screens/prof/ClientRequest.js';
import ClientTestResult from '../screens/prof/ClientTestResult.js';
import LoginPro from '../screens/prof/Login.js';
import ProMyClients from '../screens/prof/MyClients.js';
import ProNotification from '../screens/prof/Notification.js';
import ProfProfile from '../screens/prof/ProfProfile.js';
import ProHomepage from '../screens/prof/ProHomepage.js';
import RegisterConsentPro from '../screens/prof/RegisterConsentPro.js';

import RegisterStep1 from '../screens/prof/RegisterStep1.js';
import RegisterStep2 from '../screens/prof/RegisterStep2.js';
import RegisterStep3 from '../screens/prof/RegisterStep3.js';
import RegisterStep4 from '../screens/prof/RegisterStep4.js';

import ResponseRequest from '../screens/prof/ResponseRequest.js';
import ProfUpdateProfile from '../screens/prof/ProfUpdateProfile.js';
import professionalDetails from '../screens/professionalDetails.js';
import ProfScaleResult from '../screens/profScaleResult.js';
import ProfSuggestedScale from '../screens/ProfSuggestedScale.js';
import QuizResultOutOf100 from '../screens/QuizResultOutOf100.js';
import Rating from '../screens/Rating.js';
import Register from '../screens/Register.js';
import ResultHistory from '../screens/ResultHistory.js';
import AboutUs from '../screens/Setting/AboutUs.js';
import PrivacyPolicy from '../screens/Setting/PrivacyPolicy.js';
import Setting from '../screens/Setting/Setting.js';
import Test from '../screens/Test.js';

import AppointmentStatus from '../screens/UserIntProf/AppointmentStatus.js';
import UserRegisterConsent from '../screens/UserRegistrationConsent.js';

import constants from './constants.js';
import backScreenMap from './backScreenMap.js';

// UPDATED
import UserProfile from '../screens/Profile.js';
import UpdateUserProfile from '../screens/UpdateProfile.js';
import ThreeScales from '../screens/ThreeScales.js';
import VideoExercise from '../screens/VideoExercise.js';
import VideoExerciseList from '../screens/VideoExerciseList.js';
import VideoScreen from '../screens/VideoScreen.js';
import UpdatePassword from '../screens/Setting/UpdatePassword.js';
import { useSelector } from 'react-redux';
import { selectHomepageByRole } from '../utils/roles.js';
import ForgetPassword from '../screens/ForgetPassword.js';
import EmailVerification from '../screens/EmailVerification.js';

const Stack = createStackNavigator();

const dontShowHeader = () => ({ headerShown: false });

const screenOptions = ({ navigation }) => ({
    headerStyle: {
        backgroundColor: colors.primary,
        height: 60,
    },
    headerTitleStyle: {
        color: 'white',
        fontSize: 20,
    },
    headerTintColor: 'white',
    headerBackTitle: 'Back',
    headerTitleAlign: 'center',
    headerLeft: () => {
        return (
            <MaterialCommunityIcons
                name={'backburger'}
                size={35}
                color={'white'}
                style={{ paddingHorizontal: 12 }}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
        );
    },
});

const replaceNavigation = (navigation, route, screen, role) => {
    if (!navigation || !screen) {
        console.error(
            '[replaceNavigation] Missing required arguments: navigation or screen is undefined.'
        );
        return;
    }

    if (screen === constants.GO_TO_BACK) {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            console.warn('[Navigation] Cannot go back: No previous screen in navigation stack.');
        }
        return;
    }

    try {
        navigation.replace(selectHomepageByRole(screen, role));
    } catch (error) {
        console.error(`[replaceNavigation] navigation.replace failed: ${error.message}`);

        try {
            navigation.navigate(selectHomepageByRole(screen, role));
        } catch (fallbackError) {
            console.error(
                `[replaceNavigation] Fallback navigation.navigate also failed: ${fallbackError.message}`
            );
            throw new Error(
                `Navigation to screen "${screen}" failed using both replace and navigate.`
            );
        }
    }
};

const safeTransit = ({ navigation, route, role }) => {
    if (!navigation || !route) {
        console.error(
            '[safeTransit] Missing required arguments: navigation or route is undefined.'
        );
        return;
    }

    if (!('params' in route)) {
        console.error('[safeTransit] Invalid route object: "params" is not defined.');
        return;
    }

    const screen = route.name;
    const { goToBack } = route.params || {};

    if (goToBack) {
        replaceNavigation(navigation, route, goToBack, role);
        return;
    }

    if (!screen) {
        console.error('[safeTransit] Missing required argument: "screen" is undefined.');
        return;
    }

    if (!(screen in backScreenMap)) {
        console.error(`[safeTransit] Invalid screen: "${screen}" is not in backScreenMap.`);
        throw new Error(`Screen "${screen}" is not mapped in backScreenMap.`);
    }

    const targetScreen = backScreenMap[screen];
    replaceNavigation(navigation, route, targetScreen, role);
};

// --------------------------------------------------------
// ************************ Index *************************
// --------------------------------------------------------
// * Professional Assessment Tools

const StackNavigator = () => {
    const { role } = useSelector((state) => state.auth);

    return (
        <Stack.Navigator initialRouteName="Welcome" screenOptions={screenOptions}>
            <Stack.Screen name="Welcome" component={Welcome} options={dontShowHeader} />
            <Stack.Screen name="Login" component={UserLogin} options={dontShowHeader} />
            <Stack.Screen
                name={constants.FORGET_PASSWORD}
                component={ForgetPassword}
                options={({ navigation, route }) => ({
                    title: 'পাসওয়ার্ড পরিবর্তন করুন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.EMAIL_VERIFICATION_PAGE}
                component={EmailVerification}
                options={() => ({
                    title: 'অ্যাকাউন্ট ভেরিফাই করুন',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.USER_REGISTER_CONSENT}
                component={UserRegisterConsent}
                options={() => ({
                    title: 'মানসিক স্বাস্থ্য মূল্যায়ন',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.REGISTER_WITH_EXTRA_INFORMATION}
                component={AdditionalInformation}
                options={dontShowHeader}
            />
            <Stack.Screen
                name={constants.ONBOARDING_GUIDELINE}
                component={StartingGuideline}
                options={() => ({
                    title: 'অভিনন্দন',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.HOMEPAGE}
                component={Homepage}
                options={() => ({
                    title: 'Quality Life',
                })}
            />
            <Stack.Screen
                name={constants.PROF_CLIENT_REQUEST}
                component={ClientRequestPro}
                options={({ navigation, route }) => ({
                    title: 'Client Requests',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.UPDATE_PASSWORD}
                component={UpdatePassword}
                options={({ navigation }) => ({
                    title: 'পাসওয়ার্ড পরিবর্তন করুন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.UPDATE_PASSWORD]);
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROF_RESPONSE_CLIENT_REQUEST}
                component={ResponseRequest}
                options={({ navigation, route }) => ({
                    title: 'Client Request',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROFESSIONALS_CLIENT}
                component={ProMyClients}
                options={({ navigation, route }) => ({
                    title: 'My Clients',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.CLIENT_PROFILE}
                component={ClientProfile}
                options={({ navigation, route, ...props }) => ({
                    title: 'Client Profile',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.CLIENT_TEST_RESULT}
                component={ClientTestResult}
                options={({ navigation, route }) => ({
                    title: 'Scale Result',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROF_SUGGESTED_SCALE}
                component={ProfSuggestedScale}
                options={({ navigation, route }) => ({
                    title: 'স্কেলটি পূরণ করুন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                if (route.params.goToBack) {
                                    navigation.replace(route.params.goToBack);
                                } else {
                                    navigation.navigate(
                                        backScreenMap[constants.PROF_SUGGESTED_SCALE]
                                    );
                                }
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROF_SUGGESTED_SCALE_RESULT}
                component={ProfScaleResult}
                options={({ navigation, route }) => ({
                    title: 'Your Score',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                if (route.params.goToBack) {
                                    navigation.replace(route.params.goToBack);
                                } else {
                                    navigation.navigate(
                                        backScreenMap[constants.PROF_SUGGESTED_SCALE_RESULT]
                                    );
                                }
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.APPOINTMENT_STATUS}
                component={AppointmentStatus}
                options={({ navigation, route }) => ({
                    title: 'Appointment',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                if (route.params.goToBack) {
                                    navigation.replace(route.params.goToBack);
                                } else {
                                    navigation.navigate(
                                        backScreenMap[constants.APPOINTMENT_STATUS]
                                    );
                                }
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen name="Register" component={Register} options={dontShowHeader} />
            <Stack.Screen name="LoginPro" component={LoginPro} options={dontShowHeader} />

            <Stack.Screen
                name={constants.PROFESSIONAL_DETAILS}
                component={professionalDetails}
                options={({ navigation }) => ({
                    title: 'অ্যাপয়েন্টমেন্ট নিন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.replace(backScreenMap[constants.PROFESSIONAL_DETAILS]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.USER_APPOINTMENT_TAKEN}
                component={AppointmentSuccess}
                options={({ navigation }) => ({
                    title: 'অভিনন্দন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(
                                    backScreenMap[constants.USER_APPOINTMENT_TAKEN]
                                );
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.NOTIFICATIONS}
                component={ProNotification}
                options={({ navigation, route }) => ({
                    title: 'Notifications',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.PROF_REGISTRATION_CONSENT}
                component={RegisterConsentPro}
                options={() => ({
                    title: 'সম্মতিপত্র',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.PROF_REGISTER_STEP_1}
                component={RegisterStep1}
                options={dontShowHeader}
            />
            <Stack.Screen
                name={constants.WAIT_FOR_VERIFICATION}
                component={WaitForVerification}
                options={({ navigation }) => ({
                    title: 'ধন্যবাদ',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.WAIT_FOR_VERIFICATION]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.PROF_HOMEPAGE}
                component={ProHomepage}
                options={() => ({
                    title: constants.HOMEPAGE,
                })}
            />

            {/* 
        *************************************************************
        *************************************************************
                        Professional Assessment Tools 
        *************************************************************
        *************************************************************
      */}

            <Stack.Screen
                name={constants.PROF_ASSESSMENT_TOOLS}
                component={ProAssessments}
                options={({ navigation, route }) => ({
                    title: 'Assessment tools',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROF_ASSESSMENT_TOOL_DETAILS}
                component={ProAssessmentDetails}
                options={({ navigation, route }) => ({
                    title: 'Tool Overview',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name={constants.PROF_PROFILE}
                component={ProfProfile}
                options={() => ({
                    title: 'My Profile',
                })}
            />
            <Stack.Screen
                name={constants.PROF_UPDATE_PROFILE}
                component={ProfUpdateProfile}
                options={({ navigation, route }) => ({
                    title: 'Update Profile',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                safeTransit({ navigation, route, role });
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.PROF_REGISTER_STEP_2}
                component={RegisterStep2}
                options={() => ({
                    title: 'Registration - Step 2',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.PROF_REGISTER_STEP_3}
                component={RegisterStep3}
                options={() => ({
                    title: 'Registration - Step 3',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.PROF_REGISTER_STEP_4}
                component={RegisterStep4}
                options={() => ({
                    title: 'Pre-evaluation',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.PROFESSIONALS_LIST}
                component={AllProfessionals}
                options={() => ({
                    title: 'আমাদের প্রফেশনালস',
                })}
            />
            <Stack.Screen
                name={constants.MENTAL_HEALTH_ASSESSMENT}
                component={MentalHealthAssessment}
                options={() => ({
                    title: 'মানসিক স্বাস্থ্য মূল্যায়ন',
                })}
            />
            <Stack.Screen
                name={constants.THREE_SCALES}
                component={ThreeScales}
                options={({ navigation }) => ({
                    title: 'মানসিক স্বাস্থ্য যাচাই',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.THREE_SCALES]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.QUIZ_RESULT_OUT_OF_100}
                component={QuizResultOutOf100}
                options={({ navigation }) => ({
                    title: 'আপনার স্কোর',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(
                                    backScreenMap[constants.QUIZ_RESULT_OUT_OF_100]
                                );
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.VIDEO_EXERCISE_LIST}
                component={VideoExerciseList}
                options={({ navigation }) => ({
                    title: 'অনুশীলন করুন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.VIDEO_EXERCISE_LIST]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.VIDEO_EXERCISE}
                component={VideoExercise}
                options={({ navigation }) => ({
                    title: 'অনুশীলন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.VIDEO_EXERCISE]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.UPDATE_USER_PROFILE}
                component={UpdateUserProfile}
                options={({ navigation }) => ({
                    title: 'প্রোফাইল আপডেট করুন',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.UPDATE_USER_PROFILE]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.RATING}
                component={Rating}
                options={({ navigation }) => ({
                    title: 'মানসিক স্বাস্থ্য পরিমাপের অবস্থা',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.RATING]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.MENTAL_HEALTH_ASSESSMENT_RESULT}
                component={MentalHealthAssessmentResult}
                options={({ navigation, route }) => ({
                    title: 'ফলাফল',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                if (route.params.goToBack) {
                                    navigation.replace(route.params.goToBack);
                                } else {
                                    navigation.navigate(
                                        backScreenMap[constants.MENTAL_HEALTH_ASSESSMENT_RESULT]
                                    );
                                }
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.TEST}
                component={Test}
                options={({ route }) => ({
                    title: route.params.label || 'স্কেলটি পূরণ করুন',
                    headerLeft: () => undefined,
                })}
            />
            <Stack.Screen
                name={constants.PROFILE}
                component={UserProfile}
                options={({ navigation }) => ({
                    title: 'প্রোফাইল',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.PROFILE]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.SIDEBAR_APP_GUIDELINE}
                component={DrawerGuideline}
                options={() => ({
                    title: 'ব্যবহারিক নির্দেশিকা',
                })}
            />
            <Stack.Screen
                name={constants.SETTINGS}
                component={Setting}
                options={() => ({
                    title: 'সেটিংস',
                })}
            />
            <Stack.Screen
                name={constants.ABOUT_US}
                component={AboutUs}
                options={({ navigation }) => ({
                    title: 'আমাদের সম্পর্কিত তথ্য',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.ABOUT_US]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.PRIVACY_POLICY}
                component={PrivacyPolicy}
                options={({ navigation }) => ({
                    title: 'গোপনীয়তা নীতি',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.PRIVACY_POLICY]);
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.CENTRAL_HELP_CENTER}
                component={CentralHelpCenter}
                options={() => ({
                    title: 'সাহায্য কেন্দ্র',
                })}
            />
            <Stack.Screen
                name={constants.ASK_FOR_TEST}
                component={AskForTest}
                options={dontShowHeader}
            />

            <Stack.Screen
                name={constants.RESULT_HISTORY}
                component={ResultHistory}
                options={() => ({
                    title: 'পূর্ববর্তী রেজাল্টসমূহ',
                })}
            />

            <Stack.Screen
                name={constants.HELP_CENTER}
                component={HelpCenter}
                options={({ navigation, route }) => ({
                    title: 'সাহায্য কেন্দ্র',
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.replace(
                                    route.params.goToBack || backScreenMap[constants.HELP_CENTER]
                                );
                            }}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name={constants.VIDEO_SCREEN}
                component={VideoScreen}
                options={({ navigation }) => ({
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.navigate(backScreenMap[constants.VIDEO_SCREEN]);
                            }}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;
