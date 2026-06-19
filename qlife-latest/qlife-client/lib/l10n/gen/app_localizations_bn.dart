// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Bengali Bangla (`bn`).
class AppLocalizationsBn extends AppLocalizations {
  AppLocalizationsBn([String locale = 'bn']) : super(locale);

  @override
  String get appTitle => 'QLife';

  @override
  String get navHome => 'হোম';

  @override
  String get navProfile => 'আমার প্রোফাইল';

  @override
  String get navScales => 'মানসিক যাচাই';

  @override
  String get navProfessionals => 'বিশেষজ্ঞ';

  @override
  String get navAppointments => 'সেশন';

  @override
  String get navNotifications => 'বিজ্ঞপ্তি';

  @override
  String get navContent => 'পড়ুন ও দেখুন';

  @override
  String get navMore => 'আরও';

  @override
  String get navBecomeProfessional => 'বিশেষজ্ঞ হিসেবে যোগ দিন';

  @override
  String get actionSignOut => 'সাইন আউট';

  @override
  String get actionRetry => 'আবার চেষ্টা করুন';

  @override
  String get welcomeHeadline => 'প্রশান্ত মনের যাত্রা শুরু এখানেই';

  @override
  String get welcomeSubtitle =>
      'মানসিক সুস্থতার জন্য নিরিবিলি, কোমল সহায়তা — যখনই প্রয়োজন।';

  @override
  String get signInTitle => 'স্বাগতম';

  @override
  String get signInContinue => 'নিরাপদে প্রবেশ করুন';

  @override
  String get authSignInTitle => 'আবার স্বাগতম';

  @override
  String get authSignInSubtitle =>
      'আপনার সুস্থতার যাত্রা চালিয়ে যেতে সাইন ইন করুন';

  @override
  String get authSignUpTitle => 'আপনার অ্যাকাউন্ট তৈরি করুন';

  @override
  String get authSignUpSubtitle => 'শুরু করতে কিছু তথ্য দিন';

  @override
  String get authRoleQuestion => 'আপনি কীভাবে এগিয়ে যেতে চান?';

  @override
  String get authRoleUser => 'সহায়তা খুঁজছি';

  @override
  String get authRoleUserDesc => 'নিজের সুস্থতার জন্য';

  @override
  String get authRoleProfessional => 'আমি একজন বিশেষজ্ঞ';

  @override
  String get authRoleProfessionalDesc => 'ক্লায়েন্টদের সেবা দিন';

  @override
  String get authEmail => 'ইমেইল';

  @override
  String get authPassword => 'পাসওয়ার্ড';

  @override
  String get authConfirmPassword => 'পাসওয়ার্ড নিশ্চিত করুন';

  @override
  String get authPasswordHint => 'কমপক্ষে ৬ অক্ষর';

  @override
  String get authSignInAction => 'সাইন ইন';

  @override
  String get authSignUpAction => 'অ্যাকাউন্ট তৈরি করুন';

  @override
  String get authForgotPassword => 'পাসওয়ার্ড ভুলে গেছেন?';

  @override
  String get authNoAccount => 'নতুন এসেছেন? অ্যাকাউন্ট তৈরি করুন';

  @override
  String get authHaveAccount => 'ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন';

  @override
  String get authProfessionalSignInTitle => 'বিশেষজ্ঞ সাইন ইন';

  @override
  String get authProfessionalSignUpTitle => 'বিশেষজ্ঞ নিবন্ধন';

  @override
  String get authSignInAsProfessional => 'বিশেষজ্ঞ হিসেবে সাইন ইন করুন';

  @override
  String get authSignInAsUser => 'ব্যবহারকারী হিসেবে সাইন ইন করুন';

  @override
  String get authSignUpAsProfessional => 'বিশেষজ্ঞ হিসেবে নিবন্ধন করুন';

  @override
  String get authSignUpAsUser => 'ব্যবহারকারী হিসেবে নিবন্ধন করুন';

  @override
  String get authVerifyTitle => 'আপনার ইমেইল যাচাই করুন';

  @override
  String authVerifySubtitle(String email) {
    return '$email-এ পাঠানো কোডটি লিখুন। না পেলে স্প্যাম বা জাঙ্ক ফোল্ডার দেখুন।';
  }

  @override
  String get authVerifyCode => 'যাচাইকরণ কোড';

  @override
  String get authVerifyAction => 'যাচাই করে এগিয়ে যান';

  @override
  String get authResendCode => 'কোড আবার পাঠান';

  @override
  String get authCodeResent => 'নতুন একটি কোড পাঠানো হয়েছে';

