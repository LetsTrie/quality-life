import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/client.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/prefetch.dart';
import '../data/clients_repository.dart';

class ClientsScreen extends ConsumerWidget {
  const ClientsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncClients = ref.watch(_clientsProvider);
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.clientsTitle,
            subtitle: l.proMyClientsDesc,
            actions: [
              IconButton(
                onPressed: () => ref.invalidate(_clientsProvider),
                icon: const Icon(Icons.refresh_rounded),
                tooltip: l.actionRetry,
              ),
            ],
          ),
          Expanded(
            child: asyncClients.when(
              loading: () => const LoadingView(),
              // Retry lives in the top-right header reload icon, not a center button.
              error: (e, _) => ErrorView(message: l.errLoadClients),
              data: (result) {
                if (result.items.isEmpty) {
                  return EmptyView(message: l.emptyClients);
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  itemCount: result.items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                  itemBuilder: (context, idx) {
                    final client = result.items[idx];
                    final name = client.user.displayName ?? l.clientTitle;
                    final refCode = client.referenceCode ?? '';
                    return AppCard(
                      onTap: () => prefetchThenPush<Client>(
                        context,
                        future:
                            ref.read(clientsRepositoryProvider).get(client.id),
                        location: ClientDetailRoute(id: client.id).location,
                        errorMessage: l.errLoadClientDetail,
                        useGo: true,
                      ),
                      child: Row(
                        children: [
                          InitialAvatar(name: name, size: 48),
                          const Gap.horizontal(AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall
                                      ?.copyWith(fontWeight: FontWeight.w600),
                                ),
                                if (refCode.isNotEmpty) ...[
                                  const Gap(2),
                                  Text(
                                    refCode,
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
                              ],
                            ),
                          ),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: Theme.of(context).colorScheme.outline,
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

final _clientsProvider = FutureProvider<PagedResult<Client>>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(clientsRepositoryProvider).list();
});
