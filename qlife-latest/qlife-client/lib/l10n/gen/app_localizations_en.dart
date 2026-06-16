// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'QLife';

  @override
  String get navHome => 'Home';

  @override
  String get navProfile => 'My profile';

  @override
  String get navScales => 'Scales';

  @override
  String get navProfessionals => 'Professionals';

  @override
  String get navAppointments => 'Appointments';

  @override
  String get navNotifications => 'Notifications';

  @override
  String get navContent => 'Content';

  @override
  String get navBecomeProfessional => 'Become a professional';

  @override
  String get actionSignOut => 'Sign out';

  @override
  String get signInTitle => 'Sign in';

  @override
  String get signInContinue => 'Continue with Cognito';

  @override
  String get professionalTitle => 'Professional';

  @override
  String get proAppointmentRequests => 'Appointment requests';

  @override
  String get proMyClients => 'My clients';

  @override
  String get actionCancel => 'Cancel';

  @override
  String get actionSubmit => 'Submit';

  @override
  String get actionSubmitting => 'Submitting…';

  @override
  String get actionContinue => 'Continue';

  @override
  String get actionConfirm => 'Confirm';

  @override
  String get actionAccept => 'Accept';

  @override
  String get actionDecline => 'Decline';

  @override
  String get actionMarkSeen => 'Mark seen';

  @override
  String get actionProposeReschedule => 'Propose reschedule';

  @override
  String get actionSaving => 'Saving…';

  @override
  String get errLoadAppointments =>
      'Could not load appointments. Please try again.';

  @override
  String get errLoadAppointmentDetail =>
      'Could not load appointment details. Please go back and try again.';

  @override
  String get errLoadClients => 'Could not load clients. Please try again.';

  @override
  String get errLoadClientDetail =>
      'Could not load client details. Please go back and try again.';

  @override
  String get errLoadContent => 'Could not load content. Please try again.';

  @override
  String get errLoadNotifications =>
      'Could not load notifications. Please try again.';

  @override
  String get errLoadProfessionals =>
      'Could not load professionals. Please try again.';

  @override
  String get errLoadScales => 'Could not load scales. Please try again.';

  @override
  String get errLoadScalesRefresh => 'Could not load scales. Please refresh.';

  @override
  String get errLoadScaleDetail =>
      'Could not load this scale. Please go back and try again.';

  @override
  String get errLoadProfile => 'Could not load profile. Please try again.';

  @override
  String get emptyAppointments => 'No appointments yet';

  @override
  String get emptyClients => 'No clients yet';

  @override
  String get emptyContent => 'No content available yet';

  @override
  String get emptyProfessionals => 'No professionals available';

  @override
  String get emptyScales => 'No scales available';

  @override
  String get emptyNotifications => 'You have no notifications';

  @override
  String get appointmentTitle => 'Appointment';

  @override
  String fieldStatus(Object value) {
    return 'Status: $value';
  }

  @override
  String fieldRequested(Object value) {
    return 'Requested: $value';
  }

  @override
  String fieldScheduled(Object value) {
    return 'Scheduled: $value';
  }

  @override
  String fieldMeetingLinkValue(Object value) {
    return 'Meeting link: $value';
  }

  @override
  String fieldClientMessage(Object value) {
    return 'Client message: $value';
  }

  @override
  String fieldProfessionalMessage(Object value) {
    return 'Professional message: $value';
  }

  @override
  String get valueDash => '—';

  @override
  String get apptRequested => 'Appointment requested';

  @override
  String get apptActionFailed => 'Action failed. Please try again.';

  @override
  String get apptMarkSeenFailed => 'Failed to mark as seen. Please try again.';

  @override
  String get fieldMeetingLinkInput => 'Meeting link / address (optional)';

  @override
  String get fieldMessageOptional => 'Message (optional)';

  @override
  String requestAppointmentWith(Object name) {
    return 'Request appointment with $name';
  }

  @override
  String get selectDate => 'Select date';

  @override
  String get selectTime => 'Select time';

  @override
  String get selectDateTimeError => 'Please select a date and time.';

  @override
  String get requestAppointmentFailed =>
      'Failed to request appointment. Please try again.';

  @override
  String get contentTitle => 'Content';

  @override
  String get rateThisContent => 'Rate this content';

  @override
  String get commentOptional => 'Comment (optional)';

  @override
  String get ratingSubmitFailed => 'Failed to submit rating. Please try again.';

  @override
  String ratedStars(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'Rated $count stars',
      one: 'Rated 1 star',
    );
    return '$_temp0';
  }

  @override
  String get clientsTitle => 'Clients';

  @override
  String get clientTitle => 'Client';

  @override
  String get assignMultipleScales => 'Assign multiple scales';

  @override
  String get assignSelected => 'Assign selected';

  @override
  String get assigning => 'Assigning…';

  @override
  String get assignedScales => 'Assigned scales';

  @override
  String get selectAtLeastOneScale => 'Select at least one scale';

  @override
  String get assignFailed => 'Failed to assign scales. Please try again.';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get markReadFailed => 'Could not mark as read. Please try again.';

  @override
  String get statusUnread => 'Unread';

  @override
  String get statusRead => 'Read';

  @override
  String get scalesTitle => 'Scales';

  @override
  String get resultLabel => 'Result';

  @override
  String severityLabel(Object value) {
    return 'Severity: $value';
  }

  @override
  String scoreLabel(Object value) {
    return 'Score: $value';
  }

  @override
  String recommendationLabel(Object value) {
    return 'Recommendation: $value';
  }

  @override
  String get submissionFailed => 'Submission failed. Please try again.';

  @override
  String get becomeProfessionalTitle => 'Become a professional';

  @override
  String get fieldFullName => 'Full name';

  @override
  String get fieldProfessionType => 'Profession type';

  @override
  String get fieldGenderOptional => 'Gender (optional)';

  @override
  String get fieldDesignationOptional => 'Designation (optional)';

  @override
  String get fieldPhoneOptional => 'Phone (optional)';

  @override
  String get selectProfessionType => 'Please select a profession type.';

  @override
  String get registeredAsProfessional => 'Registered as professional';

  @override
  String get registrationFailed => 'Registration failed. Please try again.';

  @override
  String get nameRequired => 'Name required';

  @override
  String get professionClinicalPsychologist => 'Clinical psychologist';

  @override
  String get professionAssistantClinicalPsychologist =>
      'Assistant clinical psychologist';

  @override
  String get professionPsychiatrist => 'Psychiatrist';

  @override
  String get professionCounselor => 'Counselor';

  @override
  String get professionOther => 'Other';

  @override
  String get genderMale => 'Male';

  @override
  String get genderFemale => 'Female';

  @override
  String get genderOther => 'Other';

  @override
  String get genderUndisclosed => 'Prefer not to say';

  @override
  String get maritalSingle => 'Single';

  @override
  String get maritalMarried => 'Married';

  @override
  String get maritalDivorced => 'Divorced';

  @override
  String get maritalWidowed => 'Widowed';

  @override
  String get maritalSeparated => 'Separated';

  @override
  String get maritalUndisclosed => 'Prefer not to say';

  @override
  String get completeProfileTitle => 'Complete profile';

  @override
  String get fieldName => 'Name';

  @override
  String get fieldAgeYears => 'Age (years)';

  @override
  String get fieldGender => 'Gender';

  @override
  String get fieldMaritalStatus => 'Marital status';

  @override
  String get fieldDistrict => 'District';

  @override
  String get fieldUpazilaOptional => 'Upazila (optional)';

  @override
  String get fieldUnionOptional => 'Union (optional)';

  @override
  String get selectGenderMaritalDistrict =>
      'Please select gender, marital status, and district.';

  @override
  String get profileSaved => 'Profile saved';

  @override
  String get profileSaveFailed => 'Failed to save profile. Please try again.';

  @override
  String get saveAndContinue => 'Save & continue';

  @override
  String get ageRequired => 'Valid age required';

  @override
  String get ageRange => 'Age must be 5–150';

  @override
  String get proOnboardingTitle => 'Professional onboarding';

  @override
  String get fieldWorkplaceOptional => 'Workplace (optional)';

  @override
  String get fieldYearsOptional => 'Years of experience (optional)';

  @override
  String get fieldBioOptional => 'Bio (optional)';

  @override
  String get acceptingNewClients => 'Accepting new clients';

  @override
  String get showInDirectory => 'Show in directory';

  @override
  String get visibleAfterApproval => 'Visible only after admin approval';

  @override
  String get finishOnboarding => 'Finish onboarding';

  @override
  String get onboardingCompleted => 'Onboarding completed';

  @override
  String get onboardingSaveFailed => 'Failed to save. Please try again.';

  @override
  String verificationStatus(Object status) {
    return 'Verification: $status';
  }

  @override
  String get nonNegativeInteger => 'Enter a non-negative integer';
}
