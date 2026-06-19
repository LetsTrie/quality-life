class ProfessionalSpecialization {
  final String slug;
  final String nameEn;
  final String nameBn;
  final String? note;

  const ProfessionalSpecialization({
    required this.slug,
    required this.nameEn,
    required this.nameBn,
    this.note,
  });

  factory ProfessionalSpecialization.fromJson(Map<String, dynamic> json) {
    final spec = json['specialization'] as Map<String, dynamic>? ?? const {};
    return ProfessionalSpecialization(
      slug: spec['slug'] as String? ?? '',
      nameEn: spec['nameEn'] as String? ?? '',
      nameBn: spec['nameBn'] as String? ?? '',
      note: json['note'] as String?,
    );
  }
}

class AvailabilityWindow {
  final String weekday;
  final String startTime; // ISO datetime or bare HH:MM
  final String endTime;

  const AvailabilityWindow({
    required this.weekday,
    required this.startTime,
    required this.endTime,
  });

  factory AvailabilityWindow.fromJson(Map<String, dynamic> json) {
    return AvailabilityWindow(
      weekday: json['weekday'] as String? ?? '',
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
    );
  }

  String _hhmm(String raw) {
    final t = raw.contains('T') ? raw.split('T').last : raw;
    final parts = t.split(':');
    if (parts.length < 2) return raw;
    return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
  }

  String get startLabel => _hhmm(startTime);
  String get endLabel => _hhmm(endTime);
}

class Professional {
  final String id;
  final String? slug;
  final String fullName;
  final String professionType;
  final String? designation;
  final int? yearsOfExperience;
  final String? workplace;
  final String? feeAmount;
  final String? feeCurrency;

  // Detail-only fields (present on GET /v1/professionals/:id).
  final String? gender;
  final String? bio;
  final String? educationSummary;
  final String? bmdcRegistrationNo;
  final String? graduationBatch;
  final String? districtNameBn;
  final bool? acceptingNewClients;
  final List<ProfessionalSpecialization> specializations;
  final List<AvailabilityWindow> availability;

  const Professional({
    required this.id,
    this.slug,
    required this.fullName,
    required this.professionType,
    this.designation,
    this.yearsOfExperience,
    this.workplace,
    this.feeAmount,
    this.feeCurrency,
    this.gender,
    this.bio,
    this.educationSummary,
    this.bmdcRegistrationNo,
    this.graduationBatch,
    this.districtNameBn,
    this.acceptingNewClients,
    this.specializations = const [],
    this.availability = const [],
  });

  factory Professional.fromJson(Map<String, dynamic> json) {
    final district = json['district'] as Map<String, dynamic>?;
    return Professional(
      id: json['id'] as String,
      slug: json['slug'] as String?,
      fullName: json['fullName'] as String? ?? '',
      professionType: json['professionType'] as String? ?? '',
      designation: json['designation'] as String?,
      yearsOfExperience: (json['yearsOfExperience'] as num?)?.toInt(),
      workplace: json['workplace'] as String?,
      feeAmount: json['feeAmount'] as String?,
      feeCurrency: json['feeCurrency'] as String?,
      gender: json['gender'] as String?,
      bio: json['bio'] as String?,
      educationSummary: json['educationSummary'] as String?,
      bmdcRegistrationNo: json['bmdcRegistrationNo'] as String?,
      graduationBatch: json['graduationBatch'] as String?,
      districtNameBn: district?['nameBn'] as String?,
      acceptingNewClients: json['acceptingNewClients'] as bool?,
      specializations: (json['specializations'] as List<dynamic>? ?? const [])
          .map((e) => ProfessionalSpecialization.fromJson(e as Map<String, dynamic>))
          .toList(),
      availability: (json['availability'] as List<dynamic>? ?? const [])
          .map((e) => AvailabilityWindow.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  String get professionLabel {
    return professionType
        .replaceAll('_', ' ')
        .toLowerCase()
        .split(' ')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }
}
