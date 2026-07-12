import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/locale/locale_controller.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_decorations.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/app_illustration.dart';

/// Shared chrome for the auth screens (sign-in, sign-up, verify, forgot):
/// calming gradient background, brand mark, title + subtitle, then the form
/// fields supplied by the caller. Scrolls so the keyboard never overflows.
///
/// [professional] switches the accent colour (teal → blue) and the background
/// wash so the professional login/registration is visually distinct from the
/// user one while sharing the exact same components.
class AuthFormScaffold extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> children;
  final VoidCallback? onBack;
  final bool professional;

  const AuthFormScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
    this.onBack,
    this.professional = false,
  });

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context);
    final accent = professional ? AppColors.secondary : AppColors.primary;
    // Re-tint the accent roles so descendant buttons, links and focused inputs
    // adopt the variant colour without changing any of the components.
    final theme = base.copyWith(
      colorScheme: base.colorScheme.copyWith(primary: accent),
    );
    return Theme(
      data: theme,
      child: Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: professional
              ? AppGradients.professionalSoft
              : AppGradients.brandSoft,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top row: optional back button + a language switcher so the
                // login/register flow can be read in Bangla or English before
                // signing in.
                Row(
                  children: [
                    if (onBack != null)
                      IconButton(
                        onPressed: onBack,
                        icon: const Icon(Icons.arrow_back_rounded),
                        tooltip:
                            MaterialLocalizations.of(context).backButtonTooltip,
                      ),
                    const Spacer(),
                    const _AuthLanguageToggle(),
                  ],
                ),
                const Gap(AppSpacing.sm),
                const Center(child: AppIllustration(AppArt.brandMark, height: 88)),
                const Gap(AppSpacing.xl),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Gap(AppSpacing.sm),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
                const Gap(AppSpacing.xxl),
                ...children,
              ],
            ),
          ),
        ),
      ),
      ),
    );
  }
}

/// Compact Bangla/English switcher shown on the auth screens. Drives
/// [localeControllerProvider], which the whole app watches, so the choice
/// takes effect immediately and persists after sign-in.
class _AuthLanguageToggle extends ConsumerWidget {
  const _AuthLanguageToggle();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final code = ref.watch(localeControllerProvider).languageCode;
    final controller = ref.read(localeControllerProvider.notifier);
    return SegmentedButton<String>(
      showSelectedIcon: false,
      style: const ButtonStyle(visualDensity: VisualDensity.compact),
      segments: const [
        ButtonSegment(value: 'bn', label: Text('বাংলা')),
        ButtonSegment(value: 'en', label: Text('English')),
      ],
      selected: {code == 'en' ? 'en' : 'bn'},
      onSelectionChanged: (s) => controller.setLocale(Locale(s.first)),
    );
  }
}

/// Email regex good enough for client-side validation; the backend is the final
/// authority.
final RegExp authEmailRegExp = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');

/// Client-side minimum; WorkOS enforces its password policy server-side.
const int authMinPasswordLength = 6;
