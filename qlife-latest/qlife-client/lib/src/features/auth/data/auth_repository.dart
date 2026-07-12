import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'auth_tokens.dart';

/// Thrown for any auth failure that should be shown to the user. [message] is
/// already human-readable (surfaced from the backend). [code] carries a coarse
/// classifier; [pendingAuthenticationToken] is set when the failure is actually
/// "email not verified yet" so the caller can route to the OTP screen.
class AuthException implements Exception {
  final String message;
  final String? code;
  final String? pendingAuthenticationToken;
  const AuthException(this.message, {this.code, this.pendingAuthenticationToken});

  @override
  String toString() => message;
}

/// Result of a sign-up attempt. When the account needs email verification (the
/// normal case) [pendingAuthenticationToken] is set and must be passed to the
/// OTP screen; [userConfirmed] is true only if verification is disabled.
class SignUpOutcome {
  final bool userConfirmed;
  final String? pendingAuthenticationToken;
  final AuthTokens? tokens;
  const SignUpOutcome({
    required this.userConfirmed,
    this.pendingAuthenticationToken,
    this.tokens,
  });
}

abstract class AuthRepository {
  Future<AuthTokens?> loadTokens();
  Future<void> saveTokens(AuthTokens tokens);
  Future<void> clearTokens();

  /// Registers a new account. The backend creates the WorkOS user and emails a
  /// verification code; the caller passes the returned pending token to
  /// [confirmSignUp].
  Future<SignUpOutcome> signUp({required String email, required String password});

  /// Completes email verification with the OTP code + the pending token, and
  /// returns the issued session tokens (auto sign-in).
  Future<AuthTokens> confirmSignUp({
    required String pendingAuthenticationToken,
    required String code,
  });

  /// Re-triggers a verification email (by re-authenticating) and returns a
  /// fresh pending token, or null if the account is already verified.
  Future<String?> resendConfirmationCode({required String email, required String password});

  /// Authenticates with email + password. Returns the issued tokens, or throws
  /// [AuthException] — with `code == 'UserNotConfirmedException'` and a
  /// `pendingAuthenticationToken` when the email still needs verifying.
  Future<AuthTokens> signIn({required String email, required String password});

  /// Requests a password-reset code by email (WorkOS Magic Auth).
  Future<void> forgotPassword(String email);

  /// Completes an in-app reset: verifies the emailed code, sets [newPassword],
  /// and returns session tokens (the user is signed in).
  Future<AuthTokens> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  });

  /// Exchanges the stored refresh token for fresh tokens. Returns null when no
  /// refresh is possible.
  Future<AuthTokens?> refreshSession();

  /// Changes the signed-in user's password (verifies the current one).
  Future<void> changePassword({required String oldPassword, required String newPassword});

  /// Permanently deletes the signed-in user (WorkOS + local). Best-effort:
  /// callers should still sign out afterwards.
  Future<void> deleteAccount();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return HttpAuthRepository(storage: const FlutterSecureStorage());
});

/// Backend-for-frontend auth: the app calls our own `/v1/auth/*` endpoints,
/// which broker WorkOS. Uses a bare Dio (no auth interceptor) to avoid a
/// refresh recursion; authed calls attach the stored access token manually.
class HttpAuthRepository implements AuthRepository {
  static const _kAccessToken = 'auth.access_token';
  static const _kRefreshToken = 'auth.refresh_token';
  static const _kEmail = 'auth.email';

