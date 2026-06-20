// PhoneFieldController parsing/composition and PhoneField validation rules.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/l10n/gen/app_localizations.dart';
import 'package:qlife/src/shared/widgets/phone_field.dart';

Future<GlobalKey<FormState>> _pumpPhoneField(
  WidgetTester tester, {
  required PhoneFieldController controller,
  bool isRequired = false,
}) async {
  final formKey = GlobalKey<FormState>();
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: Scaffold(
        body: Form(
          key: formKey,
          child: PhoneField(
            controller: controller,
            label: 'Phone',
            isRequired: isRequired,
          ),
        ),
      ),
    ),
  );
  return formKey;
}

void main() {
  group('PhoneFieldController.seed', () {
    test('splits a stored +880 E.164 value into dial code and national digits', () {
      final c = PhoneFieldController();
      c.seed('+8801712345678');
      expect(c.dialCode, '+880');
      expect(c.number.text, '1712345678');
    });

    test('matches the longest dial prefix (+1 must not shadow +971)', () {
      final c = PhoneFieldController();
      c.seed('+971501234567');
      expect(c.dialCode, '+971');
      expect(c.number.text, '501234567');
    });

    test('strips non-digits when no known dial code prefixes the value', () {
      final c = PhoneFieldController();
      c.seed('017-1234-5678');
      expect(c.dialCode, phoneDefaultDialCode);
      expect(c.number.text, '01712345678');
    });

    test('ignores null/empty input', () {
      final c = PhoneFieldController(number: '1712345678');
      c.seed(null);
      expect(c.number.text, '1712345678');
      c.seed('   ');
      expect(c.number.text, '1712345678');
    });
  });

  group('PhoneFieldController.compose', () {
    test('drops the leading trunk 0 for Bangladesh numbers', () {
      final c = PhoneFieldController(dialCode: '+880', number: '01712345678');
      expect(c.nationalNumber(), '1712345678');
      expect(c.compose(), '+8801712345678');
    });

    test('returns null when the national number is empty', () {
      final c = PhoneFieldController();
      expect(c.isEmpty, true);
      expect(c.compose(), isNull);
    });

    test('keeps non-BD numbers as digits-only national significant number', () {
      final c = PhoneFieldController(dialCode: '+44', number: '7700900123');
      expect(c.compose(), '+447700900123');
    });
  });

  group('PhoneField validation', () {
    testWidgets('optional field accepts empty input', (tester) async {
      final c = PhoneFieldController();
      final formKey = await _pumpPhoneField(tester, controller: c);
      expect(formKey.currentState!.validate(), true);
    });

    testWidgets('required field rejects empty input', (tester) async {
      final c = PhoneFieldController();
      final formKey = await _pumpPhoneField(tester, controller: c, isRequired: true);
      expect(formKey.currentState!.validate(), false);
    });

    testWidgets('accepts a valid Bangladeshi mobile (013–019)', (tester) async {
      final c = PhoneFieldController(dialCode: '+880', number: '01712345678');
      final formKey = await _pumpPhoneField(tester, controller: c, isRequired: true);
      expect(formKey.currentState!.validate(), true);
    });

    testWidgets('rejects an invalid Bangladeshi mobile', (tester) async {
      final c = PhoneFieldController(dialCode: '+880', number: '0212345678');
      final formKey = await _pumpPhoneField(tester, controller: c, isRequired: true);
      expect(formKey.currentState!.validate(), false);
    });

    testWidgets('rejects international numbers shorter than 6 digits', (tester) async {
      final c = PhoneFieldController(dialCode: '+44', number: '12345');
      final formKey = await _pumpPhoneField(tester, controller: c, isRequired: true);
      expect(formKey.currentState!.validate(), false);
    });

    testWidgets('accepts a valid international number', (tester) async {
      final c = PhoneFieldController(dialCode: '+44', number: '7700900123');
      final formKey = await _pumpPhoneField(tester, controller: c, isRequired: true);
      expect(formKey.currentState!.validate(), true);
    });
  });
}
