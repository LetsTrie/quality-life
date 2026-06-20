import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/notifications/data/notifications_repository.dart';

void main() {
  group('NotificationsRepository.registerDeviceToken', () {
    test('PUTs the token to the device-token endpoint with ANDROID platform',
        () async {
      late RequestOptions captured;
      final dio = Dio();
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          captured = options;
          handler.resolve(
            Response(requestOptions: options, data: {'data': {}}),
          );
        },
      ));

      await NotificationsRepository(dio).registerDeviceToken('fcm-token-123');

      expect(captured.method, 'PUT');
      expect(captured.path, '/v1/notifications/device-token');
      expect(captured.data, {'token': 'fcm-token-123', 'platform': 'ANDROID'});
    });

    test('propagates network errors so the caller can retry later', () async {
      final dio = Dio();
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) => handler.reject(
          DioException(requestOptions: options, message: 'offline'),
        ),
      ));

      expect(
        NotificationsRepository(dio).registerDeviceToken('tok'),
        throwsA(isA<DioException>()),
      );
    });
  });

  group('NotificationsRepository.unregisterDeviceToken', () {
    test('DELETEs the token from the device-token endpoint', () async {
      late RequestOptions captured;
      final dio = Dio();
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          captured = options;
          handler.resolve(
            Response(requestOptions: options, data: {'data': {}}),
          );
        },
      ));

      await NotificationsRepository(dio).unregisterDeviceToken('fcm-token-123');

      expect(captured.method, 'DELETE');
      expect(captured.path, '/v1/notifications/device-token');
      expect(captured.data, {'token': 'fcm-token-123'});
    });
  });
}
