import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/assessment.dart';
import '../../../shared/models/instrument.dart';
import '../../assessments/data/assessments_repository.dart';
import '../data/instruments_repository.dart';

class InstrumentDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  const InstrumentDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<InstrumentDetailScreen> createState() => _InstrumentDetailScreenState();
}

class _InstrumentDetailScreenState extends ConsumerState<InstrumentDetailScreen> {
  final Map<String, String> _selectedByQuestionId = {};
  bool _submitting = false;
  AssessmentResult? _result;

  Future<void> _submit(InstrumentDetail instrument) async {
    setState(() {
      _submitting = true;
      _result = null;
    });
    try {
      final assessmentId = await ref
          .read(assessmentsRepositoryProvider)
          .createAssessment(instrumentSlug: widget.slug);

      final answers = _selectedByQuestionId.entries
          .map((e) => {'questionId': e.key, 'selectedOptionId': e.value})
          .toList();

      final result = await ref.read(assessmentsRepositoryProvider).submitAnswers(
            assessmentId: assessmentId,
            answers: answers,
          );

      if (mounted) setState(() => _result = result);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Submission failed. Please try again.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncInstrument = ref.watch(_instrumentProvider(widget.slug));
    return Scaffold(
      appBar: AppBar(title: Text(widget.slug)),
      body: asyncInstrument.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Could not load this scale. Please go back and try again.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (instrument) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(instrument.name, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            for (final question in instrument.questions) ...[
              Text(question.prompt, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ...question.options.map((option) {
                final qid = question.id;
                final oid = option.id;
                return RadioListTile<String>(
                  value: oid,
                  groupValue: _selectedByQuestionId[qid],
                  onChanged: (v) => setState(() => _selectedByQuestionId[qid] = v!),
                  title: Text(option.label),
                );
              }),
              const Divider(height: 24),
            ],
            FilledButton(
              onPressed: _submitting ? null : () => _submit(instrument),
              child: Text(_submitting ? 'Submitting...' : 'Submit'),
            ),
            if (_result != null) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Result', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      if (_result!.severityLabel != null)
                        Text('Severity: ${_result!.severityLabel}'),
                      if (_result!.rawScore != null)
                        Text('Score: ${_result!.rawScore}${_result!.maxScore != null ? ' / ${_result!.maxScore}' : ''}'),
                      if (_result!.recommendedAction != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Recommendation: ${_result!.recommendedAction}',
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

final _instrumentProvider = FutureProvider.family<InstrumentDetail, String>((ref, slug) async {
  return ref.read(instrumentsRepositoryProvider).getInstrument(slug);
});
