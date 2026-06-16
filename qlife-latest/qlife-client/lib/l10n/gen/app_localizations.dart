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
  /// **'Scales'**
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
  /// **'Content'**
  String get navContent;

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

  /// No description provided for @signInTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signInTitle;

  /// No description provided for @signInContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue with Cognito'**
  String get signInContinue;

  /// No description provided for @professionalTitle.
  ///
  /// In en, this message translates to:
  /// **'Professional'**
  String get professionalTitle;

  /// No description provided for @proAppointmentRequests.
  ///
  /// In en, this message translates to:
  /// **'Appointment requests'**
  String get proAppointmentRequests;

  /// No description provided for @proMyClients.
  ///
  /// In en, this message translates to:
  /// **'My clients'**
  String get proMyClients;

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
  /// **'Could not load content. Please try again.'**
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
  /// **'Could not load scales. Please try again.'**
  String get errLoadScales;

  /// No description provided for @errLoadScalesRefresh.
  ///
  /// In en, this message translates to:
  /// **'Could not load scales. Please refresh.'**
  String get errLoadScalesRefresh;

  /// No description provided for @errLoadScaleDetail.
  ///
  /// In en, this message translates to:
  /// **'Could not load this scale. Please go back and try again.'**
  String get errLoadScaleDetail;

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
  /// **'No content available yet'**
  String get emptyContent;

  /// No description provided for @emptyProfessionals.
  ///
  /// In en, this message translates to:
  /// **'No professionals available'**
  String get emptyProfessionals;

  /// No description provided for @emptyScales.
  ///
  /// In en, this message translates to:
  /// **'No scales available'**
  String get emptyScales;

  /// No description provided for @emptyNotifications.
  ///
  /// In en, this message translates to:
  /// **'You have no notifications'**
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
  /// **'Content'**
  String get contentTitle;

  /// No description provided for @rateThisContent.
  ///
  /// In en, this message translates to:
  /// **'Rate this content'**
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
  /// **'Assign multiple scales'**
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
  /// **'Assigned scales'**
  String get assignedScales;

  /// No description provided for @selectAtLeastOneScale.
  ///
  /// In en, this message translates to:
  /// **'Select at least one scale'**
  String get selectAtLeastOneScale;

  /// No description provided for @assignFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to assign scales. Please try again.'**
  String get assignFailed;

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
  /// **'Scales'**
  String get scalesTitle;

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

  /// No description provided for @fieldName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get fieldName;

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

  /// No description provided for @proOnboardingTitle.
  ///
  /// In en, this message translates to:
  /// **'Professional onboarding'**
  String get proOnboardingTitle;

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
  /// **'Bio (optional)'**
  String get fieldBioOptional;

  /// No description provided for @acceptingNewClients.
  ///
  /// In en, this message translates to:
  /// **'Accepting new clients'**
  String get acceptingNewClients;

  /// No description provided for @showInDirectory.
  ///
  /// In en, this message translates to:
  /// **'Show in directory'**
  String get showInDirectory;

  /// No description provided for @visibleAfterApproval.
  ///
  /// In en, this message translates to:
  /// **'Visible only after admin approval'**
  String get visibleAfterApproval;

  /// No description provided for @finishOnboarding.
  ///
  /// In en, this message translates to:
  /// **'Finish onboarding'**
  String get finishOnboarding;

  /// No description provided for @onboardingCompleted.
  ///
  /// In en, this message translates to:
  /// **'Onboarding completed'**
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
