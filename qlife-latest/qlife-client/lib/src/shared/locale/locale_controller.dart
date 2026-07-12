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
    try {
      final code = await _storage.read(key: _storageKey);
      if (code != null && code.isNotEmpty && code != state.languageCode) {
        state = Locale(code);
      }
    } catch (_) {
      // Storage may be unavailable (e.g. in tests / before plugins load) —
      // fall back to the default rather than surfacing an unhandled error.
    }
  }

  Future<void> setLocale(Locale locale) async {
    if (locale.languageCode == state.languageCode) return;
    state = locale;
    await _storage.write(key: _storageKey, value: locale.languageCode);
  }

  /// The persisted language code (falls back to the in-memory state, then the
  /// default). Read directly from storage so callers don't race the async
  /// [_restore] that runs after first build — used to sync the backend's
  /// `preferredLocale` at session start.
  Future<String> storedLocaleCode() async {
    final code = await _storage.read(key: _storageKey);
    if (code != null && code.isNotEmpty) return code;
    return state.languageCode;
  }
}
