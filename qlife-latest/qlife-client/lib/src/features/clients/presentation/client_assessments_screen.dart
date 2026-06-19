import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/prefetch.dart';
import '../../assessments/data/assessments_repository.dart';
import '../../instruments/scale_localization.dart';
import '../data/clients_repository.dart';

/// A clinician's read-only view of one client's assessments — both the ones
/// this professional assigned and the client's own self-administered screens.
class ClientAssessmentsScreen extends ConsumerWidget {
  final String careRelationshipId;
  const ClientAssessmentsScreen({super.key, required this.careRelationshipId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final async = ref.watch(_clientAssessmentsProvider(careRelationshipId));

    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.clientAssessmentsTitle,
            subtitle: l.clientAssessmentsSubtitle,
            showBack: true,
            compact: true,
          ),
          Expanded(
            child: async.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadResult,
                onRetry: () =>
                    ref.invalidate(_clientAssessmentsProvider(careRelationshipId)),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return EmptyView(message: l.noClientAssessments);
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(
                      _clientAssessmentsProvider(careRelationshipId)),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.page),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                    itemBuilder: (context, i) =>
                        _AssessmentTile(item: items[i]),
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

class _AssessmentTile extends ConsumerWidget {
  final AssessmentSummary item;
  const _AssessmentTile({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final theme = Theme.of(context);
    final completed = item.status == 'COMPLETED';
    final name = localizedScaleName(
      context,
      slug: item.instrumentSlug,
      fallback: item.instrumentName,
      serverNameBn:
          (item.instrumentVersion?['instrument'] as Map<String, dynamic>?)?['nameBn']
              as String?,
    );
    final source =
        item.source == 'SELF_INITIATED' ? l.sourceSelf : l.sourceAssigned;

    return AppCard(
      onTap: completed
          ? () => prefetchThenPush<Map<String, dynamic>>(
                context,
                future: ref
                    .read(assessmentsRepositoryProvider)
                    .getById(item.id)
                    .then((d) => d['assessment'] as Map<String, dynamic>),
                location: AssessmentResultRoute(id: item.id).location,
                errorMessage: l.errLoadResult,
              )
          : () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(l.resultNotCompleted)),
              ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const Gap(AppSpacing.xs),
                Text(source,
                    style: theme.textTheme.bodySmall
                        ?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                if (completed && item.severityLabel != null) ...[
                  const Gap(AppSpacing.xs),
                  Text(l.severityLabel(item.severityLabel!),
                      style: theme.textTheme.bodySmall),
                ],
              ],
            ),
          ),
          const Gap.horizontal(AppSpacing.sm),
          StatusBadge(
            humanizeStatus(item.status),
            color: statusTone(context, item.status),
          ),
          if (completed) const Icon(Icons.chevron_right_rounded),
        ],
      ),
    );
  }
}

final _clientAssessmentsProvider = FutureProvider.family
    .autoDispose<List<AssessmentSummary>, String>((ref, careRelationshipId) async {
  final result =
      await ref.read(clientsRepositoryProvider).listAssessments(careRelationshipId);
  return result.items;
});
