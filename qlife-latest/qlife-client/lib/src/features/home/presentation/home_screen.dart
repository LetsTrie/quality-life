import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_decorations.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../assessments/data/assessments_repository.dart';
import '../../notifications/data/notifications_repository.dart';

/// Unread notification count for the home banner.
final _homeUnreadProvider = FutureProvider.autoDispose<int>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(notificationsRepositoryProvider).unreadCount();
});

/// Count of assigned-but-incomplete self-checks, driving the home "Assigned to
/// you" attention alert. Re-fetches whenever a realtime event bumps the signal.
final _homeAssignedPendingProvider =
    FutureProvider.autoDispose<int>((ref) async {
  ref.watch(tabRefreshProvider);
  final result =
      await ref.read(assessmentsRepositoryProvider).list(status: 'ASSIGNED');
  return result.pagination.total;
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
                const _AssignedSection(),
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

/// "Assigned to you" entry point. When the user has assigned-but-incomplete
/// self-checks it switches to a warning-toned, pulsing alert with a live count;
/// otherwise it's a calm neutral card. Mirrors the unread-notifications pattern.
class _AssignedSection extends ConsumerWidget {
  const _AssignedSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final pending = ref.watch(_homeAssignedPendingProvider).valueOrNull ?? 0;
    void open() => context.push(const AssignedAssessmentsRoute().location);

    if (pending == 0) {
      return FeatureCard(
        icon: Icons.assignment_outlined,
        title: l.assignedTitle,
        subtitle: l.assignedHomeDesc,
        tint: AppColors.secondary,
        onTap: open,
      );
    }

    final theme = Theme.of(context);
    final warning = AppSemanticColors.of(context).warning;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: open,
        child: Ink(
          decoration: BoxDecoration(
            color: warning.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: warning.withValues(alpha: 0.55)),
          ),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              _PulsingCountBadge(count: pending, color: warning),
              const Gap.horizontal(AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            l.assignedTitle,
                            style: theme.textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ),
                        const Gap.horizontal(AppSpacing.sm),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: warning,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          child: Text(
                            l.actionNeeded,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(AppSpacing.xs),
                    Text(
                      l.assignedPending('$pending'),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded),
            ],
          ),
        ),
      ),
    );
  }
}

/// A round count chip that gently pulses to draw the eye, used by the assigned
/// alert. Caps the displayed value at "9+".
class _PulsingCountBadge extends StatefulWidget {
  const _PulsingCountBadge({required this.count, required this.color});

  final int count;
  final Color color;

  @override
  State<_PulsingCountBadge> createState() => _PulsingCountBadgeState();
}

class _PulsingCountBadgeState extends State<_PulsingCountBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1100),
  )..repeat(reverse: true);

  late final Animation<double> _scale = Tween<double>(begin: 1.0, end: 1.12)
      .animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
        child: Text(
          widget.count > 9 ? '9+' : '${widget.count}',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 16,
          ),
        ),
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