  @override
  String get authForgotTitle => 'পাসওয়ার্ড রিসেট করুন';

  @override
  String get authForgotSubtitle => 'আপনার ইমেইল দিন, আমরা একটি রিসেট কোড পাঠাব';

  @override
  String get authSendCode => 'রিসেট কোড পাঠান';

  @override
  String get authNewPassword => 'নতুন পাসওয়ার্ড';

  @override
  String get authResetAction => 'পাসওয়ার্ড রিসেট করুন';

  @override
  String get authResetDone =>
      'পাসওয়ার্ড আপডেট হয়েছে। অনুগ্রহ করে সাইন ইন করুন।';

  @override
  String get authBackToSignIn => 'সাইন ইনে ফিরে যান';

  @override
  String get authErrEmailRequired => 'আপনার ইমেইল দিন';

  @override
  String get authErrEmailInvalid => 'একটি সঠিক ইমেইল ঠিকানা দিন';

  @override
  String get authErrPasswordRequired => 'আপনার পাসওয়ার্ড দিন';

  @override
  String get authErrPasswordShort => 'কমপক্ষে ৬ অক্ষর ব্যবহার করুন';

  @override
  String get authErrPasswordsMismatch => 'পাসওয়ার্ড মিলছে না';

  @override
  String get authErrCodeRequired => 'যাচাইকরণ কোড লিখুন';

  @override
  String get authErrGeneric => 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get homeWelcome => 'আবার স্বাগতম';

  @override
  String get homeGreeting => 'আজ আপনি কেমন আছেন?';

  @override
  String get homeTagline => 'নিজের জন্য একটু সময় নিন।';

  @override
  String get sectionQuickActions => 'দ্রুত পদক্ষেপ';

  @override
  String get homeTipTitle => 'একটি কোমল মনে করিয়ে দেওয়া';

  @override
  String get homeTip1 =>
      'পরের কাজের আগে তিনবার ধীরে শ্বাস নিন — এটি মনকে শান্ত করতে সাহায্য করে।';

  @override
  String get homeTip2 =>
      'অনুভূতিকে নাম দিলে তা সামলানো সহজ হয়। এই মুহূর্তে আপনি কেমন অনুভব করছেন?';

  @override
  String get homeTip3 =>
      'ছোট ছোট পদক্ষেপও গুরুত্বপূর্ণ। আজ নিজের প্রতি একটি সদয় কাজই যথেষ্ট।';

  @override
  String get homeTip4 => 'বিশ্রামও ফলপ্রসূ। নিজেকে একটু থামার অনুমতি দিন।';

  @override
  String get proTipTitle => 'আজকের লক্ষ্য';

  @override
  String get proTip1 =>
      'অপেক্ষমাণ অনুরোধগুলোর দ্রুত উত্তর দিন — সময়মতো সাড়া ক্লায়েন্টকে আশ্বস্ত করে।';

  @override
  String get proTip2 =>
      'সেশনের ফাঁকে একটি ছোট খোঁজখবর ক্লায়েন্টকে সহায়তা অনুভব করাতে পারে।';

  @override
  String get proTip3 =>
      'ক্লায়েন্টের অগ্রগতি বুঝতে একটি ফলো-আপ যাচাই অ্যাসাইন করুন।';

  @override
  String get sectionExplore => 'আরও জানুন';

  @override
  String get accountTitle => 'অ্যাকাউন্ট';

  @override
  String get settingsLanguage => 'ভাষা';

  @override
  String get navScalesDesc => 'নিজের মানসিক অবস্থা সম্পর্কে একটু জানুন';

  @override
  String get navProfessionalsDesc => 'কাউন্সেলর বা মনোবিদ খুঁজুন';

  @override
  String get navAppointmentsDesc => 'আপনার সেশনগুলো দেখুন ও পরিচালনা করুন';

  @override
  String get navContentDesc => 'মানসিক সুস্থতার জন্য লেখা ও ভিডিও';

  @override
  String get navProfileDesc => 'আপনার ব্যক্তিগত তথ্য হালনাগাদ করুন';

  @override
  String get navBecomeProfessionalDesc => 'QLife-এ অন্যদের সেবা দিন';

  @override
  String get navNotificationsDesc => 'সর্বশেষ আপডেট দেখুন';

  @override
  String get professionalTitle => 'বিশেষজ্ঞ';

  @override
  String get proDashTitle => 'আপনার প্র্যাকটিস';

  @override
  String get proDashGreeting => 'আবার স্বাগতম';

  @override
  String get proAppointmentRequests => 'সেশনের অনুরোধ';

