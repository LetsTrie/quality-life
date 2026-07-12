import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../assessments/data/assessments_repository.dart';
import '../../assessments/presentation/assessment_views.dart';
import '../data/instruments_repository.dart';
import '../scale_localization.dart';

class InstrumentDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  // Prefetched instrument (load-then-navigate); null for deep links.
  final InstrumentDetail? initial;
  const InstrumentDetailScreen({super.key, required this.slug, this.initial});

  @override
  ConsumerState<InstrumentDetailScreen> createState() =>
      _InstrumentDetailScreenState();
}

class _InstrumentDetailScreenState
    extends ConsumerState<InstrumentDetailScreen> {
  final Map<String, String> _selectedByQuestionId = {};
  final ScrollController _scrollController = ScrollController();
  bool _submitting = false;
  AssessmentResult? _result;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _submit(InstrumentDetail instrument) async {
    setState(() {
      _submitting = true;
      _result = null;
    });
    try {
      final assessmentId = await ref
          .read(assessmentsRepositoryProvider)
          .createAssessment(instrumentSlug: widget.slug);

      if (!mounted) return;

      final answers = _selectedByQuestionId.entries
          .map((e) => {'questionId': e.key, 'selectedOptionId': e.value})
          .toList();

      final result = await ref
          .read(assessmentsRepositoryProvider)
          .submitAnswers(assessmentId: assessmentId, answers: answers);

      if (mounted) {
        setState(() => _result = result);
        // Bring the freshly-rendered result into view so the user doesn't have
        // to discover it by scrolling.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted || !_scrollController.hasClients) return;
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 450),
            curve: Curves.easeOut,
          );
        });
      }
    } catch (e) {
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
    final seed = widget.initial;
    final asyncInstrument = seed != null
        ? AsyncValue<InstrumentDetail>.data(seed)
        : ref.watch(_instrumentProvider(widget.slug));
    final l = context.l10n;
    return asyncInstrument.when(
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
                message: l.errLoadScaleDetail,
                onRetry: () => ref.invalidate(_instrumentProvider(widget.slug)),
              ),
            ),
          ],
        ),
      ),
      data: (instrument) {
        final theme = Theme.of(context);
        final total = instrument.questions.length;
        final answered = _selectedByQuestionId.length;
        final localizedName = localizedScaleName(
          context,
          slug: instrument.slug,
          fallback: instrument.name,
          serverNameBn: instrument.nameBn,
        );
        return Scaffold(
          body: Column(
            children: [
              GradientHeader(
                title: localizedName,
                subtitle: localizedScaleCategory(
                  context,
                  instrument.category,
                  serverLabelEn: instrument.categoryLabelEn,
                  serverLabelBn: instrument.categoryLabelBn,
                ),
                showBack: true,
                compact: true,
                actions: [
                  IconButton(
                    tooltip: l.viewHistory,
                    onPressed: () => context.push(
                      AssessmentHistoryRoute(slug: instrument.slug, title: localizedName)
                          .location,
                    ),
                    icon: const Icon(Icons.history_rounded),
                  ),
                ],
              ),
              Expanded(
                child: ListView(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.page,
                    AppSpacing.lg,
                    AppSpacing.page,
                    AppSpacing.xxl,
                  ),
                  children: [
                    // Gentle, reassuring intro.
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
                        question: instrument.questions[i],
                        groupValue:
                            _selectedByQuestionId[instrument.questions[i].id],
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() => _selectedByQuestionId[
                              instrument.questions[i].id] = value);
                        },
                      ),
                      const Gap(AppSpacing.lg),
                    ],
                    const Gap(AppSpacing.xs),
                    // Every question must be answered before the scale can be
                    // submitted/scored — a partial set would deflate the result.
                    FilledButton(
                      onPressed: (_submitting || answered != total || total == 0)
                          ? null
                          : () => _submit(instrument),
                      child: Text(
                          _submitting ? l.actionSubmitting : l.actionSubmit),
                    ),
                    if (total > 0) ...[
                      const Gap(AppSpacing.sm),
                      Center(
                        child: Text(
                          answered != total
                              ? '${l.answerAllToSubmit}  ($answered / $total)'
                              : '$answered / $total',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                    if (_result != null) ...[
                      const Gap(AppSpacing.lg),
                      AssessmentResultCard(result: _result!, slug: widget.slug),
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
final _instrumentProvider =
    FutureProvider.family<InstrumentDetail, String>((ref, slug) async {
  return ref.read(instrumentsRepositoryProvider).getInstrument(slug);
});
