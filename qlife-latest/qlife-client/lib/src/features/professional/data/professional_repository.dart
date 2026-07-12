import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final professionalRepositoryProvider = Provider<ProfessionalRepository>((ref) {
  return ProfessionalRepository(ref.watch(apiClientProvider));
});

/// The signed-in professional's own profile (`data.professional`). Watched by
/// the profile view; invalidate after an edit to refresh it.
final professionalMeProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final res = await ref.watch(professionalRepositoryProvider).me();
  return (res['data'] as Map<String, dynamic>)['professional'] as Map<String, dynamic>;
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

  /// Reference vocabulary of clinical specializations for onboarding.
  Future<List<Map<String, dynamic>>> listSpecializations() async {
    final res = await _dio.get('/v1/specializations');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['specializations'] as List<dynamic>).cast<Map<String, dynamic>>();
  }

  /// Reference list of profession types for registration (served from server).
  Future<List<Map<String, dynamic>>> listProfessionTypes() async {
    final res = await _dio.get('/v1/professionals/profession-types');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['professionTypes'] as List<dynamic>).cast<Map<String, dynamic>>();
  }
}

