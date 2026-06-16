import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../shared/l10n/l10n_extension.dart';
import '../shared/theme/app_theme.dart';
import 'router.dart';

class QLifeApp extends ConsumerWidget {
  const QLifeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      onGenerateTitle: (context) => context.l10n.appTitle,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      // The audience is primarily Bangla-speaking, so default to Bangla.
      // Remove `locale` to instead follow the device's locale (falls back to
      // the first supported locale — English — when the device isn't Bangla).
      locale: const Locale('bn'),
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      routerConfig: router,
    );
  }
}

