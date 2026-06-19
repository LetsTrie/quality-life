import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final usersRepositoryProvider = Provider<UsersRepository>((ref) {
  return UsersRepository(ref.watch(apiClientProvider));
});

class UsersRepository {
  final Dio _dio;
  UsersRepository(this._dio);

  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/v1/users/me');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateMe({
    required String displayName,
    required String dateOfBirth,
    required String gender,
    required String marital,
    String? phone,
    String? districtId,
    String? upazilaId,
    String? unionId,
    bool? consentAccepted,
  }) async {
    final payload = <String, dynamic>{
      'displayName': displayName,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'marital': marital,
      if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      if (unionId != null) 'unionId': unionId,
      if (upazilaId != null && unionId == null) 'upazilaId': upazilaId,
      if (districtId != null && upazilaId == null && unionId == null) 'districtId': districtId,
      if (consentAccepted == true) 'consentAccepted': true,
    };
    final res = await _dio.patch('/v1/users/me', data: payload);
    return res.data as Map<String, dynamic>;
  }

  /// Record acceptance of the onboarding guideline / privacy notice.
  Future<Map<String, dynamic>> acceptConsent() async {
    final res = await _dio.patch('/v1/users/me', data: {'consentAccepted': true});
    return res.data as Map<String, dynamic>;
  }
}

