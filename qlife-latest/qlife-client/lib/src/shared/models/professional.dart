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
  });

  factory Professional.fromJson(Map<String, dynamic> json) {
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
