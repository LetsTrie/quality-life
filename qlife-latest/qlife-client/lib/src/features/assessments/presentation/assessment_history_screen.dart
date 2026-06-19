import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/prefetch.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/assessments_repository.dart';

/// The current user's past completed results for one instrument, newest first
/// (legacy result-history). Tapping a row opens the full result.
class AssessmentHistoryScreen extends ConsumerWidget {
  final String slug;
  final String title;
  const AssessmentHistoryScreen({super.key, required this.slug, required this.title});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final async = ref.watch(_historyProvider(slug));

    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: title.isNotEmpty ? title : l.historyTitle,
            subtitle: l.historySubtitle,
            showBack: true,
            compact: true,
          ),
          Expanded(
            child: async.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadResult,
                onRetry: () => ref.invalidate(_historyProvider(slug)),
              ),
              data: (items) {
                if (items.isEmpty) return EmptyView(message: l.noHistory);
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                  itemBuilder: (context, i) {
                    final a = items[i];
                    final date = (a.completedAt ?? '').split('T').first;
                    return AppCard(
                      onTap: () => prefetchThenPush<Map<String, dynamic>>(
                        context,
                        future: ref
                            .read(assessmentsRepositoryProvider)
                            .getById(a.id)
                            .then((d) => d['assessment'] as Map<String, dynamic>),
                        location: AssessmentResultRoute(id: a.id).location,
                        errorMessage: l.errLoadResult,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  a.severityLabel ?? l.resultLabel,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w600),
                                ),
                                if (date.isNotEmpty) ...[
                                  const Gap(AppSpacing.xs),
                                  Text(date,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall),
                                ],
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded),
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

final _historyProvider = FutureProvider.family
    .autoDispose<List<AssessmentSummary>, String>((ref, slug) async {
  final result = await ref
      .read(assessmentsRepositoryProvider)
      .list(status: 'COMPLETED', instrumentSlug: slug);
  return result.items;
});
