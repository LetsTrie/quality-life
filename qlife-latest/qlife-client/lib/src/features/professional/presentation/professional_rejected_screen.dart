import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../auth/state/auth_state.dart';

/// Shown to a professional whose verification was REJECTED. They are routed
/// here instead of the dashboard (see router redirect). Kept calm and polite —
/// no raw status enums, no dead-end.
class ProfessionalRejectedScreen extends ConsumerWidget {
  const ProfessionalRejectedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const AppIllustration(AppArt.empty, height: 140),
                const Gap(AppSpacing.xl),
                Text(
                  l.proRejectedHeadline,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const Gap(AppSpacing.md),
                Text(
                  l.proRejectedBody,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const Gap(AppSpacing.md),
                Text(
                  l.proRejectedContact,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const Gap(AppSpacing.xxl),
                FilledButton.icon(
                  onPressed: () =>
                      ref.read(authStateProvider.notifier).signOut(),
                  icon: const Icon(Icons.logout_rounded),
                  label: Text(l.actionSignOut),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
