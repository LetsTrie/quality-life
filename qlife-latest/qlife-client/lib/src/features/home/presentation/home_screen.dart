import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_decorations.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../../shared/providers/tips_provider.dart';
import '../../../shared/widgets/daily_tip_card.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../notifications/data/notifications_repository.dart';

/// Unread notification count for the home banner.
final _homeUnreadProvider = FutureProvider.autoDispose<int>((ref) async {
  return ref.read(notificationsRepositoryProvider).unreadCount();
});

/// The home dashboard for people seeking care: a warm greeting, a prominent
/// "self-check" call to action, and quick ways to explore the rest of QLife.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final unread = ref.watch(_homeUnreadProvider).valueOrNull ?? 0;
    final introDone =
        ref.watch(appSessionProvider).valueOrNull?.hasCompletedIntroScreening;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.homeGreeting,
            subtitle: l.homeTagline,
            art: AppArt.meditation,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.md,
                AppSpacing.page,
                AppSpacing.xl,
              ),
              children: [
                if (unread > 0) ...[
                  AppCard(
                    onTap: () =>
                        context.push(const NotificationsRoute().location),
                    child: Row(
                      children: [
                        const Icon(Icons.notifications_active_outlined,
                            color: AppColors.secondary),
                        const Gap.horizontal(AppSpacing.md),
                        Expanded(
                          child: Text(l.homeUnreadNotifications(unread.toString())),
                        ),
                        const Icon(Icons.chevron_right_rounded),
                      ],
                    ),
                  ),
                  const Gap(AppSpacing.md),
                ],
                if (introDone == false) ...[
                  FeatureCard(
                    icon: Icons.favorite_outline_rounded,
                    title: l.introNudgeTitle,
                    subtitle: l.introNudgeDesc,
                    tint: AppColors.tertiary,
                    onTap: () => context.push(
                        const InstrumentDetailRoute(slug: 'wellbeing-5')
                            .location),
                  ),
                  const Gap(AppSpacing.md),
                ],
                _SelfCheckCallout(
                  title: l.navScales,
                  subtitle: l.navScalesDesc,
                  onTap: () => context.go(const InstrumentsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.assignment_outlined,
                  title: l.assignedTitle,
                  subtitle: l.assignedHomeDesc,
                  tint: AppColors.secondary,
                  onTap: () =>
                      context.push(const AssignedAssessmentsRoute().location),
                ),
                const Gap(AppSpacing.md),
                Builder(builder: (context) {
                  final isBn = Localizations.localeOf(context).languageCode == 'bn';
                  final serverTips = ref.watch(tipsProvider('user'));
                  final tips = serverTips.maybeWhen(
                    data: (list) => list.map((t) => isBn ? t.bn : t.en).toList(),
                    orElse: () => [l.homeTip1, l.homeTip2, l.homeTip3, l.homeTip4],
                  );
                  return DailyTipCard(
                    title: l.homeTipTitle,
                    icon: Icons.spa_outlined,
                    tips: tips,
                  );
                }),
                SectionHeader(l.sectionExplore),
                FeatureCard(
                  icon: Icons.psychology_outlined,
                  title: l.navProfessionals,
                  subtitle: l.navProfessionalsDesc,
                  tint: AppColors.secondary,
                  onTap: () => context
                      .go(const ProfessionalsDirectoryRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.event_note_outlined,
                  title: l.navAppointments,
                  subtitle: l.navAppointmentsDesc,
                  onTap: () => context.go(const AppointmentsRoute().location),
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
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The hero "start a self-check" card — the primary action on the dashboard.
class _SelfCheckCallout extends StatelessWidget {
  const _SelfCheckCallout({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            gradient: AppGradients.brand,
            borderRadius: BorderRadius.circular(AppRadius.xl),
            boxShadow: AppShadows.card,
          ),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Gap(AppSpacing.xs),
                    Text(
                      subtitle,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.92),
                        height: 1.35,
                      ),
                    ),
                    const Gap(AppSpacing.md),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            context.l10n.actionContinue,
                            style: theme.textTheme.labelLarge?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Gap.horizontal(AppSpacing.xs),
                          const Icon(Icons.arrow_forward_rounded,
                              size: 18, color: AppColors.primary),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const Gap.horizontal(AppSpacing.sm),
              const AppIllustration(AppArt.brandMark, height: 64),
            ],
          ),
        ),
      ),
    );
  }
}
