import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/notification_model.dart';
import '../../../shared/models/paged_result.dart';
import '../data/notifications_repository.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncNotifications = ref.watch(_notificationsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_notificationsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncNotifications.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Could not load notifications. Please try again.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (result) {
          if (result.items.isEmpty) {
            return const Center(child: Text('No notifications'));
          }
          return ListView.separated(
            itemCount: result.items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final n = result.items[idx];
              return ListTile(
                leading: Icon(
                  n.isUnread ? Icons.circle : Icons.circle_outlined,
                  size: 12,
                  color: n.isUnread ? Theme.of(context).colorScheme.primary : null,
                ),
                title: Text(n.displayTitle),
                subtitle: Text(n.isUnread ? 'Unread' : 'Read'),
                onTap: () async {
                  if (!n.isUnread) return;
                  try {
                    await ref.read(notificationsRepositoryProvider).markSeen(n.id);
                    ref.invalidate(_notificationsProvider);
                  } catch (_) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Could not mark as read. Please try again.')),
                      );
                    }
                  }
                },
              );
            },
          );
        },
      ),
    );
  }
}

final _notificationsProvider = FutureProvider<PagedResult<AppNotification>>((ref) async {
  return ref.read(notificationsRepositoryProvider).list(page: 1);
});
