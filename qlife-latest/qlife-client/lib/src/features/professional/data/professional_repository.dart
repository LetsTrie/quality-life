import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final professionalRepositoryProvider = Provider<ProfessionalRepository>((ref) {
  return ProfessionalRepository(ref.watch(apiClientProvider));
});

class ProfessionalRepository {
  final Dio _dio;
  ProfessionalRepository(this._dio);

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String professionType,
    String? gender,
    String? designation,
    String? phone,
  }) async {
    final res = await _dio.post('/v1/professionals/register', data: {
      'fullName': fullName,
      'professionType': professionType,
      if (gender != null) 'gender': gender,
      if (designation != null && designation.trim().isNotEmpty) 'designation': designation.trim(),
      if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/v1/professionals/me');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateMe(Map<String, dynamic> patch) async {
    final res = await _dio.patch('/v1/professionals/me', data: patch);
    return res.data as Map<String, dynamic>;
  }
}

