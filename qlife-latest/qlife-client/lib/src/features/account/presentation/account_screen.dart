import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/locale/locale_controller.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/state/auth_state.dart';
import '../data/account_repository.dart';

/// The "More" / account hub. Surfaces secondary destinations and sign-out,
/// tailored to whether the person uses QLife for care or provides it.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  Future<void> _confirmAndRun(
    BuildContext context,
    WidgetRef ref, {
    required String title,
    required String message,
    required String confirmLabel,
    required Future<void> Function() action,
    required String successMessage,
  }) async {
    final l = context.l10n;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(l.actionCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: Text(confirmLabel),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await action();
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(successMessage)));
      }
      await ref.read(authStateProvider.notifier).signOut();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(l.accountActionFailed)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final role = ref.watch(appSessionProvider).valueOrNull?.role;
    final isPro = role == 'PROFESSIONAL';

    return Scaffold(
      body: Column(
        children: [
          GradientHeader(title: l.accountTitle),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.page),
              children: [
                if (!isPro) ...[
                  FeatureCard(
                    icon: Icons.person_outline_rounded,
                    title: l.navProfile,
                    subtitle: l.navProfileDesc,
                    onTap: () => context.push(const ProfileRoute().location),
                  ),
                  const Gap(AppSpacing.md),
                  FeatureCard(
                    icon: Icons.menu_book_outlined,
                    title: l.navContent,
                    subtitle: l.navContentDesc,
                    tint: AppColors.tertiary,
                    onTap: () =>
                        context.push(const ContentLibraryRoute().location),
                  ),
                  const Gap(AppSpacing.md),
                ],
                FeatureCard(
                  icon: Icons.notifications_none_rounded,
                  title: l.navNotifications,
                  subtitle: l.navNotificationsDesc,
                  tint: AppColors.secondary,
                  onTap: () =>
                      context.push(const NotificationsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.lock_outline_rounded,
                  title: l.navChangePassword,
                  subtitle: l.navChangePasswordDesc,
                  tint: AppColors.secondary,
                  onTap: () =>
                      context.push(const ChangePasswordRoute().location),
                ),
                const Gap(AppSpacing.lg),
                const _LanguageToggle(),
                const Gap(AppSpacing.xl),
                FilledButton.icon(
                  onPressed: () =>
                      ref.read(authStateProvider.notifier).signOut(),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFD32F2F),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.logout_rounded),
                  label: Text(l.actionSignOut),
                ),
                const Gap(AppSpacing.lg),
                TextButton(
                  onPressed: () => _confirmAndRun(
                    context,
                    ref,
                    title: l.deactivateAccount,
                    message: l.deactivateConfirm,
                    confirmLabel: l.deactivateAccount,
                    action: () =>
                        ref.read(accountRepositoryProvider).deactivate(),
                    successMessage: l.deactivated,
                  ),
                  child: Text(l.deactivateAccount),
                ),
                TextButton(
                  onPressed: () => _confirmAndRun(
                    context,
                    ref,
                    title: l.deleteAccount,
                    message: l.deleteConfirm,
                    confirmLabel: l.deleteAccount,
                    action: () async {
                      // Anonymize the local record (while the JWT is valid),
                      // then remove the Cognito login (best-effort).
                      await ref.read(accountRepositoryProvider).deleteAccount();
                      try {
                        await ref
                            .read(authRepositoryProvider)
                            .deleteCognitoUser();
                      } catch (_) {}
                    },
                    successMessage: l.deleted,
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.error,
                  ),
                  child: Text(l.deleteAccount),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact language switcher. Toggles between Bangla and English; the choice
/// persists via [localeControllerProvider]. Language names are shown as
/// endonyms (same in either locale).
class _LanguageToggle extends ConsumerWidget {
  const _LanguageToggle();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final code = ref.watch(localeControllerProvider).languageCode;
    final controller = ref.read(localeControllerProvider.notifier);

    return AppCard(
      child: Row(
        children: [
          const Icon(Icons.translate_rounded, color: AppColors.secondary),
          const Gap.horizontal(AppSpacing.md),
          Expanded(child: Text(context.l10n.settingsLanguage)),
          SegmentedButton<String>(
            showSelectedIcon: false,
            segments: const [
              ButtonSegment(value: 'bn', label: Text('বাংলা')),
              ButtonSegment(value: 'en', label: Text('English')),
            ],
            selected: {code},
            onSelectionChanged: (selection) =>
                controller.setLocale(Locale(selection.first)),
          ),
        ],
      ),
    );
  }
}
