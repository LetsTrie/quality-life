import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../appointments/data/appointments_repository.dart';
import '../../notifications/data/notifications_repository.dart';
import '../data/professional_repository.dart';

/// Latest verification status (PENDING/APPROVED/REJECTED/REVOKED) for the
/// signed-in professional, surfaced as a dashboard banner.
final _verificationStatusProvider =
    FutureProvider.autoDispose<String?>((ref) async {
  ref.watch(tabRefreshProvider);
  final res = await ref.read(professionalRepositoryProvider).me();
  final data = (res['data'] as Map<String, dynamic>)['professional']
      as Map<String, dynamic>;
  final verifications = (data['verifications'] as List<dynamic>?) ?? const [];
  if (verifications.isEmpty) return null;
  return (verifications.first as Map<String, dynamic>)['status']?.toString();
});

/// Count of appointment requests awaiting the professional's response. Uses the
/// server's PENDING filter (REQUESTED + VIEWED) and reads the total from
/// pagination, so the badge is exact even when the inbox spans many pages.
final _pendingRequestsProvider = FutureProvider.autoDispose<int>((ref) async {
  ref.watch(tabRefreshProvider);
  final res =
      await ref.read(appointmentsRepositoryProvider).list(page: 1, status: 'PENDING');
  return res.pagination.total;
});

/// Unread notification count for the dashboard badge.
final _proUnreadProvider = FutureProvider.autoDispose<int>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(notificationsRepositoryProvider).unreadCount();
});

/// A small pill showing a count next to a [FeatureCard] (then the chevron).
class _CountBadge extends StatelessWidget {
  const _CountBadge(this.count, {this.color});
  final int count;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tint = color ?? theme.colorScheme.primary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
          decoration: BoxDecoration(
            color: tint,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            count > 99 ? '99+' : '$count',
            style: theme.textTheme.labelSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const Gap.horizontal(AppSpacing.xs),
        Icon(Icons.chevron_right_rounded, color: theme.colorScheme.outline),
      ],
    );
  }
}

class ProfessionalHomeScreen extends ConsumerWidget {
  const ProfessionalHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final status = ref.watch(_verificationStatusProvider).valueOrNull;
    final pendingRequests = ref.watch(_pendingRequestsProvider).valueOrNull ?? 0;
    final unread = ref.watch(_proUnreadProvider).valueOrNull ?? 0;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.proDashTitle,
            subtitle: l.proDashGreeting,
            art: AppArt.meditation,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.lg,
                AppSpacing.page,
                AppSpacing.xl,
              ),
              children: [
                // Only surface the verification card while the account is still
                // in the review stage — once approved, the clinician doesn't
                // need a standing "approved" banner. (Rejected pros never reach
                // this dashboard; they're routed to a dedicated screen.)
                if (status != null && status != 'APPROVED') ...[
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.hourglass_top_rounded,
                              color: statusTone(context, status),
                            ),
                            const Gap.horizontal(AppSpacing.md),
                            Expanded(
                              child: Text(
                                l.verificationPendingTitle,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(fontWeight: FontWeight.w600),
                              ),
                            ),
                            StatusBadge(
                              humanizeStatus(status),
                              color: statusTone(context, status),
                            ),
                          ],
                        ),
                        const Gap(AppSpacing.sm),
                        Text(
                          l.verificationPendingNote,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(AppSpacing.lg),
                ],
                FeatureCard(
                  icon: Icons.event_note_rounded,
                  title: l.proAppointmentRequests,
                  subtitle: l.proAppointmentRequestsDesc,
                  trailing:
                      pendingRequests > 0 ? _CountBadge(pendingRequests) : null,
                  onTap: () => context.go(const AppointmentsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.groups_rounded,
                  title: l.proMyClients,
                  subtitle: l.proMyClientsDesc,
                  tint: AppColors.secondary,
                  onTap: () => context.go(const ClientsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.notifications_none_rounded,
                  title: l.navNotifications,
                  subtitle: l.navNotificationsDesc,
                  tint: AppColors.tertiary,
                  trailing: unread > 0
                      ? _CountBadge(unread, color: AppColors.tertiary)
                      : null,
                  onTap: () =>
                      context.push(const NotificationsRoute().location),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
