import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/client.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../assessments/data/assessments_repository.dart';
import '../../instruments/data/instruments_repository.dart';
import '../data/clients_repository.dart';

class ClientDetailScreen extends ConsumerStatefulWidget {
  final String careRelationshipId;
  // Prefetched client (load-then-navigate); null for deep links.
  final Client? initial;
  const ClientDetailScreen(
      {super.key, required this.careRelationshipId, this.initial});

  @override
  ConsumerState<ClientDetailScreen> createState() =>
      _ClientDetailScreenState();
}

class _ClientDetailScreenState extends ConsumerState<ClientDetailScreen> {
  bool _assigning = false;
  final Set<String> _selected = <String>{};

  Future<void> _assign() async {
    final l = context.l10n;
    if (_selected.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l.selectAtLeastOneScale)),
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
        SnackBar(content: Text(context.l10n.assignedScales)),
      );
      setState(() => _selected.clear());
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.assignFailed)),
      );
    } finally {
      if (mounted) setState(() => _assigning = false);
    }
  }

  Widget _instrumentTile(InstrumentSummary instrument) {
    final slug = instrument.slug;
    final checked = _selected.contains(slug);
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: _assigning
          ? null
          : () => setState(() {
                if (checked) {
                  _selected.remove(slug);
                } else {
                  _selected.add(slug);
                }
              }),
      child: CheckboxListTile(
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
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final seed = widget.initial;
    final asyncClient = seed != null
        ? AsyncValue<Client>.data(seed)
        : ref.watch(_clientDetailProvider(widget.careRelationshipId));
    final asyncInstruments = ref.watch(_instrumentsProvider);
    final l = context.l10n;

    final name = asyncClient.valueOrNull?.user.displayName ?? l.clientTitle;

    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: name,
            subtitle: l.proMyClients,
            showBack: true,
            compact: true,
          ),
          Expanded(
            child: asyncClient.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadClientDetail,
                onRetry: () => ref.invalidate(
                    _clientDetailProvider(widget.careRelationshipId)),
              ),
              data: (client) => ListView(
                padding: const EdgeInsets.all(AppSpacing.page),
                children: [
                  // --- Client overview (who this person is) ---
                  _ClientSummaryCard(client: client),
                  const Gap(AppSpacing.md),
                  // Primary action: review what they've already filled in.
                  FeatureCard(
                    icon: Icons.fact_check_outlined,
                    title: l.viewClientResults,
                    subtitle: l.clientAssessmentsSubtitle,
                    onTap: () => context.push(
                        ClientAssessmentsRoute(id: widget.careRelationshipId)
                            .location),
                  ),
                  // --- Assign new self-checks ---
                  SectionHeader(l.assignMultipleScales),
                  asyncInstruments.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.symmetric(vertical: AppSpacing.xl),
                      child: LoadingView(),
                    ),
                    error: (e, _) => ErrorView(
                      message: l.errLoadScalesRefresh,
                      onRetry: () => ref.invalidate(_instrumentsProvider),
                    ),
                    data: (instruments) {
                      if (instruments.isEmpty) {
                        return EmptyView(message: l.emptyScales);
                      }
                      return Column(
                        children: [
                          for (final instrument in instruments) ...[
                            _instrumentTile(instrument),
                            const Gap(AppSpacing.sm),
                          ],
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.sm,
                AppSpacing.page,
                AppSpacing.md,
              ),
              child: FilledButton.icon(
                onPressed: _assigning ? null : _assign,
                icon: _assigning
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : const Icon(Icons.assignment_turned_in_outlined),
                label: Text(_assigning ? l.assigning : l.assignSelected),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A compact "who is this client" card shown at the top of the detail screen,
/// so the professional gets context before being offered scales to assign.
class _ClientSummaryCard extends StatelessWidget {
  const _ClientSummaryCard({required this.client});
  final Client client;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final theme = Theme.of(context);
    final name = client.user.displayName ?? l.clientTitle;
    final refCode = client.referenceCode ?? '';
    final phone = client.user.phone ?? '';

    return AppCard(
      child: Row(
        children: [
          InitialAvatar(name: name, size: 52),
          const Gap.horizontal(AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                if (refCode.isNotEmpty) ...[
                  const Gap(2),
                  Text(refCode,
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant)),
                ],
                if (phone.isNotEmpty) ...[
                  const Gap(2),
                  Row(
                    children: [
                      Icon(Icons.phone_outlined,
                          size: 14, color: theme.colorScheme.onSurfaceVariant),
                      const Gap.horizontal(AppSpacing.xs),
                      Text(phone,
                          style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          StatusBadge(
            humanizeStatus(client.status),
            color: statusTone(context, client.status),
          ),
        ],
      ),
    );
  }
}

final _clientDetailProvider =
    FutureProvider.family<Client, String>((ref, careRelationshipId) async {
  return ref.read(clientsRepositoryProvider).get(careRelationshipId);
});

final _instrumentsProvider =
    FutureProvider<List<InstrumentSummary>>((ref) async {
  return ref.read(instrumentsRepositoryProvider).listInstruments();
});
