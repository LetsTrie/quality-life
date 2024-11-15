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
import CircularQuiz from '../screens/CircularQuiz.js';
import CircularQuizResult from '../screens/CircularQuizResult.js';
import DrawerGuideline from '../screens/DrawerGuideline.js';
import HelpCenter from '../screens/HelpCenter.js';
import Homepage from '../screens/Homepage.js';
import HomepageScale from '../screens/HomepageScale.js';
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
import ProActivityLog from '../screens/prof/ProActivityLog.js';
import ProfileProf from '../screens/prof/ProfileProf.js';
import ProHomepage from '../screens/prof/ProHomepage.js';
import recentlyContacted from '../screens/prof/recentlyContacted.js';
import RecoverAccount from '../screens/prof/RecoverAccount.js';
import RegisterConsentPro from '../screens/prof/RegisterConsentPro.js';

import RegisterStep1 from '../screens/prof/RegisterStep1.js';
import RegisterStep2 from '../screens/prof/RegisterStep2.js';
import RegisterStep3 from '../screens/prof/RegisterStep3.js';
import RegisterStep4 from '../screens/prof/RegisterStep4.js';

import ResponseRequest from '../screens/prof/ResponseRequest.js';
import ProfSideScaleResult from '../screens/prof/ScaleResult.js';
import UpdateProfileProf from '../screens/prof/UpdateProfileProf.js';
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
import UserNotifications from '../screens/userNotifications.js';
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

const Stack = createStackNavigator();

const dontShowHeader = () => ({ headerShown: false });

