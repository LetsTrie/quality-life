import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/shared/api/health_repository.dart';

Dio _dioWithResponse(dynamic data, {int statusCode = 200}) {
  final dio = Dio();
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) => handler.resolve(
      Response(
        requestOptions: options,
        statusCode: statusCode,
        data: data,
      ),
    ),
  ));
  return dio;
}

Dio _dioThatRejects() {
  final dio = Dio();
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (_, handler) => handler.reject(
      DioException(
        requestOptions: RequestOptions(path: '/v1/health'),
        message: 'network down',
      ),
    ),
  ));
  return dio;
}

void main() {
  group('HealthRepository.check', () {
    test('returns true when the server reports ok', () async {
      final repo = HealthRepository(_dioWithResponse({'ok': true}));
      expect(await repo.check(), true);
    });

    test('returns false when ok is missing or false', () async {
      final repo = HealthRepository(_dioWithResponse({'ok': false}));
      expect(await repo.check(), false);

      final empty = HealthRepository(_dioWithResponse(<String, dynamic>{}));
      expect(await empty.check(), false);
    });

    test('uses the public /v1/health path and skips auth retry', () async {
      late RequestOptions captured;
      final dio = Dio();
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          captured = options;
          handler.resolve(
            Response(requestOptions: options, data: {'ok': true}),
          );
        },
      ));
      await HealthRepository(dio).check();
      expect(captured.path, '/v1/health');
      expect(captured.extra['__retried'], true);
    });

    test('throws when the request fails', () async {
      final repo = HealthRepository(_dioThatRejects());
      expect(repo.check(), throwsA(isA<DioException>()));
    });
  });
}
