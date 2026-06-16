import 'package:flutter/widgets.dart';

import '../../../l10n/gen/app_localizations.dart';

export '../../../l10n/gen/app_localizations.dart';

/// Ergonomic access to localized strings: `context.l10n.someKey`.
extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}
