import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/notification_model.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/notifications_repository.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncNotifications = ref.watch(_notificationsProvider);
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.notificationsTitle,
            showBack: true,
            actions: [
              IconButton(
                onPressed: () => ref.invalidate(_notificationsProvider),
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
          Expanded(
            child: asyncNotifications.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadNotifications,
                onRetry: () => ref.invalidate(_notificationsProvider),
              ),
              data: (result) {
                if (result.items.isEmpty) {
                  return EmptyView(message: l.emptyNotifications);
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(_notificationsProvider),
                  child: ListView.separated(
                    // The body is a bare Column with no bottom SafeArea, so add
                    // the device's bottom inset to the list padding — otherwise
                    // the last card is clipped under the system nav bar / home
                    // indicator (item 5).
                    padding: EdgeInsets.fromLTRB(
                      AppSpacing.page,
                      AppSpacing.page,
                      AppSpacing.page,
                      AppSpacing.page + MediaQuery.of(context).viewPadding.bottom,
                    ),
                    itemCount: result.items.length,
                    separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                    itemBuilder: (context, idx) =>
                        _NotificationCard(notification: result.items[idx]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends ConsumerWidget {
  const _NotificationCard({required this.notification});

  final AppNotification notification;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final n = notification;
    final theme = Theme.of(context);
    final l = context.l10n;
    final time = _relativeTime(context, n.createdAtTime);
    return AppCard(
      onTap: () async {
        final messenger = ScaffoldMessenger.of(context);
        final location = notificationRouteLocation(
          type: n.type,
          appointmentId: n.appointmentId,
          assessmentId: n.assessmentId,
        );
        // Mark read first so the unread badge updates everywhere, then open the
        // most relevant screen. Tapping always navigates — read or unread.
        if (n.isUnread) {
          try {
            await ref.read(notificationsRepositoryProvider).markSeen(n.id);
            ref.read(tabRefreshProvider.notifier).state++;
            ref.invalidate(_notificationsProvider);
          } catch (_) {
            messenger.showSnackBar(SnackBar(content: Text(l.markReadFailed)));
          }
        }
        if (!context.mounted) return;
        context.go(location);
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: (n.isUnread ? AppColors.primary : theme.colorScheme.outline)
                  .withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              n.isUnread
                  ? Icons.notifications_active_rounded
                  : Icons.notifications_none_rounded,
              size: 20,
              color:
                  n.isUnread ? AppColors.primary : theme.colorScheme.outline,
            ),
          ),
          const Gap.horizontal(AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  n.displayTitle,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight:
                        n.isUnread ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
                if (n.displayBody.isNotEmpty) ...[
                  const Gap(3),
                  Text(
                    n.displayBody,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      height: 1.3,
                    ),
                  ),
                ],
                if (time.isNotEmpty) ...[
                  const Gap(6),
                  Text(
                    time,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (n.isUnread)
            Container(
              margin: const EdgeInsets.only(left: AppSpacing.sm, top: 6),
              width: 9,
              height: 9,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}

/// Relative "time ago" label, falling back to an ISO-ish date past a week.
String _relativeTime(BuildContext context, DateTime? time) {
  if (time == null) return '';
  final l = context.l10n;
  final diff = DateTime.now().difference(time);
  if (diff.inMinutes < 1) return l.timeJustNow;
  if (diff.inHours < 1) return l.timeMinutesAgo('${diff.inMinutes}');
  if (diff.inDays < 1) return l.timeHoursAgo('${diff.inHours}');
  if (diff.inDays < 7) return l.timeDaysAgo('${diff.inDays}');
  return '${time.year}-${time.month.toString().padLeft(2, '0')}-'
      '${time.day.toString().padLeft(2, '0')}';
}

/// Refetches on every screen open (autoDispose) and whenever a realtime event
/// bumps [tabRefreshProvider], so the list is never stale.
final _notificationsProvider =
    FutureProvider.autoDispose<PagedResult<AppNotification>>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(notificationsRepositoryProvider).list(page: 1);
});
