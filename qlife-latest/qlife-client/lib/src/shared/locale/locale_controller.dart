import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// The app's currently selected locale, persisted across launches.
///
/// Defaults to English. The stored preference is loaded
/// asynchronously after first build; until then the default is shown.
final localeControllerProvider = NotifierProvider<LocaleController, Locale>(
  LocaleController.new,
);

class LocaleController extends Notifier<Locale> {
  static const _storageKey = 'app_locale';
  static const _storage = FlutterSecureStorage();

  /// Default to English.
  static const _fallback = Locale('en');

  @override
  Locale build() {
    _restore();
    return _fallback;
  }

  Future<void> _restore() async {
    final code = await _storage.read(key: _storageKey);
    if (code != null && code.isNotEmpty && code != state.languageCode) {
      state = Locale(code);
    }
  }

  Future<void> setLocale(Locale locale) async {
    if (locale.languageCode == state.languageCode) return;
    state = locale;
    await _storage.write(key: _storageKey, value: locale.languageCode);
  }
}