  static const _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );

  final FlutterSecureStorage storage;
  final Dio _dio;

  HttpAuthRepository({required this.storage, Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              baseUrl: _baseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 20),
            ));

  Map<String, dynamic> _data(Response res) =>
      (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;

  @override
  Future<AuthTokens?> loadTokens() async {
    final access = await storage.read(key: _kAccessToken);
    if (access == null) return null;
    return AuthTokens(
      accessToken: access,
      refreshToken: await storage.read(key: _kRefreshToken),
    );
  }

  @override
  Future<void> saveTokens(AuthTokens tokens) async {
    await storage.write(key: _kAccessToken, value: tokens.accessToken);
    await storage.write(key: _kRefreshToken, value: tokens.refreshToken);
  }

  @override
  Future<void> clearTokens() async {
    await storage.delete(key: _kAccessToken);
    await storage.delete(key: _kRefreshToken);
    await storage.delete(key: _kEmail);
  }

  @override
  Future<SignUpOutcome> signUp({required String email, required String password}) async {
    final normalized = email.trim().toLowerCase();
    try {
      final res = await _dio.post('/v1/auth/register',
          data: {'email': normalized, 'password': password});
      final data = _data(res);
      if (data['status'] == 'ok') {
        await storage.write(key: _kEmail, value: normalized);
        final tokens = _tokensFromData(data);
        return SignUpOutcome(userConfirmed: true, tokens: tokens);
      }
      return SignUpOutcome(
        userConfirmed: false,
        pendingAuthenticationToken: data['pendingAuthenticationToken'] as String?,
      );
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<AuthTokens> confirmSignUp({
    required String pendingAuthenticationToken,
    required String code,
  }) async {
    try {
      final res = await _dio.post('/v1/auth/verify-email', data: {
        'pendingAuthenticationToken': pendingAuthenticationToken,
        'code': code.trim(),
      });
      return _tokensFromData(_data(res));
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<String?> resendConfirmationCode({
    required String email,
    required String password,
  }) async {
    // Re-authenticate: the backend re-sends the verification code and returns a
    // fresh pending token when the email is still unverified.
    try {
      final res = await _dio.post('/v1/auth/login',
          data: {'email': email.trim().toLowerCase(), 'password': password});
      final data = _data(res);
      if (data['status'] == 'verification_required') {
        return data['pendingAuthenticationToken'] as String?;
      }
      return null; // already verified
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async {
    final normalized = email.trim().toLowerCase();
    try {
      final res = await _dio.post('/v1/auth/login',
          data: {'email': normalized, 'password': password});
      final data = _data(res);
      if (data['status'] == 'verification_required') {
        throw AuthException(
          'Please verify your email to continue.',
          code: 'UserNotConfirmedException',
          pendingAuthenticationToken: data['pendingAuthenticationToken'] as String?,
        );
      }
      await storage.write(key: _kEmail, value: normalized);
      return _tokensFromData(data);
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post('/v1/auth/forgot-password',
          data: {'email': email.trim().toLowerCase()});
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<AuthTokens> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    try {
      final res = await _dio.post('/v1/auth/reset-password', data: {
        'email': email.trim().toLowerCase(),
        'code': code.trim(),
        'newPassword': newPassword,
      });
      return _tokensFromData(_data(res));
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  // Single-flight guard: startup can 401 several requests at once; concurrent
  // callers share one in-flight refresh so they don't race the refresh token.
  Future<AuthTokens?>? _refreshInFlight;

  @override
  Future<AuthTokens?> refreshSession() {
    return _refreshInFlight ??=
        _doRefreshSession().whenComplete(() => _refreshInFlight = null);
  }

  Future<AuthTokens?> _doRefreshSession() async {
    final refresh = await storage.read(key: _kRefreshToken);
    if (refresh == null) return null;
    try {
      final res = await _dio.post('/v1/auth/refresh', data: {'refreshToken': refresh});
      final tokens = _tokensFromData(_data(res));
      await saveTokens(tokens);
      return tokens;
    } catch (_) {
      // Refresh token expired/revoked — caller falls back to re-authentication.
      return null;
    }
  }

  @override
  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.post(
        '/v1/auth/change-password',
        data: {'currentPassword': oldPassword, 'newPassword': newPassword},
        options: await _authedOptions(),
      );
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  @override
  Future<void> deleteAccount() async {
    try {
      await _dio.delete('/v1/auth/account', options: await _authedOptions());
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  Future<Options> _authedOptions() async {
    final access = await storage.read(key: _kAccessToken);
    return Options(headers: {
      if (access != null) 'Authorization': 'Bearer $access',
    });
  }

  AuthTokens _tokensFromData(Map<String, dynamic> data) {
    final access = data['accessToken'] as String?;
    if (access == null) throw const AuthException('Missing access token');
    return AuthTokens(
      accessToken: access,
      refreshToken: data['refreshToken'] as String?,
    );
  }

  AuthException _mapDio(DioException e) {
    final body = e.response?.data;
    String? message;
    if (body is Map) {
      final err = body['error'];
      if (err is Map && err['message'] is String) {
        message = err['message'] as String;
      } else if (err is String) {
        message = err;
      } else if (body['message'] is String) {
        message = body['message'] as String;
      }
    }
    return AuthException(message ?? 'Something went wrong. Please try again.');
  }
}
