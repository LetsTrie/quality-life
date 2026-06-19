import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/state/auth_state.dart';

final apiClientProvider = Provider<Dio>((ref) {
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final tokens = await ref.read(authRepositoryProvider).loadTokens();
        // The backend verifies the token's `aud` against the Cognito app client
        // ID and reads the user's email from the claims — both of which are only
        // present on the ID token, not the access token. So authenticate with
        // the ID token (falling back to access token only if absent).
        final bearer = tokens?.idToken ?? tokens?.accessToken;
        if (bearer != null) {
          options.headers['Authorization'] = 'Bearer $bearer';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final isUnauthorized = error.response?.statusCode == 401;
        final alreadyRetried = error.requestOptions.extra['__retried'] == true;

        if (isUnauthorized && !alreadyRetried) {
          final refreshed = await ref.read(authRepositoryProvider).refreshSession();
          if (refreshed != null) {
            // Replay the original request once. onRequest re-attaches the fresh
            // token from storage; the flag prevents an infinite refresh loop.
            final opts = error.requestOptions..extra['__retried'] = true;
            try {
              final response = await dio.fetch(opts);
              return handler.resolve(response);
            } on DioException catch (retryError) {
              return handler.next(retryError);
            }
          }
          // Refresh impossible (expired/revoked) → drop the session so the
          // router sends the user back to sign-in.
          await ref.read(authStateProvider.notifier).signOut();
        }

        handler.next(error);
      },
    ),
  );

  return dio;
});
