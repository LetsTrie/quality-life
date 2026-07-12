import 'package:flutter/widgets.dart';

/// User-friendly, locale-aware date/time formatting for appointment times.
///
/// Backend timestamps are ISO-8601 UTC strings; these helpers parse them,
/// convert to the device's local time, and render a warm, readable string with
/// the day name — e.g. `Tue, 15 Jul 2026 · 4:00 PM` (en) or
/// `মঙ্গলবার, ১৫ জুলাই ২০২৬ · বিকাল ৪:০০` (bn).
///
/// Implemented without `intl`'s locale symbol data (which isn't initialized in
/// this app) so it works fully offline with Bangla numerals and names.

const _weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const _weekdaysBn = [
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
  'রবিবার',
];
const _monthsEn = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const _monthsBn = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];
const _bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

String _bnNum(int n) {
  final s = n.toString();
  final buf = StringBuffer();
  for (final ch in s.runes) {
    final d = ch - 0x30;
    buf.write(d >= 0 && d <= 9 ? _bnDigits[d] : String.fromCharCode(ch));
  }
  return buf.toString();
}

/// Bangla time-of-day period word for a 24h hour.
String _bnPeriod(int hour24) {
  if (hour24 < 4) return 'রাত';
  if (hour24 < 6) return 'ভোর';
  if (hour24 < 12) return 'সকাল';
  if (hour24 < 16) return 'দুপুর';
  if (hour24 < 18) return 'বিকাল';
  if (hour24 < 20) return 'সন্ধ্যা';
  return 'রাত';
}

/// Formats an ISO-8601 UTC timestamp for display. Returns `null` when [iso] is
/// null/blank/unparseable so callers can fall back to a dash.
String? friendlyDateTime(String? iso, Locale locale) {
  if (iso == null || iso.trim().isEmpty) return null;
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return null;
  final dt = parsed.toLocal();

  final isBn = locale.languageCode == 'bn';
  final weekday = isBn ? _weekdaysBn[dt.weekday - 1] : _weekdaysEn[dt.weekday - 1];
  final month = isBn ? _monthsBn[dt.month - 1] : _monthsEn[dt.month - 1];

  final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;

  if (isBn) {
    final day = _bnNum(dt.day);
    final year = _bnNum(dt.year);
    final min = _bnNum(dt.minute).padLeft(2, '০');
    final h = _bnNum(hour12);
    return '$weekday, $day $month $year · ${_bnPeriod(dt.hour)} $h:$min';
  }

  final min = dt.minute.toString().padLeft(2, '0');
  final ampm = dt.hour < 12 ? 'AM' : 'PM';
  return '$weekday, ${dt.day} $month ${dt.year} · $hour12:$min $ampm';
}
