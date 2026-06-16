import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/models/instrument.dart';
import '../data/instruments_repository.dart';

class InstrumentsScreen extends ConsumerWidget {
  const InstrumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncInstruments = ref.watch(_instrumentsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scales'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_instrumentsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncInstruments.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Could not load scales. Please try again.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('No scales available'));
          }
          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final instrument = items[idx];
              return ListTile(
                title: Text(instrument.name),
                subtitle: Text(instrument.category ?? ''),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.go(InstrumentDetailRoute(slug: instrument.slug).location),
              );
            },
          );
        },
      ),
    );
  }
}

final _instrumentsProvider = FutureProvider<List<InstrumentSummary>>((ref) async {
  return ref.read(instrumentsRepositoryProvider).listInstruments();
});
