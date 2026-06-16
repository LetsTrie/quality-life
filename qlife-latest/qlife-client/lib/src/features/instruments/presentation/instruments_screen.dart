import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/widgets/async_state_views.dart';
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
        loading: () => const LoadingView(),
        error: (e, _) => const ErrorView(
          message: 'Could not load scales. Please try again.',
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyView(
              message: 'No scales available',
              icon: Icons.assignment_outlined,
            );
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
