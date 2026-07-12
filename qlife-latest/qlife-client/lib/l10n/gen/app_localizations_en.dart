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
  String get navScales => 'Self-checks';

  @override
  String get navProfessionals => 'Professionals';

  @override
  String get navAppointments => 'Appointments';

  @override
  String get navNotifications => 'Notifications';

  @override
  String get navContent => 'Resources';

  @override
  String get navMore => 'More';

  @override
  String get navBecomeProfessional => 'Become a professional';

  @override
  String get actionSignOut => 'Sign out';

  @override
  String get actionRetry => 'Try again';

  @override
  String get welcomeHeadline => 'A calmer mind starts here';

  @override
  String get welcomeSubtitle =>
      'Private, gentle support for your mental wellbeing — whenever you need it.';

  @override
  String get signInTitle => 'Welcome';

  @override
  String get signInContinue => 'Continue securely';

  @override
  String get authSignInTitle => 'Welcome back';

  @override
  String get authSignInSubtitle => 'Sign in to continue your wellbeing journey';

  @override
  String get authSignUpTitle => 'Create your account';

  @override
  String get authSignUpSubtitle => 'A few details to get you started';

  @override
  String get authRoleQuestion => 'How would you like to continue?';

  @override
  String get authRoleUser => 'Seeking support';

  @override
  String get authRoleUserDesc => 'For your own wellbeing';

  @override
  String get authRoleProfessional => 'I\'m a professional';

  @override
  String get authRoleProfessionalDesc => 'Offer care to clients';

  @override
  String get authEmail => 'Email';

  @override
  String get authPassword => 'Password';

  @override
  String get authConfirmPassword => 'Confirm password';

  @override
  String get authPasswordHint => 'At least 6 characters';

  @override
  String get authSignInAction => 'Sign in';

  @override
  String get authSignUpAction => 'Create account';

  @override
  String get authForgotPassword => 'Forgot password?';

  @override
  String get authNoAccount => 'New here? Create an account';

  @override
  String get authHaveAccount => 'Already have an account? Sign in';

  @override
  String get authProfessionalSignInTitle => 'Professional sign in';

  @override
  String get authProfessionalSignUpTitle => 'Professional registration';

  @override
  String get authSignInAsProfessional => 'Sign in as a professional';

  @override
  String get authSignInAsUser => 'Sign in as a user';

  @override
  String get authSignUpAsProfessional => 'Register as a professional';

  @override
  String get authSignUpAsUser => 'Register as a user';

  @override
  String get authVerifyTitle => 'Verify your email';

  @override
  String authVerifySubtitle(String email) {
    return 'Enter the code we sent to $email. Check your spam or junk folder if you don\'t see it.';
  }

  @override
  String get authVerifyCode => 'Verification code';

  @override
  String get authVerifyAction => 'Verify & continue';

  @override
  String get authResendCode => 'Resend code';

  @override
  String get authCodeResent => 'A new code is on its way';

  @override
  String get authForgotTitle => 'Reset your password';

  @override
  String get authForgotSubtitle =>
      'Enter your email and we\'ll send you a reset code';

  @override
  String get authSendCode => 'Send reset code';

  @override
  String get authNewPassword => 'New password';

  @override
  String get authResetAction => 'Reset password';

  @override
  String get authResetDone => 'Password updated. Please sign in.';

  @override
  String get authBackToSignIn => 'Back to sign in';

  @override
  String get authErrEmailRequired => 'Enter your email';

  @override
  String get authErrEmailInvalid => 'Enter a valid email address';

  @override
  String get authErrPasswordRequired => 'Enter your password';

  @override
  String get authErrPasswordShort => 'Use at least 6 characters';

  @override
  String get authErrPasswordsMismatch => 'Passwords don\'t match';

  @override
  String get authErrCodeRequired => 'Enter the verification code';

  @override
  String get authErrGeneric => 'Something went wrong. Please try again.';

  @override
  String get homeWelcome => 'Welcome back';

  @override
  String get homeGreeting => 'How are you feeling today?';

  @override
  String get homeTagline => 'Take a quiet moment for yourself.';

  @override
  String get sectionQuickActions => 'Quick actions';

  @override
  String get homeTipTitle => 'A gentle reminder';

  @override
  String get homeTip1 =>
      'Take three slow breaths before your next task — it helps settle the mind.';

  @override
  String get homeTip2 =>
      'Naming a feeling makes it easier to hold. What are you feeling right now?';

  @override
  String get homeTip3 =>
      'Small steps count. One kind act toward yourself today is enough.';

  @override
  String get homeTip4 =>
      'Rest is productive too. Give yourself permission to pause.';

  @override
  String get proTipTitle => 'Today\'s focus';

  @override
  String get proTip1 =>
      'Reply to pending requests early — a timely response reassures clients.';

  @override
  String get proTip2 =>
      'A short check-in between sessions can help a client feel supported.';

  @override
  String get proTip3 =>
      'Assign a follow-up self-check to track a client\'s progress over time.';

  @override
  String get sectionExplore => 'Explore';

  @override
  String get accountTitle => 'Account';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get navScalesDesc => 'A short, private check-in on how you\'re doing';

  @override
  String get navProfessionalsDesc => 'Find a counselor or psychologist';

  @override
  String get navAppointmentsDesc => 'View and manage your sessions';

  @override
  String get navContentDesc => 'Articles and videos for your wellbeing';

  @override
  String get navProfileDesc => 'Update your personal details';

  @override
  String get navBecomeProfessionalDesc => 'Offer care to others on QLife';

  @override
  String get navNotificationsDesc => 'Stay up to date';

  @override
  String get professionalTitle => 'Professional';

  @override
  String get proDashTitle => 'Your practice';

  @override
  String get proDashGreeting => 'Welcome back';

  @override
  String get proAppointmentRequests => 'Appointment requests';

  @override
  String get proAppointmentRequestsDesc => 'Review and respond to new requests';

  @override
  String get proMyClients => 'My clients';

  @override
  String get proMyClientsDesc => 'See the people in your care';

  @override
  String get actionCancel => 'Cancel';

  @override
  String get actionSubmit => 'Submit';

  @override
  String get actionSubmitting => 'Submitting…';

  @override
  String get answerAllToSubmit => 'Please answer all questions to continue.';

  @override
  String get assignedAlreadyDone =>
      'You\'ve already completed this self-check. You can view your result below.';

  @override
  String get viewResult => 'View result';

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
  String get errLoadContent => 'Could not load resources. Please try again.';

  @override
  String get errLoadNotifications =>
      'Could not load notifications. Please try again.';

  @override
  String get errLoadProfessionals =>
      'Could not load professionals. Please try again.';

  @override
  String get errLoadScales => 'Could not load self-checks. Please try again.';

  @override
  String get errLoadScalesRefresh =>
      'Could not load self-checks. Please refresh.';

  @override
  String get errLoadScaleDetail =>
      'Could not load this self-check. Please go back and try again.';

  @override
  String get errLoadDistricts => 'Could not load districts. Please try again.';

  @override
  String get errLoadUpazilas => 'Could not load upazilas. Please try again.';

  @override
  String get errLoadUnions => 'Could not load unions. Please try again.';

  @override
  String get errLoadProfile => 'Could not load profile. Please try again.';

  @override
  String get emptyAppointments => 'No appointments yet';

  @override
  String get emptyClients => 'No clients yet';

  @override
  String get emptyContent => 'No resources available yet';

  @override
  String get emptyProfessionals =>
      'There are currently no professionals to show';

  @override
  String get emptyScales => 'No self-checks available yet';

  @override
  String get emptyNotifications => 'You\'re all caught up';

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
  String get contentTitle => 'Resources';

  @override
  String get rateThisContent => 'Rate this resource';

  @override
  String get commentOptional => 'Comment (optional)';

  @override
  String get ratingSubmitFailed => 'Failed to submit rating. Please try again.';

  @override
  String get watchTrackingNote =>
      'We\'ll mark this as watched once you reach the end.';

  @override
  String get watchCompleted => 'Watched — nicely done.';

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
  String get assignMultipleScales => 'Assign self-checks';

  @override
  String get assignSelected => 'Assign selected';

  @override
  String get assigning => 'Assigning…';

  @override
  String get assignedScales => 'Assigned self-checks';

  @override
  String get selectAtLeastOneScale => 'Select at least one self-check';

  @override
  String get assignFailed => 'Couldn\'t assign self-checks. Please try again.';

  @override
  String get assignedTitle => 'Assigned to you';

  @override
  String get assignedSubtitle =>
      'Self-checks your professional asked you to complete';

  @override
  String get assignedHomeDesc => 'Self-checks from your professional';

  @override
  String get assignedByProfessional => 'Assigned by your professional';

  @override
  String get assignedEmpty => 'Nothing assigned right now';

  @override
  String get errLoadAssigned =>
      'Could not load assigned self-checks. Please try again.';

  @override
  String assignedPending(Object count) {
    return '$count waiting to be completed';
  }

  @override
  String get actionNeeded => 'Action needed';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get markReadFailed => 'Could not mark as read. Please try again.';

  @override
  String get statusUnread => 'Unread';

  @override
  String get statusRead => 'Read';

  @override
  String get timeJustNow => 'Just now';

  @override
  String timeMinutesAgo(Object minutes) {
    return '${minutes}m ago';
  }

  @override
  String timeHoursAgo(Object hours) {
    return '${hours}h ago';
  }

  @override
  String timeDaysAgo(Object days) {
    return '${days}d ago';
  }

  @override
  String get scalesTitle => 'Self-checks';

  @override
  String get assessmentIntro =>
      'Take your time. There are no right or wrong answers — just answer honestly.';

  @override
  String get resultTitle => 'Your result';

  @override
  String get resultIntro =>
      'This is a guide to reflect on, not a diagnosis. Consider sharing it with a professional.';

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
  String get followUpTitle => 'Your next step';

  @override
  String get followUpWatchResource => 'View the recommended resource';

  @override
  String get followUpExploreResources => 'Explore resources';

  @override
  String get followUpTakeHelpResources => 'Take help from our resources';

  @override
  String get followUpTalkToProfessional => 'Talk to a professional';

  @override
  String get followUpHelpCenter => 'Get support now';

  @override
  String get followUpReassurance =>
      'This is a snapshot, not a diagnosis. Support is here whenever you need it.';

  @override
  String get helpCenterTitle => 'You\'re not alone';

  @override
  String get helpCenterSubtitle => 'Support is available';

  @override
  String get helpCenterBody =>
      'If your feelings are becoming hard to manage, reaching out can help. You can talk to a mental health professional through QLife, or confide in someone you trust.';

  @override
  String get helpCenterUrgentTitle => 'If you\'re in immediate danger';

  @override
  String get helpCenterUrgentBody =>
      'If you are thinking about harming yourself, please reach out right away — contact your local emergency services or someone you trust. You deserve support.';

  @override
  String get helpCenterFindProfessional => 'Find a professional';

  @override
  String get helpCenterExploreResources => 'Calming resources';

  @override
  String get helpCenterHotlinesTitle => 'Crisis helplines';

  @override
  String get helpCenterTollFree => 'Toll-free';

  @override
  String get helpCenterCallError =>
      'Couldn\'t open the dialer. Please try again.';

  @override
  String get becomeProfessionalTitle => 'Become a professional';

  @override
  String get fieldFullName => 'Full name';

  @override
  String get fieldProfessionType => 'Profession';

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
  String get completeProfileSubtitle =>
      'This helps us tailor your experience. Your details stay private.';

  @override
  String get fieldName => 'Name';

  @override
  String get fieldDateOfBirth => 'Date of birth';

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
  String get dobRequired => 'Date of birth required';

  @override
  String get dobRange => 'Age must be 5–150';

  @override
  String labelAgeYears(int years) {
    return 'Age: $years years';
  }

  @override
  String get proOnboardingTitle => 'Set up your profile';

  @override
  String get proOnboardingSubtitle =>
      'Tell clients a little about your practice.';

  @override
  String get fieldWorkplaceOptional => 'Workplace (optional)';

  @override
  String get fieldYearsOptional => 'Years of experience (optional)';

  @override
  String get fieldBioOptional => 'About you (optional)';

  @override
  String get acceptingNewClients => 'Accepting new clients';

  @override
  String get acceptingNewClientsDesc =>
      'Allow clients to send you new booking requests. Turn this off when your schedule is full — you stay in the directory but clients can\'t book you.';

  @override
  String get showInDirectory => 'Let clients find me';

  @override
  String get showInDirectoryDesc =>
      'List your profile in the public directory so clients can discover and view you. You only become visible after an admin approves your account.';

  @override
  String get visibleAfterApproval => 'Visible only after admin approval';

  @override
  String get finishOnboarding => 'Finish setup';

  @override
  String get onboardingCompleted => 'You\'re all set';

  @override
  String get onboardingSaveFailed => 'Failed to save. Please try again.';

  @override
  String saveFailedReason(Object reason) {
    return 'Couldn\'t save: $reason';
  }

  @override
  String verificationStatus(Object status) {
    return 'Verification: $status';
  }

  @override
  String get verificationPendingTitle => 'Account under review';

  @override
  String get verificationPendingNote =>
      'Our team is reviewing your profile. You won\'t appear to clients yet — once an admin approves your account, you\'ll be listed in the directory and clients can find and book you.';

  @override
  String get verificationApprovedTitle => 'You\'re approved';

  @override
  String get verificationApprovedNote =>
      'Your profile is live. Clients can find you in the directory and request appointments.';

  @override
  String get exitAppTitle => 'Close the app?';

  @override
  String get exitAppMessage => 'Are you sure you want to exit QLife?';

  @override
  String get actionExit => 'Exit';

  @override
  String get proRejectedTitle => 'Application reviewed';

  @override
  String get proRejectedHeadline => 'Thank you for your interest in QLife';

  @override
  String get proRejectedBody =>
      'Your application to join QLife as a professional has been carefully reviewed. After consideration, we are unable to approve your account to proceed at this time. We sincerely appreciate the time and effort you put into your application.';

  @override
  String get proRejectedContact =>
      'If you have any questions or believe this decision was made in error, please contact our support team.';

  @override
  String get nonNegativeInteger => 'Enter a non-negative integer';

  @override
  String get yearsOutOfRange => 'Enter a realistic number of years (0–80)';

  @override
  String get weeklyOutOfRange => 'Enter a realistic number (0–500)';

  @override
  String get avgExceedsMax =>
      'Average clients per week can\'t exceed your weekly maximum';

  @override
  String get bmdcHint => 'As printed on your BMDC certificate';

  @override
  String get fieldCountryCode => 'Country';

  @override
  String get phoneHintBd => 'e.g. 01712345678';

  @override
  String get phoneInvalidBd =>
      'Enter a valid Bangladeshi mobile number (e.g. 01712345678)';

  @override
  String get phoneInvalid => 'Enter a valid phone number';

  @override
  String get onboardingRequiredHint =>
      'Complete the required fields (marked *) before finishing.';

  @override
  String get sectionCredentials => 'Credentials';

  @override
  String get sectionPractice => 'Your practice';

  @override
  String get sectionFees => 'Consultation fee';

  @override
  String get sectionLocation => 'Location';

  @override
  String get sectionSpecializations => 'Specializations';

  @override
  String get sectionAvailability => 'Weekly availability';

  @override
  String get sectionCaseload => 'Current caseload (optional)';

  @override
  String get sectionVisibility => 'Visibility';

  @override
  String get sectionBasics => 'Basics';

  @override
  String get editProfileTitle => 'Edit profile';

  @override
  String get editProfileSubtitle => 'Update your professional details';

  @override
  String get actionEditProfile => 'Edit profile';

  @override
  String get navMyProfileProDesc => 'View and edit your professional profile';

  @override
  String get labelNotSet => 'Not set';

  @override
  String get labelYes => 'Yes';

  @override
  String get labelNo => 'No';

  @override
  String get fieldDesignation => 'Designation';

  @override
  String get fieldVisibleInDirectory => 'Visible in directory';

  @override
  String get navPrivacy => 'Privacy Policy';

  @override
  String get navPrivacyDesc => 'How we handle your data';

  @override
  String get navAbout => 'About QLife';

  @override
  String get navAboutDesc => 'Learn more about us';

  @override
  String get privacyTitle => 'Privacy Policy';

  @override
  String get aboutTitle => 'About QLife';

  @override
  String get legalDraftNotice =>
      'This is placeholder text and will be replaced with the final published version.';

  @override
  String get fieldBmdcOptional => 'BMDC registration no. (optional)';

  @override
  String get fieldGraduationBatchOptional => 'Graduation batch (optional)';

  @override
  String get fieldEducation => 'Education & qualifications *';

  @override
  String get fieldFeeAmount => 'Fee amount (BDT) *';

  @override
  String get fieldMaxWeeklyClients => 'Max clients per week (optional)';

  @override
  String get fieldAvgWeeklyClients => 'Average clients per week now (optional)';

  @override
  String get fieldOtherSpecialization =>
      'Other specialization (please specify)';

  @override
  String get fieldCaseloadLocation => 'Location';

  @override
  String get fieldCaseloadCount => 'Clients';

  @override
  String get fieldWeekday => 'Day';

  @override
  String get fieldStartTime => 'From';

  @override
  String get fieldEndTime => 'To';

  @override
  String get addAvailabilityWindow => 'Add time slot';

  @override
  String get addCaseloadRow => 'Add location';

  @override
  String get specializationsRequiredHint => 'Select at least one *';

  @override
  String get feeRequired => 'Enter a valid consultation fee';

  @override
  String get educationRequired => 'Enter your education & qualifications';

  @override
  String get selectAtLeastOneSpecialization =>
      'Select at least one specialization';

  @override
  String get addAtLeastOneAvailability =>
      'Add at least one availability window';

  @override
  String get availabilityStartBeforeEnd =>
      'Each slot\'s start time must be before its end time';

  @override
  String get otherSpecializationRequired =>
      'Please specify your other specialization';

  @override
  String get weekdaySunday => 'Sunday';

  @override
  String get weekdayMonday => 'Monday';

  @override
  String get weekdayTuesday => 'Tuesday';

  @override
  String get weekdayWednesday => 'Wednesday';

  @override
  String get weekdayThursday => 'Thursday';

  @override
  String get weekdayFriday => 'Friday';

  @override
  String get weekdaySaturday => 'Saturday';

  @override
  String get consentTitle => 'Before you begin';

  @override
  String get consentSubtitle => 'How we handle your information';

  @override
  String get consentBody =>
      'QLife helps you understand your mental wellbeing through validated self-checks and connects you with qualified professionals. Your responses are private and are used only to give you relevant guidance and, when you choose, to share with a professional you connect with. The self-checks are for screening and support — they are not a medical diagnosis. By continuing you agree to our handling of your information for these purposes.';

  @override
  String get consentAgree => 'I understand and agree';

  @override
  String get consentMustAgree => 'Please accept to continue';

  @override
  String get consentSaveFailed =>
      'Could not save your consent. Please try again.';

  @override
  String get fieldReferralSource => 'Referral source (optional)';

  @override
  String get fieldYearsRequired => 'Years of experience *';

  @override
  String get fieldPhoneRequired => 'Phone *';

  @override
  String get fieldMaxWeeklyClientsRequired => 'Max clients per week *';

  @override
  String get fieldAvgWeeklyClientsRequired => 'Average clients per week now *';

  @override
  String get requiredField => 'This field is required';

  @override
  String get addAtLeastOneCaseload =>
      'Add at least one location with your current clients';

  @override
  String get caseloadRequiredHint => 'Add at least one location *';

  @override
  String get introTitle => 'Quick well-being check';

  @override
  String get introSubtitle => 'A short 5-question self-check';

  @override
  String get introBody =>
      'Take a quick well-being self-check so we can tailor guidance and content to you. It takes about a minute, your answers stay private, and it is not a diagnosis. You can do it now or come back to it later.';

  @override
  String get introStart => 'Start the self-check';

  @override
  String get introLater => 'Maybe later';

  @override
  String get clientAssessmentsTitle => 'Client results';

  @override
  String get clientAssessmentsSubtitle =>
      'Assigned & self-administered self-checks';

  @override
  String get viewClientResults => 'View results';

  @override
  String get noClientAssessments => 'No assessments yet';

  @override
  String get resultAnswersTitle => 'Responses';

  @override
  String get resultNotCompleted => 'Not completed yet';

  @override
  String get sourceSelf => 'Self-administered';

  @override
  String get sourceAssigned => 'Assigned by you';

  @override
  String scoreOutOf100(Object value) {
    return '$value out of 100';
  }

  @override
  String get errLoadResult => 'Could not load this result. Please try again.';

  @override
  String get actionBack => 'Back';

  @override
  String get actionCancelAppointment => 'Cancel appointment';

  @override
  String get confirmCancelAppointment =>
      'Are you sure you want to cancel this appointment?';

  @override
  String get actionMarkComplete => 'Mark completed';

  @override
  String get actionMarkNoShow => 'Mark no-show';

  @override
  String get historyTitle => 'Your history';

  @override
  String get historySubtitle => 'Your past results, newest first';

  @override
  String get noHistory => 'No past results yet';

  @override
  String get viewHistory => 'View history';

  @override
  String get searchByName => 'Search by name';

  @override
  String get allProfessions => 'All professions';

  @override
  String get professionFilterLabel => 'Profession';

  @override
  String get labelFee => 'Fee';

  @override
  String get labelAvailability => 'Weekly availability';

  @override
  String get labelAbout => 'About';

  @override
  String get labelEducation => 'Education';

  @override
  String get noScheduleSet => 'No schedule shared yet';

  @override
  String get shareProfileWithPro => 'Share my profile';

  @override
  String get shareProfileHint =>
      'Let this professional see your self-check results';

  @override
  String get actionRequestAppointment => 'Request appointment';

  @override
  String get notAcceptingClients => 'Not accepting new clients right now';

  @override
  String get navChangePassword => 'Change password';

  @override
  String get navChangePasswordDesc => 'Update your account password';

  @override
  String get fieldCurrentPassword => 'Current password';

  @override
  String get fieldNewPassword => 'New password';

  @override
  String get fieldConfirmPassword => 'Confirm new password';

  @override
  String get passwordMismatch => 'Passwords do not match';

  @override
  String get passwordTooShort => 'Use at least 8 characters';

  @override
  String get passwordChanged => 'Password changed';

  @override
  String get changePasswordFailed =>
      'Could not change password. Check your current password.';

  @override
  String get deactivateAccount => 'Deactivate account';

  @override
  String get deactivateConfirm =>
      'Deactivate your account? You can reactivate by signing in again.';

  @override
  String get deactivated => 'Your account has been deactivated';

  @override
  String get deleteAccount => 'Delete account';

  @override
  String get deleteConfirm =>
      'Permanently delete your account? Your identifying data is anonymized and this cannot be undone.';

  @override
  String get deleted => 'Your account has been deleted';

  @override
  String get accountActionFailed => 'Action failed. Please try again.';

  @override
  String homeUnreadNotifications(Object count) {
    return '$count new notifications';
  }

  @override
  String get introNudgeTitle => 'Take your quick well-being check';

  @override
  String get introNudgeDesc =>
      'A 1-minute self-check to personalize your guidance';

  @override
  String get fieldAgreeTerms =>
      'I agree to the Terms & Conditions and Privacy Policy';

  @override
  String get fieldAgreeTermsPrefix => 'I agree to the ';

  @override
  String get fieldAgreeTermsLink => 'Terms & Conditions and Privacy Policy';

  @override
  String get serverUnavailable =>
      'Our servers are currently unavailable. Please try again in a few moments.';

  @override
  String get alreadyRequestedAppointment =>
      'You already have an appointment with this professional.';

  @override
  String get actionViewAppointment => 'View appointment';

  @override
  String clientAssessmentCompletedOn(Object date) {
    return 'Completed $date';
  }
}
