import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final geoRepositoryProvider = Provider<GeoRepository>((ref) {
  return GeoRepository(ref.watch(apiClientProvider));
});

class GeoRepository {
  final Dio _dio;
  GeoRepository(this._dio);

  Future<List<Map<String, dynamic>>> listDistricts() async {
    final res = await _dio.get('/v1/geo/districts');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['districts'] as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listUpazilas(String districtId) async {
    final res = await _dio.get('/v1/geo/districts/$districtId/upazilas');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['upazilas'] as List<dynamic>).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listUnions(String upazilaId) async {
    final res = await _dio.get('/v1/geo/upazilas/$upazilaId/unions');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['unions'] as List<dynamic>).cast<Map<String, dynamic>>();
  }
}

