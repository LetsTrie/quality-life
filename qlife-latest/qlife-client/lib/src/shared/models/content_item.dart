class ContentItem {
  final String contentKey;
  final String title;
  final String? provider;
  final String? providerRef;
  final String? description;
  final int? durationSeconds;
  final bool watched;

  const ContentItem({
    required this.contentKey,
    required this.title,
    this.provider,
    this.providerRef,
    this.description,
    this.durationSeconds,
    this.watched = false,
  });

  factory ContentItem.fromJson(Map<String, dynamic> json) {
    return ContentItem(
      contentKey: json['contentKey'] as String,
      title: json['title'] as String? ?? '',
      provider: json['provider'] as String?,
      providerRef: json['providerRef'] as String?,
      description: json['description'] as String?,
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      watched: json['watched'] as bool? ?? false,
    );
  }
}