  @override
  String get proAppointmentRequestsDesc => 'নতুন অনুরোধ দেখুন ও সাড়া দিন';

  @override
  String get proMyClients => 'আমার ক্লায়েন্ট';

  @override
  String get proMyClientsDesc => 'আপনার তত্ত্বাবধানে থাকা ব্যক্তিদের দেখুন';

  @override
  String get actionCancel => 'বাতিল';

  @override
  String get actionSubmit => 'জমা দিন';

  @override
  String get actionSubmitting => 'জমা হচ্ছে…';

  @override
  String get actionContinue => 'চালিয়ে যান';

  @override
  String get actionConfirm => 'নিশ্চিত করুন';

  @override
  String get actionAccept => 'গ্রহণ করুন';

  @override
  String get actionDecline => 'প্রত্যাখ্যান করুন';

  @override
  String get actionMarkSeen => 'পড়া হয়েছে চিহ্নিত করুন';

  @override
  String get actionProposeReschedule => 'নতুন সময়ের প্রস্তাব দিন';

  @override
  String get actionSaving => 'সংরক্ষণ হচ্ছে…';

  @override
  String get errLoadAppointments => 'সেশন লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadAppointmentDetail =>
      'সেশনের বিস্তারিত লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadClients => 'ক্লায়েন্ট লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadClientDetail =>
      'ক্লায়েন্টের বিস্তারিত লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadContent => 'কন্টেন্ট লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadNotifications =>
      'বিজ্ঞপ্তি লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadProfessionals =>
      'বিশেষজ্ঞদের তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadScales => 'মানসিক যাচাই লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadScalesRefresh =>
      'মানসিক যাচাই লোড করা যায়নি। রিফ্রেশ করুন।';

  @override
  String get errLoadScaleDetail =>
      'এই যাচাইটি লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadUpazilas =>
      'উপজেলার তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadUnions =>
      'ইউনিয়নের তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadProfile => 'প্রোফাইল লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get emptyAppointments => 'এখনও কোনো সেশন নেই';

  @override
  String get emptyClients => 'এখনও কোনো ক্লায়েন্ট নেই';

  @override
  String get emptyContent => 'এখনও কোনো কন্টেন্ট নেই';

  @override
  String get emptyProfessionals => 'এই মুহূর্তে কোনো বিশেষজ্ঞ পাওয়া যাচ্ছে না';

  @override
  String get emptyProfessionalsHint =>
      'আপনি যদি একজন বিশেষজ্ঞকে অনুমোদন করে থাকেন, তবে তিনি অনবোর্ডিং শেষ করা, দৃশ্যমানতা চালু করা এবং “ক্লায়েন্ট গ্রহণ” চালু করা বাকি থাকতে পারে। রিফ্রেশ করে দেখুন বা কিছুক্ষণ পর আবার চেষ্টা করুন।';

  @override
  String get emptyScales => 'এখনও কোনো মানসিক যাচাই নেই';

  @override
  String get emptyNotifications => 'সব পড়া হয়ে গেছে';

  @override
  String get appointmentTitle => 'সেশন';

  @override
  String fieldStatus(Object value) {
    return 'অবস্থা: $value';
  }

  @override
  String fieldRequested(Object value) {
    return 'অনুরোধের সময়: $value';
  }

  @override
  String fieldScheduled(Object value) {
    return 'নির্ধারিত সময়: $value';
  }

  @override
  String fieldMeetingLinkValue(Object value) {
    return 'মিটিং লিঙ্ক: $value';
  }

  @override
  String fieldClientMessage(Object value) {
    return 'ক্লায়েন্টের বার্তা: $value';
  }

  @override
  String fieldProfessionalMessage(Object value) {
    return 'বিশেষজ্ঞের বার্তা: $value';
  }

  @override
  String get valueDash => '—';

  @override
  String get apptRequested => 'সেশনের অনুরোধ পাঠানো হয়েছে';

  @override
  String get apptActionFailed => 'কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করুন।';

  @override
  String get apptMarkSeenFailed =>
      'দেখা হয়েছে চিহ্নিত করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get fieldMeetingLinkInput => 'মিটিং লিঙ্ক / ঠিকানা (ঐচ্ছিক)';

  @override
  String get fieldMessageOptional => 'বার্তা (ঐচ্ছিক)';

  @override
  String requestAppointmentWith(Object name) {
    return '$name-এর সাথে সেশনের অনুরোধ';
  }

  @override
  String get selectDate => 'তারিখ বেছে নিন';

  @override
  String get selectTime => 'সময় বেছে নিন';

