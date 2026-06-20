class AppNotification {
  final String id;
  final String type;
  final String? title;
  final String? body;
  final String? readAt;
  final String createdAt;
  final Map<String, dynamic>? appointment;
  final Map<String, dynamic>? assessment;

  const AppNotification({
    required this.id,
    required this.type,
    this.title,
    this.body,
    this.readAt,
    required this.createdAt,
    this.appointment,
    this.assessment,
  });

  bool get isUnread => readAt == null;

  String? get appointmentId => appointment?['id']?.toString();
  String? get assessmentId => assessment?['id']?.toString();

  /// Parsed creation time (local), or null if unparseable.
  DateTime? get createdAtTime => DateTime.tryParse(createdAt)?.toLocal();

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String? ?? '',
      title: json['title'] as String?,
      body: json['body'] as String?,
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
      'APPOINTMENT_ACCEPTED' => 'Appointment confirmed',
      'APPOINTMENT_DECLINED' => 'Appointment update',
      'APPOINTMENT_RESCHEDULED' => 'New time proposed',
      'APPOINTMENT_CANCELLED' => 'Appointment cancelled',
      'ASSESSMENT_ASSIGNED' => 'A new self-check for you',
      'ASSESSMENT_COMPLETED' => 'Self-check completed',
      'ACCOUNT_APPROVED' => "You're verified",
      _ => type.replaceAll('_', ' ').toLowerCase(),
    };
  }

  /// Prefers the server-supplied [body]; falls back to a per-type message for
  /// notifications created before the server populated the body field.
  String get displayBody {
    final b = body;
    if (b != null && b.isNotEmpty) return b;
    return switch (type) {
      'APPOINTMENT_REQUESTED' =>
        'A client would like to book a session with you. Tap to review.',
      'APPOINTMENT_ACCEPTED' =>
        'Your session was confirmed. Tap to see the details.',
      'APPOINTMENT_DECLINED' =>
        "This appointment couldn't be taken. Tap to find another time.",
      'APPOINTMENT_RESCHEDULED' =>
        'A new time was proposed for your session. Tap to confirm.',
      'APPOINTMENT_CANCELLED' => 'An appointment was cancelled. Tap to view.',
      'ASSESSMENT_ASSIGNED' =>
        'Your provider assigned you a self-check. Tap to start.',
      'ASSESSMENT_COMPLETED' =>
        'A client completed an assigned self-check. Tap to review.',
      'ACCOUNT_APPROVED' =>
        "Your professional account is approved — you're now visible to clients.",
      _ => '',
    };
  }
}
