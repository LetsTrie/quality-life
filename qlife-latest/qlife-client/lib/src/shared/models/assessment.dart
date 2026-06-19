import 'instrument.dart';

/// A professional-assigned assessment loaded for the user to complete: the blank
/// question set of the exact assigned version, plus its current status.
class AssessmentTakeDetail {
  final String id;
  final String status;
  final String slug;
  final String name;
  final List<InstrumentQuestion> questions;

  const AssessmentTakeDetail({
    required this.id,
    required this.status,
    required this.slug,
    required this.name,
    required this.questions,
  });

  factory AssessmentTakeDetail.fromAssessmentJson(Map<String, dynamic> json) {
    final version = json['instrumentVersion'] as Map<String, dynamic>?;
    final instrument = version?['instrument'] as Map<String, dynamic>?;
    final questions = (version?['questions'] as List<dynamic>? ?? [])
        .map((q) => InstrumentQuestion.fromJson(q as Map<String, dynamic>))
        .toList();
    return AssessmentTakeDetail(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      slug: instrument?['slug'] as String? ?? '',
      name: instrument?['name'] as String? ?? '',
      questions: questions,
    );
  }
}

class AssessmentSummary {
  final String id;
  final String status;
  final String source;
  final String? severityLabel;
  final String? rawScore;
  final String? completedAt;
  final String? dueAt;
  final Map<String, dynamic>? instrumentVersion;

  const AssessmentSummary({
    required this.id,
    required this.status,
    required this.source,
    this.severityLabel,
    this.rawScore,
    this.completedAt,
    this.dueAt,
    this.instrumentVersion,
  });

  factory AssessmentSummary.fromJson(Map<String, dynamic> json) {
    return AssessmentSummary(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      source: json['source'] as String? ?? '',
      severityLabel: json['severityLabel'] as String?,
      rawScore: json['rawScore'] as String?,
      completedAt: json['completedAt'] as String?,
      dueAt: json['dueAt'] as String?,
      instrumentVersion: json['instrumentVersion'] as Map<String, dynamic>?,
    );
  }

  String get instrumentName {
    final iv = instrumentVersion;
    if (iv == null) return '';
    final inst = iv['instrument'] as Map<String, dynamic>?;
    return inst?['name'] as String? ?? inst?['slug'] as String? ?? '';
  }

  String get instrumentSlug {
    final inst = instrumentVersion?['instrument'] as Map<String, dynamic>?;
    return inst?['slug'] as String? ?? '';
  }
}

class AssessmentResult {
  final String id;
  final String status;
  final String? rawScore;
  final String? maxScore;
  final String? normalizedScore;
  final String? severityLabel;
  final String? recommendedAction;
  final String? advice;
  final int? severityRank;
  final RecommendedContent? recommendedContent;

  const AssessmentResult({
    required this.id,
    required this.status,
    this.rawScore,
    this.maxScore,
    this.normalizedScore,
    this.severityLabel,
    this.recommendedAction,
    this.advice,
    this.severityRank,
    this.recommendedContent,
  });

  factory AssessmentResult.fromJson(Map<String, dynamic> json) {
    final content = json['recommendedContent'] as Map<String, dynamic>?;
    return AssessmentResult(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      rawScore: json['rawScore'] as String?,
      maxScore: json['maxScore'] as String?,
      normalizedScore: json['normalizedScore'] as String?,
      severityLabel: json['severityLabel'] as String?,
      recommendedAction: json['recommendedAction'] as String?,
      advice: json['advice'] as String?,
      severityRank: json['severityRank'] as int?,
      recommendedContent:
          content == null ? null : RecommendedContent.fromJson(content),
    );
  }

  /// Whether the band wants the user pointed at urgent / help-center support.
  bool get needsHelpCenter =>
      recommendedAction == 'SHOW_HELP_CENTER' ||
      recommendedAction == 'SHOW_HELP_CENTER_URGENT';

  bool get isUrgent => recommendedAction == 'SHOW_HELP_CENTER_URGENT';
}

/// A piece of educational content (usually a coping video) the scoring band
/// recommends as a follow-up to an assessment.
class RecommendedContent {
  final String contentKey;
  final String type; // VIDEO | ARTICLE | ...
  final String? provider; // YOUTUBE | ...
  final String? providerRef;
  final String title;
  final String? thumbnailUrl;
  final int? durationSeconds;

  const RecommendedContent({
    required this.contentKey,
    required this.type,
    required this.title,
    this.provider,
    this.providerRef,
    this.thumbnailUrl,
    this.durationSeconds,
  });

  factory RecommendedContent.fromJson(Map<String, dynamic> json) {
    return RecommendedContent(
      contentKey: json['contentKey'] as String,
      type: json['type'] as String? ?? 'VIDEO',
      provider: json['provider'] as String?,
      providerRef: json['providerRef'] as String?,
      title: json['title'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      durationSeconds: json['durationSeconds'] as int?,
    );
  }

  bool get isVideo => type == 'VIDEO';
}
