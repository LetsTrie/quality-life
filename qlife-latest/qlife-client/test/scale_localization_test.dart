// Tests for localized scale-name/category resolution. These read the locale off
// a BuildContext, so they run as widget tests with a minimal Localizations host.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/instruments/scale_localization.dart';

Future<BuildContext> _contextFor(WidgetTester tester, Locale locale) async {
  late BuildContext captured;
  await tester.pumpWidget(
    Localizations(
      locale: locale,
      delegates: const [
        DefaultMaterialLocalizations.delegate,
        DefaultWidgetsLocalizations.delegate,
      ],
      child: Builder(
        builder: (context) {
          captured = context;
          return const SizedBox.shrink();
        },
      ),
    ),
  );
  return captured;
}

void main() {
  group('localizedScaleName', () {
    testWidgets('prefers the server-supplied Bangla name in bn locale', (tester) async {
      final ctx = await _contextFor(tester, const Locale('bn'));
      final name = localizedScaleName(
        ctx,
        slug: 'ghq-12',
        fallback: 'General Health',
        serverNameBn: 'জিএইচকিউ-১২',
      );
      expect(name, 'জিএইচকিউ-১২');
    });

    testWidgets('falls back to the local Bangla map when server name is empty', (tester) async {
      final ctx = await _contextFor(tester, const Locale('bn'));
      final name = localizedScaleName(
        ctx,
        slug: 'ghq-12',
        fallback: 'General Health',
        serverNameBn: '',
      );
      expect(name, 'সাধারণ মানসিক স্বাস্থ্য যাচাই (GHQ-12)');
    });

    testWidgets('returns the English fallback for an unknown slug in bn locale', (tester) async {
      final ctx = await _contextFor(tester, const Locale('bn'));
      final name = localizedScaleName(ctx, slug: 'unknown-slug', fallback: 'My Scale');
      expect(name, 'My Scale');
    });

    testWidgets('returns the English fallback in en locale', (tester) async {
      final ctx = await _contextFor(tester, const Locale('en'));
      final name = localizedScaleName(
        ctx,
        slug: 'ghq-12',
        fallback: 'General Health',
        serverNameBn: 'জিএইচকিউ-১২',
      );
      expect(name, 'General Health');
    });

    testWidgets('uses the local Bangla map for known slugs without server data', (tester) async {
      final ctx = await _contextFor(tester, const Locale('bn'));
      final name = localizedScaleName(ctx, slug: 'pss-10', fallback: 'Perceived Stress');
      expect(name, 'মানসিক চাপ যাচাই (PSS-10)');
    });
  });

  group('localizedScaleCategory', () {
    testWidgets('returns null for null/empty raw', (tester) async {
      final ctx = await _contextFor(tester, const Locale('en'));
      expect(localizedScaleCategory(ctx, null), isNull);
      expect(localizedScaleCategory(ctx, '   '), isNull);
    });

    testWidgets('prefers server labels per locale', (tester) async {
      final bn = await _contextFor(tester, const Locale('bn'));
      expect(
        localizedScaleCategory(bn, 'MOOD', serverLabelEn: 'Mood', serverLabelBn: 'মেজাজ'),
        'মেজাজ',
      );
      final en = await _contextFor(tester, const Locale('en'));
      expect(
        localizedScaleCategory(en, 'MOOD', serverLabelEn: 'Mood', serverLabelBn: 'মেজাজ'),
        'Mood',
      );
    });

    testWidgets('title-cases the raw enum when no server label is available', (tester) async {
      final ctx = await _contextFor(tester, const Locale('en'));
      expect(localizedScaleCategory(ctx, 'MOOD_DISORDER'), 'Mood disorder');
    });

    testWidgets('title-cases in bn locale when server labels are absent', (tester) async {
      final ctx = await _contextFor(tester, const Locale('bn'));
      expect(localizedScaleCategory(ctx, 'ANXIETY'), 'Anxiety');
    });

    testWidgets('falls back to title-case when server labels are null', (tester) async {
      final ctx = await _contextFor(tester, const Locale('en'));
      expect(localizedScaleCategory(ctx, 'STRESS'), 'Stress');
    });
  });
}
