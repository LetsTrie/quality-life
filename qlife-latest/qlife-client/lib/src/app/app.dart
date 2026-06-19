import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../shared/l10n/l10n_extension.dart';
import '../shared/locale/locale_controller.dart';
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
      // The audience is primarily Bangla-speaking, so the controller defaults
      // to Bangla; users can switch (and the choice persists) from Account.
      locale: ref.watch(localeControllerProvider),
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      routerConfig: router,
    );
  }
}

