class InstrumentSummary {
  final String id;
  final String slug;
  final String name;
  final String? category;

  const InstrumentSummary({
    required this.id,
    required this.slug,
    required this.name,
    this.category,
  });

  factory InstrumentSummary.fromJson(Map<String, dynamic> json) {
    return InstrumentSummary(
      id: json['id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String? ?? '',
      category: json['category'] as String?,
    );
  }
}

class InstrumentOption {
  final String id;
  final String label;
  final String weight;

  const InstrumentOption({required this.id, required this.label, required this.weight});

  factory InstrumentOption.fromJson(Map<String, dynamic> json) {
    return InstrumentOption(
      id: json['id'] as String,
      label: json['label'] as String? ?? '',
      weight: json['weight']?.toString() ?? '0',
    );
  }
}

class InstrumentQuestion {
  final String id;
  final String prompt;
  final List<InstrumentOption> options;

  const InstrumentQuestion({required this.id, required this.prompt, required this.options});

  factory InstrumentQuestion.fromJson(Map<String, dynamic> json) {
    return InstrumentQuestion(
      id: json['id'] as String,
      prompt: json['prompt'] as String? ?? '',
      options: (json['options'] as List<dynamic>)
          .map((o) => InstrumentOption.fromJson(o as Map<String, dynamic>))
          .toList(),
    );
  }
}

class InstrumentDetail {
  final String id;
  final String slug;
  final String name;
  final String? category;
  final String versionId;
  final List<InstrumentQuestion> questions;

  const InstrumentDetail({
    required this.id,
    required this.slug,
    required this.name,
    this.category,
    required this.versionId,
    required this.questions,
  });

  factory InstrumentDetail.fromJson(Map<String, dynamic> json) {
    final instrument = json['instrument'] as Map<String, dynamic>;
    final version = json['version'] as Map<String, dynamic>;
    return InstrumentDetail(
      id: instrument['id'] as String,
      slug: instrument['slug'] as String,
      name: instrument['name'] as String? ?? '',
      category: instrument['category'] as String?,
      versionId: version['id'] as String,
      questions: (version['questions'] as List<dynamic>)
          .map((q) => InstrumentQuestion.fromJson(q as Map<String, dynamic>))
          .toList(),
    );
  }
}
