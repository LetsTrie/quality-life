import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_bn.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('bn'),
    Locale('en')
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'QLife'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'My profile'**
  String get navProfile;

  /// No description provided for @navScales.
  ///
  /// In en, this message translates to:
  /// **'Self-checks'**
  String get navScales;

  /// No description provided for @navProfessionals.
  ///
  /// In en, this message translates to:
  /// **'Professionals'**
  String get navProfessionals;

  /// No description provided for @navAppointments.
  ///
  /// In en, this message translates to:
  /// **'Appointments'**
  String get navAppointments;

  /// No description provided for @navNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get navNotifications;

  /// No description provided for @navContent.
  ///
  /// In en, this message translates to:
  /// **'Resources'**
  String get navContent;

  /// No description provided for @navMore.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get navMore;

  /// No description provided for @navBecomeProfessional.
  ///
  /// In en, this message translates to:
  /// **'Become a professional'**
  String get navBecomeProfessional;

  /// No description provided for @actionSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get actionSignOut;

  /// No description provided for @actionRetry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get actionRetry;

  /// No description provided for @welcomeHeadline.
  ///
  /// In en, this message translates to:
  /// **'A calmer mind starts here'**
  String get welcomeHeadline;

  /// No description provided for @welcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Private, gentle support for your mental wellbeing — whenever you need it.'**
  String get welcomeSubtitle;

  /// No description provided for @signInTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get signInTitle;

  /// No description provided for @signInContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue securely'**
  String get signInContinue;

  /// No description provided for @authSignInTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get authSignInTitle;

  /// No description provided for @authSignInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue your wellbeing journey'**
  String get authSignInSubtitle;

  /// No description provided for @authSignUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get authSignUpTitle;

  /// No description provided for @authSignUpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'A few details to get you started'**
  String get authSignUpSubtitle;

  /// No description provided for @authRoleQuestion.
  ///
  /// In en, this message translates to:
  /// **'How would you like to continue?'**
  String get authRoleQuestion;

  /// No description provided for @authRoleUser.
  ///
  /// In en, this message translates to:
  /// **'Seeking support'**
  String get authRoleUser;

  /// No description provided for @authRoleUserDesc.
  ///
  /// In en, this message translates to:
  /// **'For your own wellbeing'**
  String get authRoleUserDesc;

  /// No description provided for @authRoleProfessional.
  ///
  /// In en, this message translates to:
  /// **'I\'m a professional'**
  String get authRoleProfessional;

  /// No description provided for @authRoleProfessionalDesc.
  ///
  /// In en, this message translates to:
  /// **'Offer care to clients'**
  String get authRoleProfessionalDesc;

  /// No description provided for @authEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmail;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authConfirmPassword;

  /// No description provided for @authPasswordHint.
  ///
  /// In en, this message translates to:
  /// **'At least 6 characters'**
  String get authPasswordHint;

  /// No description provided for @authSignInAction.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authSignInAction;

  /// No description provided for @authSignUpAction.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authSignUpAction;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authForgotPassword;

  /// No description provided for @authNoAccount.
  ///
  /// In en, this message translates to:
  /// **'New here? Create an account'**
  String get authNoAccount;

  /// No description provided for @authHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get authHaveAccount;

  /// No description provided for @authProfessionalSignInTitle.
  ///
  /// In en, this message translates to:
  /// **'Professional sign in'**
  String get authProfessionalSignInTitle;

  /// No description provided for @authProfessionalSignUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Professional registration'**
  String get authProfessionalSignUpTitle;

  /// No description provided for @authSignInAsProfessional.
  ///
  /// In en, this message translates to:
  /// **'Sign in as a professional'**
  String get authSignInAsProfessional;

  /// No description provided for @authSignInAsUser.
  ///
  /// In en, this message translates to:
  /// **'Sign in as a user'**
  String get authSignInAsUser;

  /// No description provided for @authSignUpAsProfessional.
  ///
  /// In en, this message translates to:
  /// **'Register as a professional'**
  String get authSignUpAsProfessional;

  /// No description provided for @authSignUpAsUser.
  ///
  /// In en, this message translates to:
  /// **'Register as a user'**
  String get authSignUpAsUser;

  /// No description provided for @authVerifyTitle.
  ///
  /// In en, this message translates to:
  /// **'Verify your email'**
  String get authVerifyTitle;

  /// No description provided for @authVerifySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter the code we sent to {email}. Check your spam or junk folder if you don\'t see it.'**
  String authVerifySubtitle(String email);

  /// No description provided for @authVerifyCode.
  ///
  /// In en, this message translates to:
  /// **'Verification code'**
  String get authVerifyCode;

  /// No description provided for @authVerifyAction.
  ///
  /// In en, this message translates to:
  /// **'Verify & continue'**
  String get authVerifyAction;

  /// No description provided for @authResendCode.
  ///
  /// In en, this message translates to:
  /// **'Resend code'**
  String get authResendCode;

  /// No description provided for @authCodeResent.
  ///
  /// In en, this message translates to:
  /// **'A new code is on its way'**
  String get authCodeResent;

  /// No description provided for @authForgotTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset your password'**
  String get authForgotTitle;

  /// No description provided for @authForgotSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter your email and we\'ll send you a reset code'**
  String get authForgotSubtitle;

  /// No description provided for @authSendCode.
  ///
  /// In en, this message translates to:
  /// **'Send reset code'**
  String get authSendCode;

  /// No description provided for @authNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get authNewPassword;

  /// No description provided for @authResetAction.
  ///
  /// In en, this message translates to:
  /// **'Reset password'**
  String get authResetAction;

  /// No description provided for @authResetDone.
  ///
  /// In en, this message translates to:
  /// **'Password updated. Please sign in.'**
  String get authResetDone;

  /// No description provided for @authBackToSignIn.
  ///
  /// In en, this message translates to:
  /// **'Back to sign in'**
  String get authBackToSignIn;

  /// No description provided for @authErrEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your email'**
  String get authErrEmailRequired;

  /// No description provided for @authErrEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address'**
  String get authErrEmailInvalid;

  /// No description provided for @authErrPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your password'**
  String get authErrPasswordRequired;

  /// No description provided for @authErrPasswordShort.
  ///
  /// In en, this message translates to:
  /// **'Use at least 6 characters'**
  String get authErrPasswordShort;

  /// No description provided for @authErrPasswordsMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords don\'t match'**
  String get authErrPasswordsMismatch;

  /// No description provided for @authErrCodeRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter the verification code'**
  String get authErrCodeRequired;

  /// No description provided for @authErrGeneric.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get authErrGeneric;

  /// No description provided for @homeWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get homeWelcome;

  /// No description provided for @homeGreeting.
  ///
  /// In en, this message translates to:
  /// **'How are you feeling today?'**
  String get homeGreeting;

  /// No description provided for @homeTagline.
  ///
  /// In en, this message translates to:
  /// **'Take a quiet moment for yourself.'**
  String get homeTagline;

  /// No description provided for @sectionQuickActions.
  ///
  /// In en, this message translates to:
  /// **'Quick actions'**
  String get sectionQuickActions;

  /// No description provided for @homeTipTitle.
  ///
  /// In en, this message translates to:
  /// **'A gentle reminder'**
  String get homeTipTitle;

  /// No description provided for @homeTip1.
  ///
  /// In en, this message translates to:
  /// **'Take three slow breaths before your next task — it helps settle the mind.'**
  String get homeTip1;

  /// No description provided for @homeTip2.
  ///
  /// In en, this message translates to:
  /// **'Naming a feeling makes it easier to hold. What are you feeling right now?'**
  String get homeTip2;

  /// No description provided for @homeTip3.
  ///
  /// In en, this message translates to:
  /// **'Small steps count. One kind act toward yourself today is enough.'**
  String get homeTip3;

  /// No description provided for @homeTip4.
  ///
  /// In en, this message translates to:
  /// **'Rest is productive too. Give yourself permission to pause.'**
  String get homeTip4;

  /// No description provided for @proTipTitle.
  ///
  /// In en, this message translates to:
  /// **'Today\'s focus'**
  String get proTipTitle;

  /// No description provided for @proTip1.
  ///
  /// In en, this message translates to:
  /// **'Reply to pending requests early — a timely response reassures clients.'**
  String get proTip1;

  /// No description provided for @proTip2.
  ///
  /// In en, this message translates to:
  /// **'A short check-in between sessions can help a client feel supported.'**
  String get proTip2;

  /// No description provided for @proTip3.
  ///
  /// In en, this message translates to:
  /// **'Assign a follow-up self-check to track a client\'s progress over time.'**
  String get proTip3;

  /// No description provided for @sectionExplore.
  ///
  /// In en, this message translates to:
  /// **'Explore'**
  String get sectionExplore;

  /// No description provided for @accountTitle.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get accountTitle;

  /// No description provided for @settingsLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsLanguage;

  /// No description provided for @navScalesDesc.
  ///
  /// In en, this message translates to:
  /// **'A short, private check-in on how you\'re doing'**
  String get navScalesDesc;

  /// No description provided for @navProfessionalsDesc.
  ///
  /// In en, this message translates to:
  /// **'Find a counselor or psychologist'**
  String get navProfessionalsDesc;

  /// No description provided for @navAppointmentsDesc.
  ///
  /// In en, this message translates to:
  /// **'View and manage your sessions'**
  String get navAppointmentsDesc;

  /// No description provided for @navContentDesc.
  ///
  /// In en, this message translates to:
  /// **'Articles and videos for your wellbeing'**
  String get navContentDesc;

  /// No description provided for @navProfileDesc.
  ///
  /// In en, this message translates to:
  /// **'Update your personal details'**
  String get navProfileDesc;

  /// No description provided for @navBecomeProfessionalDesc.
  ///
  /// In en, this message translates to:
  /// **'Offer care to others on QLife'**
  String get navBecomeProfessionalDesc;

  /// No description provided for @navNotificationsDesc.
  ///
  /// In en, this message translates to:
  /// **'Stay up to date'**
  String get navNotificationsDesc;

  /// No description provided for @professionalTitle.
  ///
  /// In en, this message translates to:
  /// **'Professional'**
  String get professionalTitle;

  /// No description provided for @proDashTitle.
  ///
  /// In en, this message translates to:
  /// **'Your practice'**
  String get proDashTitle;

  /// No description provided for @proDashGreeting.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get proDashGreeting;

  /// No description provided for @proAppointmentRequests.
  ///
  /// In en, this message translates to:
  /// **'Appointment requests'**
  String get proAppointmentRequests;

  /// No description provided for @proAppointmentRequestsDesc.
  ///
  /// In en, this message translates to:
  /// **'Review and respond to new requests'**
  String get proAppointmentRequestsDesc;

  /// No description provided for @proMyClients.
  ///
  /// In en, this message translates to:
  /// **'My clients'**
  String get proMyClients;

  /// No description provided for @proMyClientsDesc.
  ///
  /// In en, this message translates to:
  /// **'See the people in your care'**
  String get proMyClientsDesc;

  /// No description provided for @actionCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get actionCancel;

  /// No description provided for @actionSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get actionSubmit;

  /// No description provided for @actionSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting…'**
  String get actionSubmitting;

  /// No description provided for @actionContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get actionContinue;

  /// No description provided for @actionConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get actionConfirm;

  /// No description provided for @actionAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get actionAccept;

  /// No description provided for @actionDecline.
  ///
  /// In en, this message translates to:
  /// **'Decline'**
  String get actionDecline;

  /// No description provided for @actionMarkSeen.
  ///
  /// In en, this message translates to:
  /// **'Mark seen'**
  String get actionMarkSeen;

  /// No description provided for @actionProposeReschedule.
  ///
  /// In en, this message translates to:
  /// **'Propose reschedule'**
  String get actionProposeReschedule;

  /// No description provided for @actionSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving…'**
  String get actionSaving;

  /// No description provided for @errLoadAppointments.
  ///
  /// In en, this message translates to:
  /// **'Could not load appointments. Please try again.'**
  String get errLoadAppointments;

  /// No description provided for @errLoadAppointmentDetail.
  ///
  /// In en, this message translates to:
  /// **'Could not load appointment details. Please go back and try again.'**
  String get errLoadAppointmentDetail;

  /// No description provided for @errLoadClients.
  ///
  /// In en, this message translates to:
  /// **'Could not load clients. Please try again.'**
  String get errLoadClients;

  /// No description provided for @errLoadClientDetail.
  ///
  /// In en, this message translates to:
  /// **'Could not load client details. Please go back and try again.'**
  String get errLoadClientDetail;

  /// No description provided for @errLoadContent.
  ///
  /// In en, this message translates to:
  /// **'Could not load resources. Please try again.'**
  String get errLoadContent;

  /// No description provided for @errLoadNotifications.
  ///
  /// In en, this message translates to:
  /// **'Could not load notifications. Please try again.'**
  String get errLoadNotifications;

  /// No description provided for @errLoadProfessionals.
  ///
  /// In en, this message translates to:
  /// **'Could not load professionals. Please try again.'**
  String get errLoadProfessionals;

  /// No description provided for @errLoadScales.
  ///
  /// In en, this message translates to:
  /// **'Could not load self-checks. Please try again.'**
  String get errLoadScales;

  /// No description provided for @errLoadScalesRefresh.
  ///
  /// In en, this message translates to:
  /// **'Could not load self-checks. Please refresh.'**
  String get errLoadScalesRefresh;

  /// No description provided for @errLoadScaleDetail.
  ///
  /// In en, this message translates to:
  /// **'Could not load this self-check. Please go back and try again.'**
  String get errLoadScaleDetail;

  /// No description provided for @errLoadUpazilas.
  ///
  /// In en, this message translates to:
  /// **'Could not load upazilas. Please try again.'**
  String get errLoadUpazilas;

  /// No description provided for @errLoadUnions.
  ///
  /// In en, this message translates to:
  /// **'Could not load unions. Please try again.'**
  String get errLoadUnions;

  /// No description provided for @errLoadProfile.
  ///
  /// In en, this message translates to:
  /// **'Could not load profile. Please try again.'**
  String get errLoadProfile;

  /// No description provided for @emptyAppointments.
  ///
  /// In en, this message translates to:
  /// **'No appointments yet'**
  String get emptyAppointments;

  /// No description provided for @emptyClients.
  ///
  /// In en, this message translates to:
  /// **'No clients yet'**
  String get emptyClients;

  /// No description provided for @emptyContent.
  ///
  /// In en, this message translates to:
  /// **'No resources available yet'**
  String get emptyContent;

  /// No description provided for @emptyProfessionals.
  ///
  /// In en, this message translates to:
  /// **'No professionals available'**
  String get emptyProfessionals;

  /// No description provided for @emptyProfessionalsHint.
  ///
  /// In en, this message translates to:
  /// **'If you just approved a professional, they may still need to finish onboarding, enable visibility, and turn on “Accepting clients”. Pull to refresh, or try again in a moment.'**
  String get emptyProfessionalsHint;

  /// No description provided for @emptyScales.
  ///
  /// In en, this message translates to:
  /// **'No self-checks available yet'**
  String get emptyScales;

  /// No description provided for @emptyNotifications.
  ///
  /// In en, this message translates to:
  /// **'You\'re all caught up'**
  String get emptyNotifications;

  /// No description provided for @appointmentTitle.
  ///
  /// In en, this message translates to:
  /// **'Appointment'**
  String get appointmentTitle;

  /// No description provided for @fieldStatus.
  ///
  /// In en, this message translates to:
  /// **'Status: {value}'**
  String fieldStatus(Object value);

  /// No description provided for @fieldRequested.
  ///
  /// In en, this message translates to:
  /// **'Requested: {value}'**
  String fieldRequested(Object value);

  /// No description provided for @fieldScheduled.
  ///
  /// In en, this message translates to:
  /// **'Scheduled: {value}'**
  String fieldScheduled(Object value);

  /// No description provided for @fieldMeetingLinkValue.
  ///
  /// In en, this message translates to:
  /// **'Meeting link: {value}'**
  String fieldMeetingLinkValue(Object value);

  /// No description provided for @fieldClientMessage.
  ///
  /// In en, this message translates to:
  /// **'Client message: {value}'**
  String fieldClientMessage(Object value);

  /// No description provided for @fieldProfessionalMessage.
  ///
  /// In en, this message translates to:
  /// **'Professional message: {value}'**
  String fieldProfessionalMessage(Object value);

  /// No description provided for @valueDash.
  ///
  /// In en, this message translates to:
  /// **'—'**
  String get valueDash;

  /// No description provided for @apptRequested.
  ///
  /// In en, this message translates to:
  /// **'Appointment requested'**
  String get apptRequested;

  /// No description provided for @apptActionFailed.
  ///
  /// In en, this message translates to:
  /// **'Action failed. Please try again.'**
  String get apptActionFailed;

  /// No description provided for @apptMarkSeenFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to mark as seen. Please try again.'**
  String get apptMarkSeenFailed;

  /// No description provided for @fieldMeetingLinkInput.
  ///
  /// In en, this message translates to:
  /// **'Meeting link / address (optional)'**
  String get fieldMeetingLinkInput;

  /// No description provided for @fieldMessageOptional.
  ///
  /// In en, this message translates to:
  /// **'Message (optional)'**
  String get fieldMessageOptional;

  /// No description provided for @requestAppointmentWith.
  ///
  /// In en, this message translates to:
  /// **'Request appointment with {name}'**
  String requestAppointmentWith(Object name);

  /// No description provided for @selectDate.
  ///
  /// In en, this message translates to:
  /// **'Select date'**
  String get selectDate;

  /// No description provided for @selectTime.
  ///
  /// In en, this message translates to:
  /// **'Select time'**
  String get selectTime;

  /// No description provided for @selectDateTimeError.
  ///
  /// In en, this message translates to:
  /// **'Please select a date and time.'**
  String get selectDateTimeError;

  /// No description provided for @requestAppointmentFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to request appointment. Please try again.'**
  String get requestAppointmentFailed;

  /// No description provided for @contentTitle.
  ///
  /// In en, this message translates to:
  /// **'Resources'**
  String get contentTitle;

  /// No description provided for @rateThisContent.
  ///
  /// In en, this message translates to:
  /// **'Rate this resource'**
  String get rateThisContent;

  /// No description provided for @commentOptional.
  ///
  /// In en, this message translates to:
  /// **'Comment (optional)'**
  String get commentOptional;

  /// No description provided for @ratingSubmitFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit rating. Please try again.'**
  String get ratingSubmitFailed;

  /// No description provided for @watchTrackingNote.
  ///
  /// In en, this message translates to:
  /// **'We\'ll mark this as watched once you reach the end.'**
  String get watchTrackingNote;

  /// No description provided for @watchCompleted.
  ///
  /// In en, this message translates to:
  /// **'Watched — nicely done.'**
  String get watchCompleted;

  /// No description provided for @ratedStars.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{Rated 1 star} other{Rated {count} stars}}'**
  String ratedStars(int count);

  /// No description provided for @clientsTitle.
  ///
  /// In en, this message translates to:
  /// **'Clients'**
  String get clientsTitle;

  /// No description provided for @clientTitle.
  ///
  /// In en, this message translates to:
  /// **'Client'**
  String get clientTitle;

  /// No description provided for @assignMultipleScales.
  ///
  /// In en, this message translates to:
  /// **'Assign self-checks'**
  String get assignMultipleScales;

  /// No description provided for @assignSelected.
  ///
  /// In en, this message translates to:
  /// **'Assign selected'**
  String get assignSelected;

  /// No description provided for @assigning.
  ///
  /// In en, this message translates to:
  /// **'Assigning…'**
  String get assigning;

  /// No description provided for @assignedScales.
  ///
  /// In en, this message translates to:
  /// **'Assigned self-checks'**
  String get assignedScales;

  /// No description provided for @selectAtLeastOneScale.
  ///
  /// In en, this message translates to:
  /// **'Select at least one self-check'**
  String get selectAtLeastOneScale;

  /// No description provided for @assignFailed.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t assign self-checks. Please try again.'**
  String get assignFailed;

  /// No description provided for @assignedTitle.
  ///
  /// In en, this message translates to:
  /// **'Assigned to you'**
  String get assignedTitle;

  /// No description provided for @assignedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Self-checks your professional asked you to complete'**
  String get assignedSubtitle;

  /// No description provided for @assignedHomeDesc.
  ///
  /// In en, this message translates to:
  /// **'Self-checks from your professional'**
  String get assignedHomeDesc;

  /// No description provided for @assignedByProfessional.
  ///
  /// In en, this message translates to:
  /// **'Assigned by your professional'**
  String get assignedByProfessional;

  /// No description provided for @assignedEmpty.
  ///
  /// In en, this message translates to:
  /// **'Nothing assigned right now'**
  String get assignedEmpty;

  /// No description provided for @errLoadAssigned.
  ///
  /// In en, this message translates to:
  /// **'Could not load assigned self-checks. Please try again.'**
  String get errLoadAssigned;

  /// No description provided for @notificationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsTitle;

  /// No description provided for @markReadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not mark as read. Please try again.'**
  String get markReadFailed;

  /// No description provided for @statusUnread.
  ///
  /// In en, this message translates to:
  /// **'Unread'**
  String get statusUnread;

  /// No description provided for @statusRead.
  ///
  /// In en, this message translates to:
  /// **'Read'**
  String get statusRead;

  /// No description provided for @scalesTitle.
  ///
  /// In en, this message translates to:
  /// **'Self-checks'**
  String get scalesTitle;

  /// No description provided for @assessmentIntro.
  ///
  /// In en, this message translates to:
  /// **'Take your time. There are no right or wrong answers — just answer honestly.'**
  String get assessmentIntro;

  /// No description provided for @resultTitle.
  ///
  /// In en, this message translates to:
  /// **'Your result'**
  String get resultTitle;

  /// No description provided for @resultIntro.
  ///
  /// In en, this message translates to:
  /// **'This is a guide to reflect on, not a diagnosis. Consider sharing it with a professional.'**
  String get resultIntro;

  /// No description provided for @resultLabel.
  ///
  /// In en, this message translates to:
  /// **'Result'**
  String get resultLabel;

  /// No description provided for @severityLabel.
  ///
  /// In en, this message translates to:
  /// **'Severity: {value}'**
  String severityLabel(Object value);

  /// No description provided for @scoreLabel.
  ///
  /// In en, this message translates to:
  /// **'Score: {value}'**
  String scoreLabel(Object value);

  /// No description provided for @recommendationLabel.
  ///
  /// In en, this message translates to:
  /// **'Recommendation: {value}'**
  String recommendationLabel(Object value);

  /// No description provided for @submissionFailed.
  ///
  /// In en, this message translates to:
  /// **'Submission failed. Please try again.'**
  String get submissionFailed;

  /// No description provided for @followUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Your next step'**
  String get followUpTitle;

  /// No description provided for @followUpWatchResource.
  ///
  /// In en, this message translates to:
  /// **'View the recommended resource'**
  String get followUpWatchResource;

  /// No description provided for @followUpExploreResources.
  ///
  /// In en, this message translates to:
  /// **'Explore resources'**
  String get followUpExploreResources;

  /// No description provided for @followUpTalkToProfessional.
  ///
  /// In en, this message translates to:
  /// **'Talk to a professional'**
  String get followUpTalkToProfessional;

  /// No description provided for @followUpHelpCenter.
  ///
  /// In en, this message translates to:
  /// **'Get support now'**
  String get followUpHelpCenter;

  /// No description provided for @followUpReassurance.
  ///
  /// In en, this message translates to:
  /// **'This is a snapshot, not a diagnosis. Support is here whenever you need it.'**
  String get followUpReassurance;

  /// No description provided for @helpCenterTitle.
  ///
  /// In en, this message translates to:
  /// **'You\'re not alone'**
  String get helpCenterTitle;

  /// No description provided for @helpCenterSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Support is available'**
  String get helpCenterSubtitle;

  /// No description provided for @helpCenterBody.
  ///
  /// In en, this message translates to:
  /// **'If your feelings are becoming hard to manage, reaching out can help. You can talk to a mental health professional through QLife, or confide in someone you trust.'**
  String get helpCenterBody;

  /// No description provided for @helpCenterUrgentTitle.
  ///
  /// In en, this message translates to:
  /// **'If you\'re in immediate danger'**
  String get helpCenterUrgentTitle;

  /// No description provided for @helpCenterUrgentBody.
  ///
  /// In en, this message translates to:
  /// **'If you are thinking about harming yourself, please reach out right away — contact your local emergency services or someone you trust. You deserve support.'**
  String get helpCenterUrgentBody;

  /// No description provided for @helpCenterFindProfessional.
  ///
  /// In en, this message translates to:
  /// **'Find a professional'**
  String get helpCenterFindProfessional;

  /// No description provided for @helpCenterExploreResources.
  ///
  /// In en, this message translates to:
  /// **'Calming resources'**
  String get helpCenterExploreResources;

  /// No description provided for @helpCenterHotlinesTitle.
  ///
  /// In en, this message translates to:
  /// **'Crisis helplines'**
  String get helpCenterHotlinesTitle;

  /// No description provided for @helpCenterTollFree.
  ///
  /// In en, this message translates to:
  /// **'Toll-free'**
  String get helpCenterTollFree;

  /// No description provided for @helpCenterCallError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t open the dialer. Please try again.'**
  String get helpCenterCallError;

  /// No description provided for @becomeProfessionalTitle.
  ///
  /// In en, this message translates to:
  /// **'Become a professional'**
  String get becomeProfessionalTitle;

  /// No description provided for @fieldFullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get fieldFullName;

  /// No description provided for @fieldProfessionType.
  ///
  /// In en, this message translates to:
  /// **'Profession type'**
  String get fieldProfessionType;

  /// No description provided for @fieldGenderOptional.
  ///
  /// In en, this message translates to:
  /// **'Gender (optional)'**
  String get fieldGenderOptional;

  /// No description provided for @fieldDesignationOptional.
  ///
  /// In en, this message translates to:
  /// **'Designation (optional)'**
  String get fieldDesignationOptional;

  /// No description provided for @fieldPhoneOptional.
  ///
  /// In en, this message translates to:
  /// **'Phone (optional)'**
  String get fieldPhoneOptional;

  /// No description provided for @selectProfessionType.
  ///
  /// In en, this message translates to:
  /// **'Please select a profession type.'**
  String get selectProfessionType;

  /// No description provided for @registeredAsProfessional.
  ///
  /// In en, this message translates to:
  /// **'Registered as professional'**
  String get registeredAsProfessional;

  /// No description provided for @registrationFailed.
  ///
  /// In en, this message translates to:
  /// **'Registration failed. Please try again.'**
  String get registrationFailed;

  /// No description provided for @nameRequired.
  ///
  /// In en, this message translates to:
  /// **'Name required'**
  String get nameRequired;

  /// No description provided for @professionClinicalPsychologist.
  ///
  /// In en, this message translates to:
  /// **'Clinical psychologist'**
  String get professionClinicalPsychologist;

  /// No description provided for @professionAssistantClinicalPsychologist.
  ///
  /// In en, this message translates to:
  /// **'Assistant clinical psychologist'**
  String get professionAssistantClinicalPsychologist;

  /// No description provided for @professionPsychiatrist.
  ///
  /// In en, this message translates to:
  /// **'Psychiatrist'**
  String get professionPsychiatrist;

  /// No description provided for @professionCounselor.
  ///
  /// In en, this message translates to:
  /// **'Counselor'**
  String get professionCounselor;

  /// No description provided for @professionOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get professionOther;

  /// No description provided for @genderMale.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get genderMale;

  /// No description provided for @genderFemale.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get genderFemale;

  /// No description provided for @genderOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get genderOther;

  /// No description provided for @genderUndisclosed.
  ///
  /// In en, this message translates to:
  /// **'Prefer not to say'**
  String get genderUndisclosed;

  /// No description provided for @maritalSingle.
  ///
  /// In en, this message translates to:
  /// **'Single'**
  String get maritalSingle;

  /// No description provided for @maritalMarried.
  ///
  /// In en, this message translates to:
  /// **'Married'**
  String get maritalMarried;

  /// No description provided for @maritalDivorced.
  ///
  /// In en, this message translates to:
  /// **'Divorced'**
  String get maritalDivorced;

  /// No description provided for @maritalWidowed.
  ///
  /// In en, this message translates to:
  /// **'Widowed'**
  String get maritalWidowed;

  /// No description provided for @maritalSeparated.
  ///
  /// In en, this message translates to:
  /// **'Separated'**
  String get maritalSeparated;

  /// No description provided for @maritalUndisclosed.
  ///
  /// In en, this message translates to:
  /// **'Prefer not to say'**
  String get maritalUndisclosed;

  /// No description provided for @completeProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'Complete profile'**
  String get completeProfileTitle;

  /// No description provided for @completeProfileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'This helps us tailor your experience. Your details stay private.'**
  String get completeProfileSubtitle;

  /// No description provided for @fieldName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get fieldName;

  /// No description provided for @fieldDateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get fieldDateOfBirth;

  /// No description provided for @fieldAgeYears.
  ///
  /// In en, this message translates to:
  /// **'Age (years)'**
  String get fieldAgeYears;

  /// No description provided for @fieldGender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get fieldGender;

  /// No description provided for @fieldMaritalStatus.
  ///
  /// In en, this message translates to:
  /// **'Marital status'**
  String get fieldMaritalStatus;

  /// No description provided for @fieldDistrict.
  ///
  /// In en, this message translates to:
  /// **'District'**
  String get fieldDistrict;

  /// No description provided for @fieldUpazilaOptional.
  ///
  /// In en, this message translates to:
  /// **'Upazila (optional)'**
  String get fieldUpazilaOptional;

  /// No description provided for @fieldUnionOptional.
  ///
  /// In en, this message translates to:
  /// **'Union (optional)'**
  String get fieldUnionOptional;

  /// No description provided for @selectGenderMaritalDistrict.
  ///
  /// In en, this message translates to:
  /// **'Please select gender, marital status, and district.'**
  String get selectGenderMaritalDistrict;

  /// No description provided for @profileSaved.
  ///
  /// In en, this message translates to:
  /// **'Profile saved'**
  String get profileSaved;

  /// No description provided for @profileSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to save profile. Please try again.'**
  String get profileSaveFailed;

  /// No description provided for @saveAndContinue.
  ///
  /// In en, this message translates to:
  /// **'Save & continue'**
  String get saveAndContinue;

  /// No description provided for @ageRequired.
  ///
  /// In en, this message translates to:
  /// **'Valid age required'**
  String get ageRequired;

  /// No description provided for @ageRange.
  ///
  /// In en, this message translates to:
  /// **'Age must be 5–150'**
  String get ageRange;

  /// No description provided for @dobRequired.
  ///
  /// In en, this message translates to:
  /// **'Date of birth required'**
  String get dobRequired;

  /// No description provided for @dobRange.
  ///
  /// In en, this message translates to:
  /// **'Age must be 5–150'**
  String get dobRange;

  /// No description provided for @labelAgeYears.
  ///
  /// In en, this message translates to:
  /// **'Age: {years} years'**
  String labelAgeYears(int years);

  /// No description provided for @proOnboardingTitle.
  ///
  /// In en, this message translates to:
  /// **'Set up your profile'**
  String get proOnboardingTitle;

  /// No description provided for @proOnboardingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tell clients a little about your practice.'**
  String get proOnboardingSubtitle;

  /// No description provided for @fieldWorkplaceOptional.
  ///
  /// In en, this message translates to:
  /// **'Workplace (optional)'**
  String get fieldWorkplaceOptional;

  /// No description provided for @fieldYearsOptional.
  ///
  /// In en, this message translates to:
  /// **'Years of experience (optional)'**
  String get fieldYearsOptional;

  /// No description provided for @fieldBioOptional.
  ///
  /// In en, this message translates to:
  /// **'About you (optional)'**
  String get fieldBioOptional;

  /// No description provided for @acceptingNewClients.
  ///
  /// In en, this message translates to:
  /// **'Accepting new clients'**
  String get acceptingNewClients;

  /// No description provided for @showInDirectory.
  ///
  /// In en, this message translates to:
  /// **'Let clients find me'**
  String get showInDirectory;

  /// No description provided for @visibleAfterApproval.
  ///
  /// In en, this message translates to:
  /// **'Visible only after admin approval'**
  String get visibleAfterApproval;

  /// No description provided for @finishOnboarding.
  ///
  /// In en, this message translates to:
  /// **'Finish setup'**
  String get finishOnboarding;

  /// No description provided for @onboardingCompleted.
  ///
  /// In en, this message translates to:
  /// **'You\'re all set'**
  String get onboardingCompleted;

  /// No description provided for @onboardingSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to save. Please try again.'**
  String get onboardingSaveFailed;

  /// No description provided for @verificationStatus.
  ///
  /// In en, this message translates to:
  /// **'Verification: {status}'**
  String verificationStatus(Object status);

  /// No description provided for @nonNegativeInteger.
  ///
  /// In en, this message translates to:
  /// **'Enter a non-negative integer'**
  String get nonNegativeInteger;

  /// No description provided for @onboardingRequiredHint.
  ///
  /// In en, this message translates to:
  /// **'Complete the required fields (marked *) before finishing.'**
  String get onboardingRequiredHint;

  /// No description provided for @sectionCredentials.
  ///
  /// In en, this message translates to:
  /// **'Credentials'**
  String get sectionCredentials;

  /// No description provided for @sectionPractice.
  ///
  /// In en, this message translates to:
  /// **'Your practice'**
  String get sectionPractice;

  /// No description provided for @sectionFees.
  ///
  /// In en, this message translates to:
  /// **'Consultation fee'**
  String get sectionFees;

  /// No description provided for @sectionLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get sectionLocation;

  /// No description provided for @sectionSpecializations.
  ///
  /// In en, this message translates to:
  /// **'Specializations'**
  String get sectionSpecializations;

  /// No description provided for @sectionAvailability.
  ///
  /// In en, this message translates to:
  /// **'Weekly availability'**
  String get sectionAvailability;

  /// No description provided for @sectionCaseload.
  ///
  /// In en, this message translates to:
  /// **'Current caseload (optional)'**
  String get sectionCaseload;

  /// No description provided for @sectionVisibility.
  ///
  /// In en, this message translates to:
  /// **'Visibility'**
  String get sectionVisibility;

  /// No description provided for @fieldBmdcOptional.
  ///
  /// In en, this message translates to:
  /// **'BMDC registration no. (optional)'**
  String get fieldBmdcOptional;

  /// No description provided for @fieldGraduationBatchOptional.
  ///
  /// In en, this message translates to:
  /// **'Graduation batch (optional)'**
  String get fieldGraduationBatchOptional;

  /// No description provided for @fieldEducation.
  ///
  /// In en, this message translates to:
  /// **'Education & qualifications *'**
  String get fieldEducation;

  /// No description provided for @fieldFeeAmount.
  ///
  /// In en, this message translates to:
  /// **'Fee amount (BDT) *'**
  String get fieldFeeAmount;

  /// No description provided for @fieldMaxWeeklyClients.
  ///
  /// In en, this message translates to:
  /// **'Max clients per week (optional)'**
  String get fieldMaxWeeklyClients;

  /// No description provided for @fieldAvgWeeklyClients.
  ///
  /// In en, this message translates to:
  /// **'Average clients per week now (optional)'**
  String get fieldAvgWeeklyClients;

  /// No description provided for @fieldOtherSpecialization.
  ///
  /// In en, this message translates to:
  /// **'Other specialization (please specify)'**
  String get fieldOtherSpecialization;

  /// No description provided for @fieldCaseloadLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get fieldCaseloadLocation;

  /// No description provided for @fieldCaseloadCount.
  ///
  /// In en, this message translates to:
  /// **'Clients'**
  String get fieldCaseloadCount;

  /// No description provided for @fieldWeekday.
  ///
  /// In en, this message translates to:
  /// **'Day'**
  String get fieldWeekday;

  /// No description provided for @fieldStartTime.
  ///
  /// In en, this message translates to:
  /// **'From'**
  String get fieldStartTime;

  /// No description provided for @fieldEndTime.
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get fieldEndTime;

  /// No description provided for @addAvailabilityWindow.
  ///
  /// In en, this message translates to:
  /// **'Add time slot'**
  String get addAvailabilityWindow;

  /// No description provided for @addCaseloadRow.
  ///
  /// In en, this message translates to:
  /// **'Add location'**
  String get addCaseloadRow;

  /// No description provided for @specializationsRequiredHint.
  ///
  /// In en, this message translates to:
  /// **'Select at least one *'**
  String get specializationsRequiredHint;

  /// No description provided for @feeRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid consultation fee'**
  String get feeRequired;

  /// No description provided for @educationRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your education & qualifications'**
  String get educationRequired;

  /// No description provided for @selectAtLeastOneSpecialization.
  ///
  /// In en, this message translates to:
  /// **'Select at least one specialization'**
  String get selectAtLeastOneSpecialization;

  /// No description provided for @addAtLeastOneAvailability.
  ///
  /// In en, this message translates to:
  /// **'Add at least one availability window'**
  String get addAtLeastOneAvailability;

  /// No description provided for @availabilityStartBeforeEnd.
  ///
  /// In en, this message translates to:
  /// **'Each slot\'s start time must be before its end time'**
  String get availabilityStartBeforeEnd;

  /// No description provided for @otherSpecializationRequired.
  ///
  /// In en, this message translates to:
  /// **'Please specify your other specialization'**
  String get otherSpecializationRequired;

  /// No description provided for @weekdaySunday.
  ///
  /// In en, this message translates to:
  /// **'Sunday'**
  String get weekdaySunday;

  /// No description provided for @weekdayMonday.
  ///
  /// In en, this message translates to:
  /// **'Monday'**
  String get weekdayMonday;

  /// No description provided for @weekdayTuesday.
  ///
  /// In en, this message translates to:
  /// **'Tuesday'**
  String get weekdayTuesday;

  /// No description provided for @weekdayWednesday.
  ///
  /// In en, this message translates to:
  /// **'Wednesday'**
  String get weekdayWednesday;

  /// No description provided for @weekdayThursday.
  ///
  /// In en, this message translates to:
  /// **'Thursday'**
  String get weekdayThursday;

  /// No description provided for @weekdayFriday.
  ///
  /// In en, this message translates to:
  /// **'Friday'**
  String get weekdayFriday;

  /// No description provided for @weekdaySaturday.
  ///
  /// In en, this message translates to:
  /// **'Saturday'**
  String get weekdaySaturday;

  /// No description provided for @consentTitle.
  ///
  /// In en, this message translates to:
  /// **'Before you begin'**
  String get consentTitle;

  /// No description provided for @consentSubtitle.
  ///
  /// In en, this message translates to:
  /// **'How we handle your information'**
  String get consentSubtitle;

  /// No description provided for @consentBody.
  ///
  /// In en, this message translates to:
  /// **'QLife helps you understand your mental wellbeing through validated self-checks and connects you with qualified professionals. Your responses are private and are used only to give you relevant guidance and, when you choose, to share with a professional you connect with. The self-checks are for screening and support — they are not a medical diagnosis. By continuing you agree to our handling of your information for these purposes.'**
  String get consentBody;

  /// No description provided for @consentAgree.
  ///
  /// In en, this message translates to:
  /// **'I understand and agree'**
  String get consentAgree;

  /// No description provided for @consentMustAgree.
  ///
  /// In en, this message translates to:
  /// **'Please accept to continue'**
  String get consentMustAgree;

  /// No description provided for @consentSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not save your consent. Please try again.'**
  String get consentSaveFailed;

  /// No description provided for @fieldReferralSource.
  ///
  /// In en, this message translates to:
  /// **'Referral source (optional)'**
  String get fieldReferralSource;

  /// No description provided for @fieldYearsRequired.
  ///
  /// In en, this message translates to:
  /// **'Years of experience *'**
  String get fieldYearsRequired;

  /// No description provided for @fieldPhoneRequired.
  ///
  /// In en, this message translates to:
  /// **'Phone *'**
  String get fieldPhoneRequired;

  /// No description provided for @fieldMaxWeeklyClientsRequired.
  ///
  /// In en, this message translates to:
  /// **'Max clients per week *'**
  String get fieldMaxWeeklyClientsRequired;

  /// No description provided for @fieldAvgWeeklyClientsRequired.
  ///
  /// In en, this message translates to:
  /// **'Average clients per week now *'**
  String get fieldAvgWeeklyClientsRequired;

  /// No description provided for @requiredField.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get requiredField;

  /// No description provided for @addAtLeastOneCaseload.
  ///
  /// In en, this message translates to:
  /// **'Add at least one location with your current clients'**
  String get addAtLeastOneCaseload;

  /// No description provided for @caseloadRequiredHint.
  ///
  /// In en, this message translates to:
  /// **'Add at least one location *'**
  String get caseloadRequiredHint;

  /// No description provided for @introTitle.
  ///
  /// In en, this message translates to:
  /// **'Quick well-being check'**
  String get introTitle;

  /// No description provided for @introSubtitle.
  ///
  /// In en, this message translates to:
  /// **'A short 5-question self-check'**
  String get introSubtitle;

  /// No description provided for @introBody.
  ///
  /// In en, this message translates to:
  /// **'Take a quick well-being self-check so we can tailor guidance and content to you. It takes about a minute, your answers stay private, and it is not a diagnosis. You can do it now or come back to it later.'**
  String get introBody;

  /// No description provided for @introStart.
  ///
  /// In en, this message translates to:
  /// **'Start the self-check'**
  String get introStart;

  /// No description provided for @introLater.
  ///
  /// In en, this message translates to:
  /// **'Maybe later'**
  String get introLater;

  /// No description provided for @clientAssessmentsTitle.
  ///
  /// In en, this message translates to:
  /// **'Client results'**
  String get clientAssessmentsTitle;

  /// No description provided for @clientAssessmentsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Assigned & self-administered self-checks'**
  String get clientAssessmentsSubtitle;

  /// No description provided for @viewClientResults.
  ///
  /// In en, this message translates to:
  /// **'View results'**
  String get viewClientResults;

  /// No description provided for @noClientAssessments.
  ///
  /// In en, this message translates to:
  /// **'No assessments yet'**
  String get noClientAssessments;

  /// No description provided for @resultAnswersTitle.
  ///
  /// In en, this message translates to:
  /// **'Responses'**
  String get resultAnswersTitle;

  /// No description provided for @resultNotCompleted.
  ///
  /// In en, this message translates to:
  /// **'Not completed yet'**
  String get resultNotCompleted;

  /// No description provided for @sourceSelf.
  ///
  /// In en, this message translates to:
  /// **'Self-administered'**
  String get sourceSelf;

  /// No description provided for @sourceAssigned.
  ///
  /// In en, this message translates to:
  /// **'Assigned by you'**
  String get sourceAssigned;

  /// No description provided for @scoreOutOf100.
  ///
  /// In en, this message translates to:
  /// **'{value} out of 100'**
  String scoreOutOf100(Object value);

  /// No description provided for @errLoadResult.
  ///
  /// In en, this message translates to:
  /// **'Could not load this result. Please try again.'**
  String get errLoadResult;

  /// No description provided for @actionBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get actionBack;

  /// No description provided for @actionCancelAppointment.
  ///
  /// In en, this message translates to:
  /// **'Cancel appointment'**
  String get actionCancelAppointment;

  /// No description provided for @confirmCancelAppointment.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to cancel this appointment?'**
  String get confirmCancelAppointment;

  /// No description provided for @actionMarkComplete.
  ///
  /// In en, this message translates to:
  /// **'Mark completed'**
  String get actionMarkComplete;

  /// No description provided for @actionMarkNoShow.
  ///
  /// In en, this message translates to:
  /// **'Mark no-show'**
  String get actionMarkNoShow;

  /// No description provided for @historyTitle.
  ///
  /// In en, this message translates to:
  /// **'Your history'**
  String get historyTitle;

  /// No description provided for @historySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your past results, newest first'**
  String get historySubtitle;

  /// No description provided for @noHistory.
  ///
  /// In en, this message translates to:
  /// **'No past results yet'**
  String get noHistory;

  /// No description provided for @viewHistory.
  ///
  /// In en, this message translates to:
  /// **'View history'**
  String get viewHistory;

  /// No description provided for @searchByName.
  ///
  /// In en, this message translates to:
  /// **'Search by name'**
  String get searchByName;

  /// No description provided for @allProfessions.
  ///
  /// In en, this message translates to:
  /// **'All professions'**
  String get allProfessions;

  /// No description provided for @labelFee.
  ///
  /// In en, this message translates to:
  /// **'Fee'**
  String get labelFee;

  /// No description provided for @labelAvailability.
  ///
  /// In en, this message translates to:
  /// **'Weekly availability'**
  String get labelAvailability;

  /// No description provided for @labelAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get labelAbout;

  /// No description provided for @labelEducation.
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get labelEducation;

  /// No description provided for @noScheduleSet.
  ///
  /// In en, this message translates to:
  /// **'No schedule shared yet'**
  String get noScheduleSet;

  /// No description provided for @shareProfileWithPro.
  ///
  /// In en, this message translates to:
  /// **'Share my profile'**
  String get shareProfileWithPro;

  /// No description provided for @shareProfileHint.
  ///
  /// In en, this message translates to:
  /// **'Let this professional see your self-check results'**
  String get shareProfileHint;

  /// No description provided for @actionRequestAppointment.
  ///
  /// In en, this message translates to:
  /// **'Request appointment'**
  String get actionRequestAppointment;

  /// No description provided for @notAcceptingClients.
  ///
  /// In en, this message translates to:
  /// **'Not accepting new clients right now'**
  String get notAcceptingClients;

  /// No description provided for @navChangePassword.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get navChangePassword;

  /// No description provided for @navChangePasswordDesc.
  ///
  /// In en, this message translates to:
  /// **'Update your account password'**
  String get navChangePasswordDesc;

  /// No description provided for @fieldCurrentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current password'**
  String get fieldCurrentPassword;

  /// No description provided for @fieldNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get fieldNewPassword;

  /// No description provided for @fieldConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm new password'**
  String get fieldConfirmPassword;

  /// No description provided for @passwordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordMismatch;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Use at least 8 characters'**
  String get passwordTooShort;

  /// No description provided for @passwordChanged.
  ///
  /// In en, this message translates to:
  /// **'Password changed'**
  String get passwordChanged;

  /// No description provided for @changePasswordFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not change password. Check your current password.'**
  String get changePasswordFailed;

  /// No description provided for @deactivateAccount.
  ///
  /// In en, this message translates to:
  /// **'Deactivate account'**
  String get deactivateAccount;

  /// No description provided for @deactivateConfirm.
  ///
  /// In en, this message translates to:
  /// **'Deactivate your account? You can reactivate by signing in again.'**
  String get deactivateConfirm;

  /// No description provided for @deactivated.
  ///
  /// In en, this message translates to:
  /// **'Your account has been deactivated'**
  String get deactivated;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete account'**
  String get deleteAccount;

  /// No description provided for @deleteConfirm.
  ///
  /// In en, this message translates to:
  /// **'Permanently delete your account? Your identifying data is anonymized and this cannot be undone.'**
  String get deleteConfirm;

  /// No description provided for @deleted.
  ///
  /// In en, this message translates to:
  /// **'Your account has been deleted'**
  String get deleted;

  /// No description provided for @accountActionFailed.
  ///
  /// In en, this message translates to:
  /// **'Action failed. Please try again.'**
  String get accountActionFailed;

  /// No description provided for @homeUnreadNotifications.
  ///
  /// In en, this message translates to:
  /// **'{count} new notifications'**
  String homeUnreadNotifications(Object count);

  /// No description provided for @introNudgeTitle.
  ///
  /// In en, this message translates to:
  /// **'Take your quick well-being check'**
  String get introNudgeTitle;

  /// No description provided for @introNudgeDesc.
  ///
  /// In en, this message translates to:
  /// **'A 1-minute self-check to personalize your guidance'**
  String get introNudgeDesc;

  /// No description provided for @fieldAgreeTerms.
  ///
  /// In en, this message translates to:
  /// **'I agree to the Terms & Conditions and Privacy Policy'**
  String get fieldAgreeTerms;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['bn', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'bn':
      return AppLocalizationsBn();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
