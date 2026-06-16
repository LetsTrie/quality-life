class AppointmentSummary {
  final String id;
  final String status;
  final String? requestedStartAt;
  final String? scheduledStartAt;
  // Nested summaries — one of these is populated depending on caller role
  final Map<String, dynamic>? professional;
  final Map<String, dynamic>? user;

  const AppointmentSummary({
    required this.id,
    required this.status,
    this.requestedStartAt,
    this.scheduledStartAt,
    this.professional,
    this.user,
  });

  factory AppointmentSummary.fromJson(Map<String, dynamic> json) {
    return AppointmentSummary(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      requestedStartAt: json['requestedStartAt'] as String?,
      scheduledStartAt: json['scheduledStartAt'] as String?,
      professional: json['professional'] as Map<String, dynamic>?,
      user: json['user'] as Map<String, dynamic>?,
    );
  }

  String get counterpartName {
    if (professional != null) {
      return professional!['fullName'] as String? ?? '';
    }
    if (user != null) {
      return user!['displayName'] as String? ?? '';
    }
    return 'Appointment';
  }
}

class AppointmentDetail {
  final String id;
  final String status;
  final String? requestedStartAt;
  final String? scheduledStartAt;
  final String? requestMessage;
  final String? professionalMessage;
  final String? meetingLink;
  final Map<String, dynamic>? professional;
  final Map<String, dynamic>? user;

  const AppointmentDetail({
    required this.id,
    required this.status,
    this.requestedStartAt,
    this.scheduledStartAt,
    this.requestMessage,
    this.professionalMessage,
    this.meetingLink,
    this.professional,
    this.user,
  });

  factory AppointmentDetail.fromJson(Map<String, dynamic> json) {
    return AppointmentDetail(
      id: json['id'] as String,
      status: json['status'] as String? ?? '',
      requestedStartAt: json['requestedStartAt'] as String?,
      scheduledStartAt: json['scheduledStartAt'] as String?,
      requestMessage: json['requestMessage'] as String?,
      professionalMessage: json['professionalMessage'] as String?,
      meetingLink: json['meetingLink'] as String?,
      professional: json['professional'] as Map<String, dynamic>?,
      user: json['user'] as Map<String, dynamic>?,
    );
  }

  bool get isProfessionalView => user != null;

  String get counterpartName {
    if (professional != null) {
      return professional!['fullName'] as String? ?? 'Professional';
    }
    if (user != null) {
      return user!['displayName'] as String? ?? 'Client';
    }
    return 'Appointment';
  }
}
