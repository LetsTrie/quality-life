import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/models/client.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../data/clients_repository.dart';

class ClientsScreen extends ConsumerWidget {
  const ClientsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncClients = ref.watch(_clientsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clients'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_clientsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncClients.when(
        loading: () => const LoadingView(),
        error: (e, _) => const ErrorView(
          message: 'Could not load clients. Please try again.',
        ),
        data: (result) {
          if (result.items.isEmpty) {
            return const EmptyView(
              message: 'No clients yet',
              icon: Icons.folder_shared_outlined,
            );
          }
          return ListView.separated(
            itemCount: result.items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final client = result.items[idx];
              final name = client.user.displayName ?? 'Client';
              final refCode = client.referenceCode ?? '';
              return ListTile(
                title: Text(name),
                subtitle: Text(refCode),
                trailing: const Icon(Icons.assignment),
                onTap: () => context.go(ClientDetailRoute(id: client.id).location),
              );
            },
          );
        },
      ),
    );
  }
}

final _clientsProvider = FutureProvider<PagedResult<Client>>((ref) async {
  return ref.read(clientsRepositoryProvider).list();
});
