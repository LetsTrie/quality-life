// Tests for hotline parsing and the tel:/wa.me URI building used by tap-to-call.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/help/data/help_center_hotlines.dart';

void main() {
  group('HotlineContact.fromJson', () {
    test('maps WHATSAPP channel (case-insensitive) to the whatsapp type', () {
      final c = HotlineContact.fromJson({'value': '01711000000', 'channel': 'whatsapp'});
      expect(c.type, HotlineContactType.whatsapp);
      expect(c.number, '01711000000');
    });

    test('defaults to phone for any other / missing channel', () {
      expect(HotlineContact.fromJson({'value': '999'}).type, HotlineContactType.phone);
      expect(
        HotlineContact.fromJson({'value': '999', 'channel': 'PHONE'}).type,
        HotlineContactType.phone,
      );
    });

    test('reads tollFree flag and availability note', () {
      final c = HotlineContact.fromJson({
        'value': '999',
        'isTollFree': true,
        'availabilityNote': '24/7',
      });
      expect(c.tollFree, true);
      expect(c.time(false), '24/7');
    });

    test('tollFree defaults to false', () {
      expect(HotlineContact.fromJson({'value': '999'}).tollFree, false);
    });
  });

  group('HotlineContact.uri', () {
    test('phone contacts produce a tel: URI', () {
      const c = HotlineContact(number: '16263');
      expect(c.uri.scheme, 'tel');
      expect(c.uri.path, '16263');
    });

    test('whatsapp local number (01...) is converted to +880 wa.me link', () {
      const c = HotlineContact(number: '01711000000', type: HotlineContactType.whatsapp);
      expect(c.uri.toString(), 'https://wa.me/8801711000000');
    });

    test('whatsapp non-local number is passed through unchanged', () {
      const c = HotlineContact(number: '8801711000000', type: HotlineContactType.whatsapp);
      expect(c.uri.toString(), 'https://wa.me/8801711000000');
    });

    test('phone contact preserves toll-free short codes', () {
      const c = HotlineContact(number: '999', tollFree: true);
      expect(c.uri.scheme, 'tel');
      expect(c.uri.path, '999');
      expect(c.tollFree, true);
    });
  });

  group('HotlineContact.time', () {
    test('returns the availability note regardless of locale flag', () {
      const c = HotlineContact(number: '999', availabilityNote: '24/7');
      expect(c.time(true), '24/7');
      expect(c.time(false), '24/7');
    });

    test('returns null when no note was supplied', () {
      const c = HotlineContact(number: '999');
      expect(c.time(true), isNull);
    });
  });

  group('HotlineGroup', () {
    test('place() switches on the bangla flag', () {
      const g = HotlineGroup(nameBn: 'কাণ্ডারি', nameEn: 'Kaan Pete Roi', contacts: []);
      expect(g.place(true), 'কাণ্ডারি');
      expect(g.place(false), 'Kaan Pete Roi');
    });

    test('fromJson parses nested contacts', () {
      final g = HotlineGroup.fromJson({
        'nameBn': 'ক',
        'nameEn': 'K',
        'contacts': [
          {'value': '01711000000', 'channel': 'WHATSAPP'},
          {'value': '999'},
        ],
      });
      expect(g.contacts, hasLength(2));
      expect(g.contacts.first.type, HotlineContactType.whatsapp);
      expect(g.contacts.last.type, HotlineContactType.phone);
    });

    test('fromJson tolerates an empty contacts list and reads locationNote', () {
      final g = HotlineGroup.fromJson({
        'nameBn': 'ক',
        'nameEn': 'K',
        'locationNote': 'Dhaka only',
        'contacts': [],
      });
      expect(g.contacts, isEmpty);
      expect(g.locationNote, 'Dhaka only');
      expect(g.location(true), 'Dhaka only');
    });

    test('fromJson applies safe defaults for missing name fields', () {
      final g = HotlineGroup.fromJson({'contacts': []});
      expect(g.nameBn, '');
      expect(g.nameEn, '');
      expect(g.place(true), '');
    });
  });

  group('isBanglaLocale', () {
    testWidgets('is true only for bn languageCode', (tester) async {
      late bool bn;
      late bool en;
      await tester.pumpWidget(
        Localizations(
          locale: const Locale('bn'),
          delegates: const [
            DefaultMaterialLocalizations.delegate,
            DefaultWidgetsLocalizations.delegate,
          ],
          child: Builder(
            builder: (context) {
              bn = isBanglaLocale(context);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      await tester.pumpWidget(
        Localizations(
          locale: const Locale('en'),
          delegates: const [
            DefaultMaterialLocalizations.delegate,
            DefaultWidgetsLocalizations.delegate,
          ],
          child: Builder(
            builder: (context) {
              en = isBanglaLocale(context);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(bn, true);
      expect(en, false);
    });
  });
}
