import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return HttpAccountRepository(ref.watch(apiClientProvider));
});

abstract class AccountRepository {
  Future<Map<String, dynamic>> me();

  /// Persist the preferred language (drives notification language). Best-effort.
  Future<void> setPreferredLocale(String localeCode);

  /// Recoverable self-deactivation.
  Future<void> deactivate();

  /// Soft-delete + anonymize the account.
  Future<void> deleteAccount();
}

class HttpAccountRepository implements AccountRepository {
  final Dio _dio;
  HttpAccountRepository(this._dio);

  @override
  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/v1/me');
    return (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
  }

  @override
  Future<void> setPreferredLocale(String localeCode) async {
    await _dio.patch(
      '/v1/me/preferences',
      data: {'preferredLocale': localeCode == 'en' ? 'en' : 'bn'},
    );
  }

  @override
  Future<void> deactivate() async {
    await _dio.post('/v1/me/deactivate');
  }

  @override
  Future<void> deleteAccount() async {
    await _dio.delete('/v1/me');
  }
}

