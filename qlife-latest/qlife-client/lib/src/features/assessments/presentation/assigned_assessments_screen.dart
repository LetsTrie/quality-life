import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/widgets/prefetch.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../instruments/scale_localization.dart';
import '../data/assessments_repository.dart';

/// The user's worklist of scales a professional has assigned to them. These are
/// the clinical (assign-only) scales the user cannot self-start; they complete
/// them here. Mirrors the legacy "professional-suggested scales" flow.
class AssignedAssessmentsScreen extends ConsumerWidget {
  const AssignedAssessmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final async = ref.watch(_assignedProvider);
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.assignedTitle,
            subtitle: l.assignedSubtitle,
            showBack: true,
          ),
          Expanded(
            child: async.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadAssigned,
                onRetry: () => ref.invalidate(_assignedProvider),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return EmptyView(message: l.assignedEmpty);
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(_assignedProvider),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.page),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                    itemBuilder: (context, i) =>
                        _AssignedCard(item: items[i]),
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

class _AssignedCard extends ConsumerWidget {
  const _AssignedCard({required this.item});

  final AssessmentSummary item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l = context.l10n;
    final name = localizedScaleName(
      context,
      slug: item.instrumentSlug,
      fallback: item.instrumentName,
    );
    return AppCard(
      onTap: () => prefetchThenPush<AssessmentTakeDetail>(
        context,
        future: ref.read(assessmentsRepositoryProvider).getForTaking(item.id),
        location: AssignedAssessmentRoute(id: item.id).location,
        errorMessage: l.errLoadScaleDetail,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: const Icon(Icons.assignment_outlined,
                color: AppColors.secondary),
          ),
          const Gap.horizontal(AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Gap(AppSpacing.xs),
                Text(
                  l.assignedByProfessional,
                  style: theme.textTheme.bodySmall
                      ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded),
        ],
      ),
    );
  }
}

/// Assigned-but-not-completed assessments for the current user.
final _assignedProvider =
    FutureProvider.autoDispose<List<AssessmentSummary>>((ref) async {
  final result =
      await ref.read(assessmentsRepositoryProvider).list(status: 'ASSIGNED');
  return result.items;
});