  @override
  String get selectDateTimeError => 'অনুগ্রহ করে একটি তারিখ ও সময় বেছে নিন।';

  @override
  String get requestAppointmentFailed =>
      'সেশনের অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।';

  @override
  String get contentTitle => 'পড়ুন ও দেখুন';

  @override
  String get rateThisContent => 'এটি রেট করুন';

  @override
  String get commentOptional => 'মন্তব্য (ঐচ্ছিক)';

  @override
  String get ratingSubmitFailed => 'রেটিং দেওয়া যায়নি। আবার চেষ্টা করুন।';

  @override
  String get watchTrackingNote =>
      'শেষ পর্যন্ত দেখলে আমরা এটিকে ‘দেখা হয়েছে’ হিসেবে চিহ্নিত করব।';

  @override
  String get watchCompleted => 'দেখা সম্পন্ন — দারুণ!';

  @override
  String ratedStars(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count তারকা দেওয়া হয়েছে',
      one: '১ তারকা দেওয়া হয়েছে',
    );
    return '$_temp0';
  }

  @override
  String get clientsTitle => 'ক্লায়েন্ট';

  @override
  String get clientTitle => 'ক্লায়েন্ট';

  @override
  String get assignMultipleScales => 'মানসিক যাচাই দিন';

  @override
  String get assignSelected => 'নির্বাচিত যাচাই দিন';

  @override
  String get assigning => 'দেওয়া হচ্ছে…';

  @override
  String get assignedScales => 'দেওয়া যাচাইসমূহ';

  @override
  String get selectAtLeastOneScale => 'অন্তত একটি যাচাই নির্বাচন করুন';

  @override
  String get assignFailed => 'মানসিক যাচাই দেওয়া যায়নি। আবার চেষ্টা করুন।';

  @override
  String get assignedTitle => 'আপনার জন্য নির্ধারিত';

  @override
  String get assignedSubtitle => 'আপনার বিশেষজ্ঞের অনুরোধ করা যাচাইসমূহ';

  @override
  String get assignedHomeDesc => 'আপনার বিশেষজ্ঞের দেওয়া যাচাই';

  @override
  String get assignedByProfessional => 'আপনার বিশেষজ্ঞের দেওয়া';

  @override
  String get assignedEmpty => 'এই মুহূর্তে কিছু নির্ধারিত নেই';

  @override
  String get errLoadAssigned =>
      'নির্ধারিত যাচাই লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get notificationsTitle => 'বিজ্ঞপ্তি';

  @override
  String get markReadFailed =>
      'পড়া হয়েছে চিহ্নিত করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get statusUnread => 'অপঠিত';

  @override
  String get statusRead => 'পঠিত';

  @override
  String get scalesTitle => 'মানসিক যাচাই';

  @override
  String get assessmentIntro =>
      'তাড়াহুড়ো নেই। কোনো উত্তর ঠিক বা ভুল নয় — মনের কথা সৎভাবে বলুন।';

  @override
  String get resultTitle => 'আপনার ফলাফল';

  @override
  String get resultIntro =>
      'এটি ভাবার জন্য একটি দিকনির্দেশনা, রোগনির্ণয় নয়। একজন বিশেষজ্ঞের সাথে কথা বলতে পারেন।';

  @override
  String get resultLabel => 'ফলাফল';

  @override
  String severityLabel(Object value) {
    return 'মাত্রা: $value';
  }

  @override
  String scoreLabel(Object value) {
    return 'স্কোর: $value';
  }

  @override
  String recommendationLabel(Object value) {
    return 'পরামর্শ: $value';
  }

  @override
  String get submissionFailed => 'জমা দেওয়া যায়নি। আবার চেষ্টা করুন।';

  @override
  String get followUpTitle => 'আপনার পরবর্তী পদক্ষেপ';

  @override
  String get followUpWatchResource => 'প্রস্তাবিত রিসোর্সটি দেখুন';

  @override
  String get followUpExploreResources => 'রিসোর্স দেখুন';

  @override
  String get followUpTalkToProfessional => 'বিশেষজ্ঞের সাথে কথা বলুন';

  @override
  String get followUpHelpCenter => 'এখনই সহায়তা নিন';

  @override
  String get followUpReassurance =>
      'এটি একটি সাময়িক চিত্র, কোনো রোগ নির্ণয় নয়। প্রয়োজনে সহায়তা সবসময় আছে।';

  @override
  String get helpCenterTitle => 'আপনি একা নন';

  @override
  String get helpCenterSubtitle => 'সহায়তা পাওয়া যাচ্ছে';

  @override
  String get helpCenterBody =>
      'যদি আপনার অনুভূতিগুলো সামলানো কঠিন হয়ে পড়ে, তবে কারো সাথে কথা বলা সাহায্য করতে পারে। আপনি QLife-এর মাধ্যমে একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে কথা বলতে পারেন, অথবা বিশ্বস্ত কারো সাথে মন খুলে কথা বলতে পারেন।';

  @override
  String get helpCenterUrgentTitle => 'আপনি যদি তাৎক্ষণিক বিপদে থাকেন';

  @override
  String get helpCenterUrgentBody =>
      'আপনি যদি নিজের ক্ষতি করার কথা ভাবছেন, তবে অনুগ্রহ করে এখনই সাহায্য নিন — আপনার স্থানীয় জরুরি সেবা বা বিশ্বস্ত কারো সাথে যোগাযোগ করুন। আপনি সহায়তা পাওয়ার যোগ্য।';

  @override
  String get helpCenterFindProfessional => 'বিশেষজ্ঞ খুঁজুন';

  @override
  String get helpCenterExploreResources => 'প্রশান্তিদায়ক রিসোর্স';

  @override
  String get helpCenterHotlinesTitle => 'জরুরি হেল্পলাইন';

  @override
  String get helpCenterTollFree => 'টোল ফ্রি';

  @override
  String get helpCenterCallError => 'ডায়ালার খোলা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get becomeProfessionalTitle => 'বিশেষজ্ঞ হিসেবে যোগ দিন';

  @override
  String get fieldFullName => 'পুরো নাম';

  @override
  String get fieldProfessionType => 'পেশার ধরন';

  @override
  String get fieldGenderOptional => 'লিঙ্গ (ঐচ্ছিক)';

  @override
  String get fieldDesignationOptional => 'পদবি (ঐচ্ছিক)';

  @override
  String get fieldPhoneOptional => 'ফোন নম্বর (ঐচ্ছিক)';

  @override
  String get selectProfessionType => 'অনুগ্রহ করে পেশার ধরন বেছে নিন।';

  @override
  String get registeredAsProfessional =>
      'বিশেষজ্ঞ হিসেবে নিবন্ধন সম্পন্ন হয়েছে';

  @override
  String get registrationFailed => 'নিবন্ধন হয়নি। আবার চেষ্টা করুন।';

  @override
  String get nameRequired => 'নাম দেওয়া আবশ্যক';

  @override
  String get professionClinicalPsychologist => 'ক্লিনিক্যাল মনোবিজ্ঞানী';

  @override
  String get professionAssistantClinicalPsychologist =>
      'সহকারী ক্লিনিক্যাল মনোবিজ্ঞানী';

  @override
  String get professionPsychiatrist => 'মনোরোগ বিশেষজ্ঞ';

  @override
  String get professionCounselor => 'কাউন্সেলর';

  @override
  String get professionOther => 'অন্যান্য';

  @override
  String get genderMale => 'পুরুষ';

  @override
  String get genderFemale => 'নারী';

  @override
  String get genderOther => 'অন্যান্য';

  @override
  String get genderUndisclosed => 'বলতে চাই না';

  @override
  String get maritalSingle => 'অবিবাহিত';

  @override
  String get maritalMarried => 'বিবাহিত';

  @override
  String get maritalDivorced => 'তালাকপ্রাপ্ত';

  @override
  String get maritalWidowed => 'বিধবা / বিপত্নীক';

  @override
  String get maritalSeparated => 'আলাদাভাবে বসবাস';

  @override
  String get maritalUndisclosed => 'বলতে চাই না';

  @override
  String get completeProfileTitle => 'প্রোফাইল সম্পূর্ণ করুন';

  @override
  String get completeProfileSubtitle =>
      'এটি আপনার অভিজ্ঞতা সাজাতে সাহায্য করে। আপনার তথ্য গোপন থাকবে।';

  @override
  String get fieldName => 'নাম';

  @override
  String get fieldDateOfBirth => 'জন্মতারিখ';

  @override
  String get fieldAgeYears => 'বয়স (বছর)';

  @override
  String get fieldGender => 'লিঙ্গ';

  @override
  String get fieldMaritalStatus => 'বৈবাহিক অবস্থা';

  @override
  String get fieldDistrict => 'জেলা';

  @override
  String get fieldUpazilaOptional => 'উপজেলা (ঐচ্ছিক)';

  @override
  String get fieldUnionOptional => 'ইউনিয়ন (ঐচ্ছিক)';

  @override
  String get selectGenderMaritalDistrict =>
      'অনুগ্রহ করে লিঙ্গ, বৈবাহিক অবস্থা ও জেলা বেছে নিন।';

  @override
  String get profileSaved => 'প্রোফাইল সংরক্ষণ হয়েছে';

  @override
  String get profileSaveFailed =>
      'প্রোফাইল সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get saveAndContinue => 'সংরক্ষণ করে চালিয়ে যান';

  @override
  String get ageRequired => 'সঠিক বয়স লিখুন';

  @override
  String get ageRange => 'বয়স ৫ থেকে ১৫০-এর মধ্যে হতে হবে';

  @override
  String get dobRequired => 'জন্মতারিখ দিন';

  @override
  String get dobRange => 'বয়স ৫–১৫০ বছরের মধ্যে হতে হবে';

  @override
  String labelAgeYears(int years) {
    return 'বয়স: $years বছর';
  }

  @override
  String get proOnboardingTitle => 'আপনার প্রোফাইল সাজান';

  @override
  String get proOnboardingSubtitle => 'ক্লায়েন্টরা আপনার সম্পর্কে একটু জানুক।';

  @override
  String get fieldWorkplaceOptional => 'কর্মস্থল (ঐচ্ছিক)';

  @override
  String get fieldYearsOptional => 'অভিজ্ঞতার বছর (ঐচ্ছিক)';

  @override
  String get fieldBioOptional => 'নিজের সম্পর্কে কিছু লিখুন (ঐচ্ছিক)';

  @override
  String get acceptingNewClients => 'নতুন ক্লায়েন্ট নিচ্ছি';

  @override
  String get showInDirectory => 'ক্লায়েন্টরা আমাকে খুঁজে পাক';

  @override
  String get visibleAfterApproval => 'অ্যাডমিন অনুমোদনের পরেই দৃশ্যমান হবে';

  @override
  String get finishOnboarding => 'সেটআপ সম্পন্ন করুন';

  @override
  String get onboardingCompleted => 'সব প্রস্তুত!';

  @override
  String get onboardingSaveFailed => 'সংরক্ষণ হয়নি। আবার চেষ্টা করুন।';

  @override
  String verificationStatus(Object status) {
    return 'যাচাই: $status';
  }

  @override
  String get nonNegativeInteger => 'শূন্য বা তার বেশি সংখ্যা লিখুন';

  @override
  String get onboardingRequiredHint =>
      'সম্পন্ন করার আগে আবশ্যক (* চিহ্নিত) ঘরগুলো পূরণ করুন।';

  @override
  String get sectionCredentials => 'পরিচয়পত্র';

  @override
  String get sectionPractice => 'আপনার প্র্যাকটিস';

  @override
  String get sectionFees => 'পরামর্শ ফি';

  @override
  String get sectionLocation => 'অবস্থান';

  @override
  String get sectionSpecializations => 'বিশেষায়িত ক্ষেত্র';

  @override
  String get sectionAvailability => 'সাপ্তাহিক সময়সূচি';

  @override
  String get sectionCaseload => 'বর্তমান ক্লায়েন্ট (ঐচ্ছিক)';

  @override
  String get sectionVisibility => 'দৃশ্যমানতা';

  @override
  String get fieldBmdcOptional => 'বিএমডিসি রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)';

  @override
  String get fieldGraduationBatchOptional => 'গ্র্যাজুয়েশন ব্যাচ (ঐচ্ছিক)';

  @override
  String get fieldEducation => 'শিক্ষাগত যোগ্যতা *';

  @override
  String get fieldFeeAmount => 'ফি (টাকা) *';

  @override
  String get fieldMaxWeeklyClients => 'সপ্তাহে সর্বোচ্চ ক্লায়েন্ট (ঐচ্ছিক)';

  @override
  String get fieldAvgWeeklyClients =>
      'বর্তমানে সপ্তাহে গড় ক্লায়েন্ট (ঐচ্ছিক)';

  @override
  String get fieldOtherSpecialization =>
      'অন্যান্য বিশেষায়িত ক্ষেত্র (উল্লেখ করুন)';

  @override
  String get fieldCaseloadLocation => 'অবস্থান';

  @override
  String get fieldCaseloadCount => 'ক্লায়েন্ট সংখ্যা';

  @override
  String get fieldWeekday => 'দিন';

  @override
  String get fieldStartTime => 'শুরু';

  @override
  String get fieldEndTime => 'শেষ';

  @override
  String get addAvailabilityWindow => 'সময় যোগ করুন';

  @override
  String get addCaseloadRow => 'অবস্থান যোগ করুন';

  @override
  String get specializationsRequiredHint => 'অন্তত একটি নির্বাচন করুন *';

  @override
  String get feeRequired => 'সঠিক পরামর্শ ফি লিখুন';

  @override
  String get educationRequired => 'আপনার শিক্ষাগত যোগ্যতা লিখুন';

  @override
  String get selectAtLeastOneSpecialization =>
      'অন্তত একটি বিশেষায়িত ক্ষেত্র নির্বাচন করুন';

  @override
  String get addAtLeastOneAvailability => 'অন্তত একটি সময়সূচি যোগ করুন';

  @override
  String get availabilityStartBeforeEnd =>
      'প্রতিটি সময়ের শুরু অবশ্যই শেষের আগে হতে হবে';

  @override
  String get otherSpecializationRequired =>
      'আপনার অন্যান্য বিশেষায়িত ক্ষেত্রটি উল্লেখ করুন';

  @override
  String get weekdaySunday => 'রবিবার';

  @override
  String get weekdayMonday => 'সোমবার';

  @override
  String get weekdayTuesday => 'মঙ্গলবার';

  @override
  String get weekdayWednesday => 'বুধবার';

  @override
  String get weekdayThursday => 'বৃহস্পতিবার';

  @override
  String get weekdayFriday => 'শুক্রবার';

  @override
  String get weekdaySaturday => 'শনিবার';

  @override
  String get consentTitle => 'শুরু করার আগে';

  @override
  String get consentSubtitle => 'আমরা কীভাবে আপনার তথ্য ব্যবহার করি';

  @override
  String get consentBody =>
      'QLife যাচাইকৃত সেলফ-চেকের মাধ্যমে আপনার মানসিক সুস্থতা বুঝতে সাহায্য করে এবং যোগ্য পেশাদারদের সাথে সংযুক্ত করে। আপনার উত্তরগুলো গোপন এবং কেবল আপনাকে প্রাসঙ্গিক পরামর্শ দিতে, এবং আপনি চাইলে আপনার সংযুক্ত পেশাদারের সাথে শেয়ার করতে ব্যবহৃত হয়। এই সেলফ-চেকগুলো স্ক্রিনিং ও সহায়তার জন্য — এগুলো কোনো চিকিৎসা নির্ণয় নয়। চালিয়ে গেলে আপনি এই উদ্দেশ্যে আপনার তথ্য ব্যবহারে সম্মতি দিচ্ছেন।';

  @override
  String get consentAgree => 'আমি বুঝেছি এবং সম্মত';

  @override
  String get consentMustAgree => 'চালিয়ে যেতে সম্মতি দিন';

  @override
  String get consentSaveFailed =>
      'সম্মতি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get fieldReferralSource => 'রেফারেলের উৎস (ঐচ্ছিক)';

  @override
  String get fieldYearsRequired => 'অভিজ্ঞতার বছর *';

  @override
  String get fieldPhoneRequired => 'ফোন *';

  @override
  String get fieldMaxWeeklyClientsRequired => 'সপ্তাহে সর্বোচ্চ ক্লায়েন্ট *';

  @override
  String get fieldAvgWeeklyClientsRequired =>
      'বর্তমানে সপ্তাহে গড় ক্লায়েন্ট *';

  @override
  String get requiredField => 'এই ঘরটি আবশ্যক';

  @override
  String get addAtLeastOneCaseload =>
      'আপনার বর্তমান ক্লায়েন্টসহ অন্তত একটি অবস্থান যোগ করুন';

  @override
  String get caseloadRequiredHint => 'অন্তত একটি অবস্থান যোগ করুন *';

  @override
  String get introTitle => 'দ্রুত সুস্থতা যাচাই';

  @override
  String get introSubtitle => 'সংক্ষিপ্ত ৫টি প্রশ্নের সেলফ-চেক';

  @override
  String get introBody =>
      'আপনার জন্য পরামর্শ ও কন্টেন্ট সাজাতে একটি দ্রুত সুস্থতা সেলফ-চেক দিন। এতে প্রায় এক মিনিট লাগে, আপনার উত্তর গোপন থাকে এবং এটি কোনো রোগ নির্ণয় নয়। এখন করতে পারেন অথবা পরে করতে পারেন।';

  @override
  String get introStart => 'সেলফ-চেক শুরু করুন';

  @override
  String get introLater => 'পরে করব';

  @override
  String get clientAssessmentsTitle => 'ক্লায়েন্টের ফলাফল';

  @override
  String get clientAssessmentsSubtitle => 'অ্যাসাইন করা ও নিজে নেওয়া সেলফ-চেক';

  @override
  String get viewClientResults => 'ফলাফল দেখুন';

  @override
  String get noClientAssessments => 'এখনও কোনো অ্যাসেসমেন্ট নেই';

  @override
  String get resultAnswersTitle => 'উত্তরসমূহ';

  @override
  String get resultNotCompleted => 'এখনও সম্পন্ন হয়নি';

  @override
  String get sourceSelf => 'নিজে নেওয়া';

  @override
  String get sourceAssigned => 'আপনার অ্যাসাইন করা';

  @override
  String scoreOutOf100(Object value) {
    return '১০০-এর মধ্যে $value';
  }

  @override
  String get errLoadResult => 'ফলাফলটি লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get actionBack => 'ফিরে যান';

  @override
  String get actionCancelAppointment => 'অ্যাপয়েন্টমেন্ট বাতিল করুন';

  @override
  String get confirmCancelAppointment =>
      'আপনি কি নিশ্চিত এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?';

  @override
  String get actionMarkComplete => 'সম্পন্ন হিসেবে চিহ্নিত করুন';

  @override
  String get actionMarkNoShow => 'অনুপস্থিত হিসেবে চিহ্নিত করুন';

  @override
  String get historyTitle => 'আপনার ইতিহাস';

  @override
  String get historySubtitle => 'আপনার পূর্বের ফলাফল, নতুনটি আগে';

  @override
  String get noHistory => 'এখনও কোনো পূর্বের ফলাফল নেই';

  @override
  String get viewHistory => 'ইতিহাস দেখুন';

  @override
  String get searchByName => 'নাম দিয়ে খুঁজুন';

  @override
  String get allProfessions => 'সব পেশা';

  @override
  String get labelFee => 'ফি';

  @override
  String get labelAvailability => 'সাপ্তাহিক সময়সূচি';

  @override
  String get labelAbout => 'পরিচিতি';

  @override
  String get labelEducation => 'শিক্ষা';

  @override
  String get noScheduleSet => 'এখনও কোনো সময়সূচি দেওয়া হয়নি';

  @override
  String get shareProfileWithPro => 'আমার প্রোফাইল শেয়ার করুন';

  @override
  String get shareProfileHint =>
      'এই পেশাদারকে আপনার সেলফ-চেকের ফলাফল দেখতে দিন';

  @override
  String get actionRequestAppointment => 'অ্যাপয়েন্টমেন্ট চান';

  @override
  String get notAcceptingClients =>
      'এই মুহূর্তে নতুন ক্লায়েন্ট নেওয়া হচ্ছে না';

  @override
  String get navChangePassword => 'পাসওয়ার্ড পরিবর্তন';

  @override
  String get navChangePasswordDesc =>
      'আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করুন';

  @override
  String get fieldCurrentPassword => 'বর্তমান পাসওয়ার্ড';

  @override
  String get fieldNewPassword => 'নতুন পাসওয়ার্ড';

  @override
  String get fieldConfirmPassword => 'নতুন পাসওয়ার্ড নিশ্চিত করুন';

  @override
  String get passwordMismatch => 'পাসওয়ার্ড মিলছে না';

  @override
  String get passwordTooShort => 'কমপক্ষে ৮টি অক্ষর ব্যবহার করুন';

  @override
  String get passwordChanged => 'পাসওয়ার্ড পরিবর্তন হয়েছে';

  @override
  String get changePasswordFailed =>
      'পাসওয়ার্ড পরিবর্তন করা যায়নি। আপনার বর্তমান পাসওয়ার্ড যাচাই করুন।';

  @override
  String get deactivateAccount => 'অ্যাকাউন্ট নিষ্ক্রিয় করুন';

  @override
  String get deactivateConfirm =>
      'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করবেন? আবার সাইন ইন করে পুনরায় সক্রিয় করতে পারবেন।';

  @override
  String get deactivated => 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে';

  @override
  String get deleteAccount => 'অ্যাকাউন্ট মুছুন';

  @override
  String get deleteConfirm =>
      'আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছবেন? আপনার শনাক্তকরণ তথ্য বেনামি করা হবে এবং এটি ফেরানো যাবে না।';

  @override
  String get deleted => 'আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে';

  @override
  String get accountActionFailed => 'কাজটি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String homeUnreadNotifications(Object count) {
    return '$count টি নতুন নোটিফিকেশন';
  }

  @override
  String get introNudgeTitle => 'আপনার দ্রুত সুস্থতা যাচাই করুন';

  @override
  String get introNudgeDesc => 'পরামর্শ ব্যক্তিগতকৃত করতে ১ মিনিটের সেলফ-চেক';

  @override
  String get fieldAgreeTerms => 'আমি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত';
}
