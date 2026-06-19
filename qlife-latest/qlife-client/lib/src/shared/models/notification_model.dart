class AppNotification {
  final String id;
  final String type;
  final String? title;
  final String? readAt;
  final String createdAt;
  final Map<String, dynamic>? appointment;
  final Map<String, dynamic>? assessment;

  const AppNotification({
    required this.id,
    required this.type,
    this.title,
    this.readAt,
    required this.createdAt,
    this.appointment,
    this.assessment,
  });

  bool get isUnread => readAt == null;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String? ?? '',
      title: json['title'] as String?,
      readAt: json['readAt'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      appointment: json['appointment'] as Map<String, dynamic>?,
      assessment: json['assessment'] as Map<String, dynamic>?,
    );
  }

  /// Prefers the server-supplied [title]; falls back to a client-side mapping
  /// for notifications created before the server populated the title field.
  String get displayTitle {
    if (title != null && title!.isNotEmpty) return title!;
    return switch (type) {
      'APPOINTMENT_REQUESTED' => 'New appointment request',
      'APPOINTMENT_ACCEPTED' => 'Appointment accepted',
      'APPOINTMENT_DECLINED' => 'Appointment declined',
      'APPOINTMENT_RESCHEDULED' => 'Appointment rescheduled',
      'ASSESSMENT_ASSIGNED' => 'New self-check assigned',
      'ASSESSMENT_COMPLETED' => 'Self-check completed',
      _ => type.replaceAll('_', ' ').toLowerCase(),
    };
  }
}
