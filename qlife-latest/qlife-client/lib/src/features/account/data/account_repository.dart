import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return HttpAccountRepository(ref.watch(apiClientProvider));
});

abstract class AccountRepository {
  Future<Map<String, dynamic>> me();
}

class HttpAccountRepository implements AccountRepository {
  final Dio _dio;
  HttpAccountRepository(this._dio);

  @override
  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/v1/me');
    return res.data as Map<String, dynamic>;
  }
}

