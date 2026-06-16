class AppNotification {
  final String id;
  final String type;
  final String? readAt;
  final String createdAt;
  final Map<String, dynamic>? appointment;
  final Map<String, dynamic>? assessment;

  const AppNotification({
    required this.id,
    required this.type,
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
      readAt: json['readAt'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      appointment: json['appointment'] as Map<String, dynamic>?,
      assessment: json['assessment'] as Map<String, dynamic>?,
    );
  }

  String get displayTitle {
    switch (type) {
      case 'APPOINTMENT_REQUESTED':
        return 'New appointment request';
      case 'APPOINTMENT_ACCEPTED':
        return 'Appointment accepted';
      case 'APPOINTMENT_DECLINED':
        return 'Appointment declined';
      case 'APPOINTMENT_RESCHEDULED':
        return 'Appointment rescheduled';
      case 'ASSESSMENT_ASSIGNED':
        return 'New assessment assigned';
      case 'ASSESSMENT_COMPLETED':
        return 'Assessment completed';
      default:
        return type.replaceAll('_', ' ').toLowerCase();
    }
  }
}
