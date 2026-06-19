import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  itemCount: result.items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                  itemBuilder: (context, idx) {
                    final n = result.items[idx];
                    final theme = Theme.of(context);
                    return AppCard(
                      onTap: () async {
                        if (!n.isUnread) return;
                        try {
                          await ref
                              .read(notificationsRepositoryProvider)
                              .markSeen(n.id);
                          if (!context.mounted) return;
                          ref.invalidate(_notificationsProvider);
                        } catch (_) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(l.markReadFailed)),
                            );
                          }
                        }
                      },
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: (n.isUnread
                                      ? AppColors.primary
                                      : theme.colorScheme.outline)
                                  .withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              n.isUnread
                                  ? Icons.notifications_active_rounded
                                  : Icons.notifications_none_rounded,
                              size: 20,
                              color: n.isUnread
                                  ? AppColors.primary
                                  : theme.colorScheme.outline,
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
                                    fontWeight: n.isUnread
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                ),
                                const Gap(2),
                                Text(
                                  n.isUnread ? l.statusUnread : l.statusRead,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (n.isUnread)
                            Container(
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
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

final _notificationsProvider =
    FutureProvider<PagedResult<AppNotification>>((ref) async {
  return ref.read(notificationsRepositoryProvider).list(page: 1);
});
