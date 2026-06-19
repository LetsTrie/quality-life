import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../instruments/scale_localization.dart';
import '../data/assessments_repository.dart';

/// Read-only view of a completed assessment's score, severity, and responses.
/// Used by a clinician to review a client's assigned or self-administered
/// screens. (For an in-progress/assigned assessment there is nothing to show.)
class AssessmentResultScreen extends ConsumerWidget {
  final String assessmentId;
  // Prefetched assessment map (load-then-navigate); null for deep links.
  final Map<String, dynamic>? initial;
  const AssessmentResultScreen(
      {super.key, required this.assessmentId, this.initial});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final seed = initial;
    final async = seed != null
        ? AsyncValue<Map<String, dynamic>>.data(seed)
        : ref.watch(_resultProvider(assessmentId));

    return Scaffold(
      body: async.when(
        loading: () => Scaffold(
          body: Column(
            children: [
              GradientHeader(title: l.resultLabel, showBack: true, compact: true),
              const Expanded(child: LoadingView()),
            ],
          ),
        ),
        error: (e, _) => Column(
          children: [
            GradientHeader(title: l.resultLabel, showBack: true, compact: true),
            Expanded(
              child: ErrorView(
                message: l.errLoadResult,
                onRetry: () => ref.invalidate(_resultProvider(assessmentId)),
              ),
            ),
          ],
        ),
        data: (a) {
          final version = a['instrumentVersion'] as Map<String, dynamic>?;
          final instrument = version?['instrument'] as Map<String, dynamic>?;
          final name = localizedScaleName(
            context,
            slug: instrument?['slug'] as String? ?? '',
            fallback: instrument?['name'] as String? ?? l.resultLabel,
            serverNameBn: instrument?['nameBn'] as String?,
          );
          final status = a['status'] as String? ?? '';
          final completed = status == 'COMPLETED';
          final band = a['scoringBand'] as Map<String, dynamic>?;
          final severity = a['severityLabel'] as String?;
          final advice = band?['advice'] as String?;
          final answers = (a['answers'] as List<dynamic>? ?? const [])
              .cast<Map<String, dynamic>>();

          return Column(
            children: [
              GradientHeader(title: name, showBack: true, compact: true),
              Expanded(
                child: !completed
                    ? EmptyView(message: l.resultNotCompleted)
                    : ListView(
                        padding: const EdgeInsets.all(AppSpacing.page),
                        children: [
                          if (_scoreText(context, a) != null)
                            InfoRow(
                              icon: Icons.analytics_outlined,
                              label: l.resultLabel,
                              value: _scoreText(context, a)!,
                            ),
                          if (severity != null)
                            InfoRow(
                              icon: Icons.flag_outlined,
                              label: l.severityLabel(severity),
                              value: band?['label'] as String? ?? severity,
                            ),
                          if (advice != null && advice.trim().isNotEmpty)
                            InfoRow(
                              icon: Icons.lightbulb_outline_rounded,
                              label: l.resultIntro,
                              value: advice,
                            ),
                          if (answers.isNotEmpty) ...[
                            SectionHeader(l.resultAnswersTitle),
                            ...answers.map((ans) {
                              final q = ans['question'] as Map<String, dynamic>?;
                              final opt =
                                  ans['selectedOption'] as Map<String, dynamic>?;
                              return InfoRow(
                                icon: Icons.check_circle_outline_rounded,
                                label: q?['prompt'] as String? ?? '',
                                value: opt?['label'] as String? ?? '—',
                              );
                            }),
                          ],
                        ],
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  String? _scoreText(BuildContext context, Map<String, dynamic> a) {
    final l = context.l10n;
    final normalized = double.tryParse(a['normalizedScore']?.toString() ?? '');
    if (normalized != null) return l.scoreOutOf100(normalized.round().toString());
    final raw = a['rawScore']?.toString();
    final max = a['maxScore']?.toString();
    if (raw == null) return null;
    return l.scoreLabel(max == null ? raw : '$raw / $max');
  }
}

final _resultProvider =
    FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, id) async {
  final data = await ref.read(assessmentsRepositoryProvider).getById(id);
  return data['assessment'] as Map<String, dynamic>;
});
