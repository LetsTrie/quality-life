import 'package:flutter/widgets.dart';

/// Helpers that produce display-ready scale names and category labels from
/// server-provided data. The server now returns `nameBn`, `categoryLabelEn`,
/// and `categoryLabelBn` on every instrument; the local maps below act as a
/// fallback only for slugs not yet populated on the backend.
const Map<String, String> _scaleNamesBnFallback = {
  'ghq-12': 'সাধারণ মানসিক স্বাস্থ্য যাচাই (GHQ-12)',
  'pss-10': 'মানসিক চাপ যাচাই (PSS-10)',
  'anxiety-36': 'দুশ্চিন্তা যাচাই (৩৬টি প্রশ্ন)',
  'wellbeing-5': 'মানসিক প্রশান্তি সূচক (WHO-5)',
  'depression_scale': 'বিষণ্নতা যাচাই',
  'dhaka_university_obsessive_compulsive_scale_(duocs)': 'অবসেসিভ-কম্পালসিভ যাচাই (DUOCS)',
  'somatic_complaints_scale': 'শারীরিক অস্বস্তি যাচাই',
  'dhaka_university_cognitive_distortion_scale_(ducds)': 'চিন্তার বিকৃতি যাচাই (DUCDS)',
  'aggression_scale': 'রাগ ও আগ্রাসন যাচাই',
  'satisfaction_with_life_scale': 'জীবনে সন্তুষ্টি যাচাই',
  'hopelessness_scale_(beck)': 'হতাশা যাচাই (Beck)',
  'social_interaction_anxiety_scale': 'সামাজিক মেলামেশায় উদ্বেগ যাচাই',
  'nicotine_addiction_scale': 'নিকোটিন আসক্তি যাচাই',
  'social_avoidance_and_distress_scale': 'সামাজিক এড়িয়ে চলা ও অস্বস্তি যাচাই',
};

bool isBanglaLocale(BuildContext context) =>
    Localizations.localeOf(context).languageCode == 'bn';

/// The display name for a scale.
///
/// Prefers the server-supplied [serverNameBn] (from `InstrumentSummary.nameBn`)
/// when the UI is in Bangla, otherwise shows the server [fallback] (English name).
/// Falls back to the local map if [serverNameBn] is null/empty (e.g. old cache).
String localizedScaleName(
  BuildContext context, {
  required String slug,
  required String fallback,
  String? serverNameBn,
}) {
  if (isBanglaLocale(context)) {
    final bn = serverNameBn?.isNotEmpty == true
        ? serverNameBn!
        : _scaleNamesBnFallback[slug];
    if (bn != null && bn.isNotEmpty) return bn;
  }
  return fallback;
}

/// A human-friendly, localized label for a raw scale category enum.
///
/// Prefers server-supplied [serverLabelEn]/[serverLabelBn] when available.
/// Returns null when [raw] is null/empty so callers can hide the line.
String? localizedScaleCategory(
  BuildContext context,
  String? raw, {
  String? serverLabelEn,
  String? serverLabelBn,
}) {
  if (raw == null || raw.trim().isEmpty) return null;

  if (isBanglaLocale(context) && serverLabelBn?.isNotEmpty == true) {
    return serverLabelBn;
  }
  if (!isBanglaLocale(context) && serverLabelEn?.isNotEmpty == true) {
    return serverLabelEn;
  }

  // Legacy fallback: title-case the raw enum.
  return raw
      .replaceAll('_', ' ')
      .toLowerCase()
      .replaceFirstMapped(RegExp(r'^\w'), (m) => m[0]!.toUpperCase());
}
