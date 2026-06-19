import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';

/// Each tip has an English and a Bangla variant.
class DailyTip {
  final String en;
  final String bn;
  const DailyTip({required this.en, required this.bn});

  factory DailyTip.fromJson(Map<String, dynamic> json) => DailyTip(
        en: json['en'] as String? ?? '',
        bn: json['bn'] as String? ?? '',
      );
}

/// Fetches tips from `GET /v1/content/tips?type=<type>`.
/// Keyed by type string: 'user' or 'professional'.
final tipsProvider = FutureProvider.autoDispose.family<List<DailyTip>, String>(
  (ref, type) async {
    final dio = ref.watch(apiClientProvider);
    final res = await dio.get('/v1/content/tips?type=$type');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final tips = (data['tips'] as List<dynamic>).cast<Map<String, dynamic>>();
    return tips.map(DailyTip.fromJson).where((t) => t.en.isNotEmpty).toList();
  },
);
