import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/models/client.dart';
import '../../../shared/models/paged_result.dart';
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
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(
          child: _ErrorView(message: 'Could not load clients. Please try again.'),
        ),
        data: (result) {
          if (result.items.isEmpty) {
            return const Center(child: Text('No clients yet'));
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

class _ErrorView extends StatelessWidget {
  final String message;
  const _ErrorView({required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Text(
        message,
        style: TextStyle(color: Theme.of(context).colorScheme.error),
        textAlign: TextAlign.center,
      ),
    );
  }
}

final _clientsProvider = FutureProvider<PagedResult<Client>>((ref) async {
  return ref.read(clientsRepositoryProvider).list();
});
