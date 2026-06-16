import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/client.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../assessments/data/assessments_repository.dart';
import '../../instruments/data/instruments_repository.dart';
import '../data/clients_repository.dart';

class ClientDetailScreen extends ConsumerStatefulWidget {
  final String careRelationshipId;
  const ClientDetailScreen({super.key, required this.careRelationshipId});

  @override
  ConsumerState<ClientDetailScreen> createState() => _ClientDetailScreenState();
}

class _ClientDetailScreenState extends ConsumerState<ClientDetailScreen> {
  bool _assigning = false;
  final Set<String> _selected = <String>{};

  Future<void> _assign() async {
    if (_selected.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one scale')),
      );
      return;
    }
    setState(() => _assigning = true);
    try {
      await ref.read(assessmentsRepositoryProvider).assignToClient(
            careRelationshipId: widget.careRelationshipId,
            instrumentSlugs: _selected.toList(growable: false),
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Assigned scales')),
      );
      setState(() => _selected.clear());
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to assign scales. Please try again.')),
      );
    } finally {
      if (mounted) setState(() => _assigning = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncClient = ref.watch(_clientDetailProvider(widget.careRelationshipId));
    final asyncInstruments = ref.watch(_instrumentsProvider);

    return asyncClient.when(
      loading: () => const Scaffold(body: LoadingView()),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Client')),
        body: const ErrorView(
          message: 'Could not load client details. Please go back and try again.',
        ),
      ),
      data: (client) {
        final name = client.user.displayName ?? 'Client';
        return Scaffold(
          appBar: AppBar(
            title: Text(name),
            actions: [
              IconButton(
                onPressed: _assigning
                    ? null
                    : () {
                        ref.invalidate(_clientDetailProvider(widget.careRelationshipId));
                        ref.invalidate(_instrumentsProvider);
                      },
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.page),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Assign multiple scales',
                      style: Theme.of(context).textTheme.titleMedium),
                  const Gap(AppSpacing.sm),
                  Expanded(
                    child: asyncInstruments.when(
                      loading: () => const LoadingView(),
                      error: (e, _) => const ErrorView(
                        message: 'Could not load scales. Please refresh.',
                      ),
                      data: (instruments) => instruments.isEmpty
                          ? const EmptyView(
                              message: 'No scales available',
                              icon: Icons.assignment_outlined,
                            )
                          : ListView.separated(
                              itemCount: instruments.length,
                              separatorBuilder: (_, __) => const Divider(height: 1),
                              itemBuilder: (context, idx) {
                                final instrument = instruments[idx];
                                final slug = instrument.slug;
                                final checked = _selected.contains(slug);
                                return CheckboxListTile(
                                  value: checked,
                                  onChanged: _assigning
                                      ? null
                                      : (v) => setState(() {
                                            if (v == true) {
                                              _selected.add(slug);
                                            } else {
                                              _selected.remove(slug);
                                            }
                                          }),
                                  title: Text(instrument.name),
                                  subtitle: Text(slug),
                                );
                              },
                            ),
                    ),
                  ),
                  const Gap(AppSpacing.md),
                  FilledButton(
                    onPressed: _assigning ? null : _assign,
                    child: Text(_assigning ? 'Assigning...' : 'Assign selected'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

final _clientDetailProvider = FutureProvider.family<Client, String>((ref, careRelationshipId) async {
  return ref.read(clientsRepositoryProvider).get(careRelationshipId);
});

final _instrumentsProvider = FutureProvider<List<InstrumentSummary>>((ref) async {
  return ref.read(instrumentsRepositoryProvider).listInstruments();
});
