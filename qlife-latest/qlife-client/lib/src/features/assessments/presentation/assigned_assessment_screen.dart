import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../instruments/scale_localization.dart';
import '../data/assessments_repository.dart';
import 'assessment_views.dart';

/// Completes a single professional-assigned assessment. Loads the blank question
/// set for the exact assigned version, submits the answers, and shows the same
/// result/follow-up card as the self-check flow.
class AssignedAssessmentScreen extends ConsumerStatefulWidget {
  final String assessmentId;
  // Prefetched take-detail (load-then-navigate); null for deep links.
  final AssessmentTakeDetail? initial;
  const AssignedAssessmentScreen(
      {super.key, required this.assessmentId, this.initial});

  @override
  ConsumerState<AssignedAssessmentScreen> createState() =>
      _AssignedAssessmentScreenState();
}

class _AssignedAssessmentScreenState
    extends ConsumerState<AssignedAssessmentScreen> {
  final Map<String, String> _selectedByQuestionId = {};
  bool _submitting = false;
  AssessmentResult? _result;
  String _slug = '';

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _result = null;
    });
    try {
      final answers = _selectedByQuestionId.entries
          .map((e) => {'questionId': e.key, 'selectedOptionId': e.value})
          .toList();
      final result = await ref.read(assessmentsRepositoryProvider).submitAnswers(
            assessmentId: widget.assessmentId,
            answers: answers,
          );
      // Completing this assessment drops the home "Assigned to you" count and
      // any unread badge — nudge everything watching the refresh signal.
      ref.read(tabRefreshProvider.notifier).state++;
      if (mounted) setState(() => _result = result);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.submissionFailed)),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final seed = widget.initial;
    final async = seed != null
        ? AsyncValue<AssessmentTakeDetail>.data(seed)
        : ref.watch(_takeProvider(widget.assessmentId));
    return async.when(
      loading: () => Scaffold(
        body: Column(
          children: [
            GradientHeader(title: l.scalesTitle, showBack: true, compact: true),
            const Expanded(child: LoadingView()),
          ],
        ),
      ),
      error: (e, _) => Scaffold(
        body: Column(
          children: [
            GradientHeader(title: l.scalesTitle, showBack: true, compact: true),
            Expanded(
              child: ErrorView(
                message: l.errLoadAssigned,
                onRetry: () =>
                    ref.invalidate(_takeProvider(widget.assessmentId)),
              ),
            ),
          ],
        ),
      ),
      data: (detail) {
        _slug = detail.slug;
        final theme = Theme.of(context);
        final total = detail.questions.length;
        final answered = _selectedByQuestionId.length;
        return Scaffold(
          body: Column(
            children: [
              GradientHeader(
                title: localizedScaleName(
                  context,
                  slug: detail.slug,
                  fallback: detail.name,
                ),
                subtitle: l.assignedByProfessional,
                showBack: true,
                compact: true,
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.page,
                    AppSpacing.lg,
                    AppSpacing.page,
                    AppSpacing.xxl,
                  ),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.favorite_border_rounded,
                              size: 20, color: AppColors.secondary),
                          const Gap.horizontal(AppSpacing.sm),
                          Expanded(
                            child: Text(
                              l.assessmentIntro,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Gap(AppSpacing.xl),
                    for (var i = 0; i < total; i++) ...[
                      AssessmentQuestionCard(
                        index: i + 1,
                        question: detail.questions[i],
                        groupValue:
                            _selectedByQuestionId[detail.questions[i].id],
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() => _selectedByQuestionId[
                              detail.questions[i].id] = value);
                        },
                      ),
                      const Gap(AppSpacing.lg),
                    ],
                    const Gap(AppSpacing.xs),
                    if (_result == null)
                      FilledButton(
                        onPressed: _submitting ? null : _submit,
                        child: Text(
                            _submitting ? l.actionSubmitting : l.actionSubmit),
                      ),
                    if (_result == null && total > 0) ...[
                      const Gap(AppSpacing.sm),
                      Center(
                        child: Text(
                          '$answered / $total',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                    if (_result != null) ...[
                      const Gap(AppSpacing.lg),
                      AssessmentResultCard(result: _result!, slug: _slug),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

final _takeProvider = FutureProvider.family
    .autoDispose<AssessmentTakeDetail, String>((ref, id) async {
  return ref.read(assessmentsRepositoryProvider).getForTaking(id);
});
