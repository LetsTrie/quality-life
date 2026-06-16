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
}

class AssessmentResult {
  final String id;
  final String status;
  final String? rawScore;
  final String? maxScore;
  final String? normalizedScore;
  final String? severityLabel;
  final String? recommendedAction;

  const AssessmentResult({
    required this.id,
    required this.status,
    this.rawScore,
    this.maxScore,
    this.normalizedScore,
    this.severityLabel,
    this.recommendedAction,
  });

  factory AssessmentResult.fromJson(Map<String, dynamic> json) {
    return AssessmentResult(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      rawScore: json['rawScore'] as String?,
      maxScore: json['maxScore'] as String?,
      normalizedScore: json['normalizedScore'] as String?,
      severityLabel: json['severityLabel'] as String?,
      recommendedAction: json['recommendedAction'] as String?,
    );
  }
}
