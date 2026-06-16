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
  String get navScales => 'স্কেল';

  @override
  String get navProfessionals => 'পেশাদারগণ';

  @override
  String get navAppointments => 'অ্যাপয়েন্টমেন্ট';

  @override
  String get navNotifications => 'বিজ্ঞপ্তি';

  @override
  String get navContent => 'কনটেন্ট';

  @override
  String get navBecomeProfessional => 'পেশাদার হিসেবে যোগ দিন';

  @override
  String get actionSignOut => 'সাইন আউট';

  @override
  String get signInTitle => 'সাইন ইন';

  @override
  String get signInContinue => 'Cognito দিয়ে চালিয়ে যান';

  @override
  String get professionalTitle => 'পেশাদার';

  @override
  String get proAppointmentRequests => 'অ্যাপয়েন্টমেন্ট অনুরোধ';

  @override
  String get proMyClients => 'আমার ক্লায়েন্ট';

  @override
  String get actionCancel => 'বাতিল';

  @override
  String get actionSubmit => 'জমা দিন';

  @override
  String get actionSubmitting => 'জমা দেওয়া হচ্ছে…';

  @override
  String get actionContinue => 'চালিয়ে যান';

  @override
  String get actionConfirm => 'নিশ্চিত করুন';

  @override
  String get actionAccept => 'গ্রহণ করুন';

  @override
  String get actionDecline => 'প্রত্যাখ্যান করুন';

  @override
  String get actionMarkSeen => 'দেখা হয়েছে চিহ্নিত করুন';

  @override
  String get actionProposeReschedule => 'পুনঃনির্ধারণের প্রস্তাব দিন';

  @override
  String get actionSaving => 'সংরক্ষণ করা হচ্ছে…';

  @override
  String get errLoadAppointments =>
      'অ্যাপয়েন্টমেন্ট লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadAppointmentDetail =>
      'অ্যাপয়েন্টমেন্টের বিবরণ লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadClients => 'ক্লায়েন্ট লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadClientDetail =>
      'ক্লায়েন্টের বিবরণ লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadContent => 'কনটেন্ট লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadNotifications =>
      'বিজ্ঞপ্তি লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadProfessionals =>
      'পেশাদারদের তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadScales => 'স্কেল লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get errLoadScalesRefresh => 'স্কেল লোড করা যায়নি। রিফ্রেশ করুন।';

  @override
  String get errLoadScaleDetail =>
      'এই স্কেলটি লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।';

  @override
  String get errLoadProfile => 'প্রোফাইল লোড করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get emptyAppointments => 'এখনও কোনো অ্যাপয়েন্টমেন্ট নেই';

  @override
  String get emptyClients => 'এখনও কোনো ক্লায়েন্ট নেই';

  @override
  String get emptyContent => 'এখনও কোনো কনটেন্ট নেই';

  @override
  String get emptyProfessionals => 'কোনো পেশাদার উপলব্ধ নেই';

  @override
  String get emptyScales => 'কোনো স্কেল উপলব্ধ নেই';

  @override
  String get emptyNotifications => 'আপনার কোনো বিজ্ঞপ্তি নেই';

  @override
  String get appointmentTitle => 'অ্যাপয়েন্টমেন্ট';

  @override
  String fieldStatus(Object value) {
    return 'স্ট্যাটাস: $value';
  }

  @override
  String fieldRequested(Object value) {
    return 'অনুরোধ করা হয়েছে: $value';
  }

  @override
  String fieldScheduled(Object value) {
    return 'নির্ধারিত: $value';
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
    return 'পেশাদারের বার্তা: $value';
  }

  @override
  String get valueDash => '—';

  @override
  String get apptRequested => 'অ্যাপয়েন্টমেন্টের অনুরোধ পাঠানো হয়েছে';

  @override
  String get apptActionFailed => 'কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get apptMarkSeenFailed =>
      'দেখা হয়েছে চিহ্নিত করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get fieldMeetingLinkInput => 'মিটিং লিঙ্ক / ঠিকানা (ঐচ্ছিক)';

  @override
  String get fieldMessageOptional => 'বার্তা (ঐচ্ছিক)';

  @override
  String requestAppointmentWith(Object name) {
    return '$name এর সাথে অ্যাপয়েন্টমেন্টের অনুরোধ';
  }

  @override
  String get selectDate => 'তারিখ নির্বাচন করুন';

  @override
  String get selectTime => 'সময় নির্বাচন করুন';

  @override
  String get selectDateTimeError =>
      'অনুগ্রহ করে একটি তারিখ ও সময় নির্বাচন করুন।';

  @override
  String get requestAppointmentFailed =>
      'অ্যাপয়েন্টমেন্টের অনুরোধ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get contentTitle => 'কনটেন্ট';

  @override
  String get rateThisContent => 'এই কনটেন্টটি রেট করুন';

  @override
  String get commentOptional => 'মন্তব্য (ঐচ্ছিক)';

  @override
  String get ratingSubmitFailed => 'রেটিং জমা দেওয়া যায়নি। আবার চেষ্টা করুন।';

  @override
  String ratedStars(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$countটি তারকা দেওয়া হয়েছে',
      one: '১টি তারকা দেওয়া হয়েছে',
    );
    return '$_temp0';
  }

  @override
  String get clientsTitle => 'ক্লায়েন্ট';

  @override
  String get clientTitle => 'ক্লায়েন্ট';

  @override
  String get assignMultipleScales => 'একাধিক স্কেল বরাদ্দ করুন';

  @override
  String get assignSelected => 'নির্বাচিত স্কেল বরাদ্দ করুন';

  @override
  String get assigning => 'বরাদ্দ করা হচ্ছে…';

  @override
  String get assignedScales => 'স্কেল বরাদ্দ করা হয়েছে';

  @override
  String get selectAtLeastOneScale => 'অন্তত একটি স্কেল নির্বাচন করুন';

  @override
  String get assignFailed => 'স্কেল বরাদ্দ করা যায়নি। আবার চেষ্টা করুন।';

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
  String get scalesTitle => 'স্কেল';

  @override
  String get resultLabel => 'ফলাফল';

  @override
  String severityLabel(Object value) {
    return 'তীব্রতা: $value';
  }

  @override
  String scoreLabel(Object value) {
    return 'স্কোর: $value';
  }

  @override
  String recommendationLabel(Object value) {
    return 'সুপারিশ: $value';
  }

  @override
  String get submissionFailed => 'জমা দেওয়া ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get becomeProfessionalTitle => 'পেশাদার হিসেবে যোগ দিন';

  @override
  String get fieldFullName => 'পুরো নাম';

  @override
  String get fieldProfessionType => 'পেশার ধরন';

  @override
  String get fieldGenderOptional => 'লিঙ্গ (ঐচ্ছিক)';

  @override
  String get fieldDesignationOptional => 'পদবি (ঐচ্ছিক)';

  @override
  String get fieldPhoneOptional => 'ফোন (ঐচ্ছিক)';

  @override
  String get selectProfessionType => 'অনুগ্রহ করে পেশার ধরন নির্বাচন করুন।';

  @override
  String get registeredAsProfessional => 'পেশাদার হিসেবে নিবন্ধিত হয়েছে';

  @override
  String get registrationFailed => 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get nameRequired => 'নাম আবশ্যক';

  @override
  String get professionClinicalPsychologist => 'ক্লিনিক্যাল সাইকোলজিস্ট';

  @override
  String get professionAssistantClinicalPsychologist =>
      'সহকারী ক্লিনিক্যাল সাইকোলজিস্ট';

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
  String get maritalWidowed => 'বিধবা/বিপত্নীক';

  @override
  String get maritalSeparated => 'পৃথকভাবে বসবাসকারী';

  @override
  String get maritalUndisclosed => 'বলতে চাই না';

  @override
  String get completeProfileTitle => 'প্রোফাইল সম্পূর্ণ করুন';

  @override
  String get fieldName => 'নাম';

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
      'অনুগ্রহ করে লিঙ্গ, বৈবাহিক অবস্থা ও জেলা নির্বাচন করুন।';

  @override
  String get profileSaved => 'প্রোফাইল সংরক্ষণ করা হয়েছে';

  @override
  String get profileSaveFailed =>
      'প্রোফাইল সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get saveAndContinue => 'সংরক্ষণ করে চালিয়ে যান';

  @override
  String get ageRequired => 'সঠিক বয়স আবশ্যক';

  @override
  String get ageRange => 'বয়স ৫–১৫০ এর মধ্যে হতে হবে';

  @override
  String get proOnboardingTitle => 'পেশাদার অনবোর্ডিং';

  @override
  String get fieldWorkplaceOptional => 'কর্মস্থল (ঐচ্ছিক)';

  @override
  String get fieldYearsOptional => 'অভিজ্ঞতার বছর (ঐচ্ছিক)';

  @override
  String get fieldBioOptional => 'পরিচিতি (ঐচ্ছিক)';

  @override
  String get acceptingNewClients => 'নতুন ক্লায়েন্ট গ্রহণ করছি';

  @override
  String get showInDirectory => 'ডিরেক্টরিতে দেখান';

  @override
  String get visibleAfterApproval => 'শুধুমাত্র অ্যাডমিন অনুমোদনের পর দৃশ্যমান';

  @override
  String get finishOnboarding => 'অনবোর্ডিং সম্পন্ন করুন';

  @override
  String get onboardingCompleted => 'অনবোর্ডিং সম্পন্ন হয়েছে';

  @override
  String get onboardingSaveFailed => 'সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String verificationStatus(Object status) {
    return 'যাচাই: $status';
  }

  @override
  String get nonNegativeInteger => 'একটি অঋণাত্মক সংখ্যা লিখুন';
}
