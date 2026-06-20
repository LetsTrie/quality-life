import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_client.dart';

final healthRepositoryProvider = Provider<HealthRepository>((ref) {
  return HealthRepository(ref.watch(apiClientProvider));
});

class HealthRepository {
  final Dio _dio;
  HealthRepository(this._dio);

  /// Returns true when the server is reachable and healthy.
  /// Throws on network error or non-ok response.
  Future<bool> check() async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/v1/health',
      options: Options(
        // Skip the 401-retry interceptor — health is a public endpoint.
        extra: {'__retried': true},
        sendTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 8),
      ),
    );
    return res.data?['ok'] == true;
  }
}