const screenOptions = ({ navigation, route }) => ({
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
        name={'menu'}
        size={35}
        color={'white'}
        style={{ paddingHorizontal: 12 }}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
    );
  },
});

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={screenOptions}>
      <Stack.Screen name="Welcome" component={Welcome} options={dontShowHeader} />

      <Stack.Screen name="Login" component={UserLogin} options={dontShowHeader} />

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
          title: 'Quality Life',
          headerLeft: () => undefined,
        })}
      />

      <Stack.Screen
        name={constants.TEST_PAGE}
        component={CircularQuiz}
        options={() => ({
          title: 'মানসিক স্বাস্থ্য মূল্যায়ন',
          headerLeft: () => undefined,
        })}
      />

      <Stack.Screen name={constants.HOMEPAGE} component={Homepage} />

      <Stack.Screen
        name={constants.PROF_CLIENT_REQUEST}
        component={ClientRequestPro}
        options={({ navigation }) => ({
          title: 'Client Request',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROF_CLIENT_REQUEST]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name={constants.PROF_RESPONSE_CLIENT_REQUEST}
        component={ResponseRequest}
        options={({ navigation, route, ...props }) => ({
          title: 'Client Request',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ClientProfile"
        component={ClientProfile}
        options={({ navigation, route, ...props }) => ({
          title: 'Client Profile',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ClientTestResult"
        component={ClientTestResult}
        options={({ navigation }) => ({
          title: 'Response',
        })}
      />
      <Stack.Screen
        name="ProfSuggestedScale"
        component={ProfSuggestedScale}
        options={({ navigation }) => ({
          title: 'Response',
        })}
      />
      <Stack.Screen
        name="ProfScaleResult"
        component={ProfScaleResult}
        options={({ navigation }) => ({
          title: 'Your Score',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(constants.HOMEPAGE);
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AppointmentStatus"
        component={AppointmentStatus}
        options={({ navigation }) => ({
          title: 'Appointment',
        })}
      />

      <Stack.Screen
        name="ProMyClients"
        component={ProMyClients}
        options={({ navigation, route, ...props }) => ({
          title: 'My Clients',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="ProActivityLog"
        component={ProActivityLog}
        options={({ navigation, route, ...props }) => ({
          title: 'Clinical Documentation Form',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="recentlyContacted"
        component={recentlyContacted}
        options={({ navigation, route, ...props }) => ({
          title: 'Requested Clients',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />

      <Stack.Screen name="Register" component={Register} options={dontShowHeader} />
      <Stack.Screen name="LoginPro" component={LoginPro} options={dontShowHeader} />
      <Stack.Screen name="RecoverAccount" component={RecoverAccount} options={dontShowHeader} />

      <Stack.Screen
        name={constants.PROFESSIONAL_DETAILS}
        component={professionalDetails}
        options={({ navigation }) => ({
          title: 'অ্যাপয়েন্টমেন্ট নিন',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROFESSIONAL_DETAILS]);
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
                navigation.navigate(backScreenMap[constants.USER_APPOINTMENT_TAKEN]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="ProNotification"
        component={ProNotification}
        options={({ navigation, route, ...props }) => ({
          title: 'Notification',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
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
          headerLeft: () => null,
        })}
      />

      <Stack.Screen
        name={constants.PROF_ASSESSMENT_TOOLS}
        component={ProAssessments}
        options={({ navigation }) => ({
          title: 'Assessment tools',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROF_ASSESSMENT_TOOLS]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name={constants.PROF_ASSESSMENT_TOOL_DETAILS}
        component={ProAssessmentDetails}
        options={({ navigation }) => ({
          title: 'Assessment',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROF_ASSESSMENT_TOOL_DETAILS]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name={constants.PROF_PROFILE}
        component={ProfileProf}
        options={({ navigation }) => ({
          title: 'Profile',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROF_PROFILE]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name={constants.PROF_UPDATE_PROFILE}
        component={UpdateProfileProf}
        options={({ navigation }) => ({
          title: 'Update Profile',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(backScreenMap[constants.PROF_UPDATE_PROFILE]);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="ProfSideScaleResult"
        component={ProfSideScaleResult}
        options={({ navigation, route, ...props }) => ({
          title: 'Result',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name={constants.PROF_REGISTER_STEP_2}
        component={RegisterStep2}
        options={() => ({
          title: 'Registration (Part 2)',
          headerLeft: () => undefined,
        })}
      />

      <Stack.Screen
        name={constants.PROF_REGISTER_STEP_3}
        component={RegisterStep3}
        options={() => ({
          title: 'Registration (Part 3)',
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
          title: 'Our Professionals',
        })}
      />
      <Stack.Screen
        name="HomepageScale"
        component={HomepageScale}
        options={({ navigation }) => ({
          title: 'Qlife',
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
        name="QuizResultOutOf100"
        component={QuizResultOutOf100}
        options={({ navigation }) => ({
          title: 'Your Score',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(constants.HOMEPAGE);
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
        name="UserNotifications"
        component={UserNotifications}
        options={({ navigation }) => ({
          title: 'Notifications',
        })}
      />
      <Stack.Screen
        name="Rating"
        component={Rating}
        options={({ navigation }) => ({
          title: 'মানসিক স্বাস্থ্য পরিমাপের অবস্থা',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate('VideoExerciseList');
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="CircularQuizResult"
        component={CircularQuizResult}
        options={({ navigation, route }) => ({
          title: 'ফলাফল',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.navigate(route.params.goToBack);
              }}
            />
          ),
        })}
      />

      <Stack.Screen name="Test" component={Test} />
      <Stack.Screen
        name={constants.PROFILE}
        component={UserProfile}
        options={({ navigation, route }) => ({
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
        name="DrawerGuideline"
        component={DrawerGuideline}
        options={({ navigation }) => ({
          title: 'ব্যবহারিক নির্দেশিকা',
        })}
      />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen
        name="AboutUs"
        component={AboutUs}
        options={() => ({
          title: 'About us',
        })}
      />
      <Stack.Screen
        name="CentralHelpCenter"
        component={CentralHelpCenter}
        options={({ navigation }) => ({
          title: 'Help Center',
        })}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={() => ({
          title: 'Privacy Policy',
        })}
      />
      <Stack.Screen name="AskForTest" component={AskForTest} options={dontShowHeader} />
      <Stack.Screen
        name="ResultHistory"
        component={ResultHistory}
        options={() => ({
          title: 'Result History',
        })}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenter}
        options={({ navigation, route }) => ({
          title: 'Help Center',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                if (route.params.fromProfile === true) {
                  navigation.navigate('Profile');
                } else {
                  navigation.navigate(constants.HOMEPAGE);
                }
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
