import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/professional.dart';
import '../../../shared/models/pagination.dart';
import '../../../shared/models/paged_result.dart';

final professionalsRepositoryProvider = Provider<ProfessionalsRepository>((ref) {
  return ProfessionalsRepository(ref.watch(apiClientProvider));
});

class ProfessionalsRepository {
  final Dio _dio;
  ProfessionalsRepository(this._dio);

  Future<PagedResult<Professional>> list({
    int page = 1,
    String? q,
    String? professionType,
    String? districtId,
    String? specialization,
  }) async {
    final res = await _dio.get('/v1/professionals', queryParameters: {
      'page': page,
      if (q != null && q.trim().isNotEmpty) 'q': q.trim(),
      if (professionType != null) 'professionType': professionType,
      if (districtId != null) 'districtId': districtId,
      if (specialization != null) 'specialization': specialization,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['professionals'] as List<dynamic>)
        .map((e) => Professional.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }

  Future<Professional> get(String id) async {
    final res = await _dio.get('/v1/professionals/$id');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return Professional.fromJson(data['professional'] as Map<String, dynamic>);
  }
}
