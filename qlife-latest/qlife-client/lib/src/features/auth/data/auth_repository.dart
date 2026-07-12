import 'package:amazon_cognito_identity_dart_2/cognito.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'auth_tokens.dart';

/// Thrown for any auth failure that should be shown to the user. [message] is
/// already human-readable (Cognito surfaces friendly messages like "Incorrect
/// username or password.").
class AuthException implements Exception {
  final String message;
  final String? code;
  const AuthException(this.message, {this.code});

  @override
  String toString() => message;
}

/// Result of a sign-up attempt. [userConfirmed] is true only if the pool is
/// configured to auto-confirm (it isn't here), so the OTP step is normally
/// required.
class SignUpOutcome {
  final bool userConfirmed;
  const SignUpOutcome({required this.userConfirmed});
}

abstract class AuthRepository {
  Future<AuthTokens?> loadTokens();
  Future<void> saveTokens(AuthTokens tokens);
  Future<void> clearTokens();

  /// Registers a new account. Cognito emails a confirmation code; the caller
  /// must then call [confirmSignUp].
  Future<SignUpOutcome> signUp({required String email, required String password});
  Future<void> confirmSignUp({required String email, required String code});
  Future<void> resendConfirmationCode(String email);

  /// Authenticates with email + password (USER_PASSWORD / SRP) and returns the
  /// issued tokens. Also persists the email so [refreshSession] can rebuild the
  /// Cognito user later.
  Future<AuthTokens> signIn({required String email, required String password});

  Future<void> forgotPassword(String email);
  Future<void> confirmForgotPassword({
    required String email,
    required String code,
    required String newPassword,
  });

  /// Exchanges the stored refresh token for fresh tokens. Returns null when no
  /// refresh is possible (missing email/refresh token, or Cognito rejects it).
  Future<AuthTokens?> refreshSession();

  /// Changes the signed-in user's password (verifies the current one).
  Future<void> changePassword({required String oldPassword, required String newPassword});

  /// Permanently deletes the signed-in user from the identity provider (Cognito).
  /// Best-effort: callers should still sign out afterwards.
  Future<void> deleteCognitoUser();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return CognitoAuthRepository(storage: const FlutterSecureStorage());
});

class CognitoAuthRepository implements AuthRepository {
  static const _kAccessToken = 'auth.access_token';
  static const _kRefreshToken = 'auth.refresh_token';
  static const _kIdToken = 'auth.id_token';
  static const _kEmail = 'auth.email';

  final FlutterSecureStorage storage;

  CognitoAuthRepository({required this.storage});

  // Pass per-environment values at build time:
  //   flutter run --dart-define=COGNITO_USER_POOL_ID=... --dart-define=COGNITO_CLIENT_ID=...
  // Dev defaults kept so the app still runs without explicit --dart-define.
  static const _userPoolId = String.fromEnvironment(
    'COGNITO_USER_POOL_ID',
    defaultValue: 'us-east-1_S8XqA3wif',
  );
  static const _clientId = String.fromEnvironment(
    'COGNITO_CLIENT_ID',
    defaultValue: '3eq0m0ssb3dcd19qsg6a8hesp7',
  );

  final CognitoUserPool _pool = CognitoUserPool(_userPoolId, _clientId);

  @override
  Future<AuthTokens?> loadTokens() async {
    final access = await storage.read(key: _kAccessToken);
    if (access == null) return null;
    return AuthTokens(
      accessToken: access,
      refreshToken: await storage.read(key: _kRefreshToken),
      idToken: await storage.read(key: _kIdToken),
    );
  }

  @override
  Future<void> saveTokens(AuthTokens tokens) async {
    await storage.write(key: _kAccessToken, value: tokens.accessToken);
    await storage.write(key: _kRefreshToken, value: tokens.refreshToken);
    await storage.write(key: _kIdToken, value: tokens.idToken);
  }

  @override
  Future<void> clearTokens() async {
    await storage.delete(key: _kAccessToken);
    await storage.delete(key: _kRefreshToken);
    await storage.delete(key: _kIdToken);
    await storage.delete(key: _kEmail);
  }

  @override
  Future<SignUpOutcome> signUp({required String email, required String password}) async {
    final normalized = email.trim().toLowerCase();
    try {
      final data = await _pool.signUp(
        normalized,
        password,
        userAttributes: [AttributeArg(name: 'email', value: normalized)],
      );
      return SignUpOutcome(userConfirmed: data.userConfirmed ?? false);
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  @override
  Future<void> confirmSignUp({required String email, required String code}) async {
    final user = CognitoUser(email.trim().toLowerCase(), _pool);
    try {
      await user.confirmRegistration(code.trim());
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  @override
  Future<void> resendConfirmationCode(String email) async {
    final user = CognitoUser(email.trim().toLowerCase(), _pool);
    try {
      await user.resendConfirmationCode();
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async {
    final normalized = email.trim().toLowerCase();
    final user = CognitoUser(normalized, _pool);
    final details = AuthenticationDetails(username: normalized, password: password);
    try {
      final session = await user.authenticateUser(details);
      if (session == null) {
        throw const AuthException('Could not sign in. Please try again.');
      }
      await storage.write(key: _kEmail, value: normalized);
      return _tokensFromSession(session);
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    } on CognitoUserException catch (e) {
      throw AuthException(e.message ?? 'Could not sign in. Please try again.');
    }
  }

  @override
  Future<void> forgotPassword(String email) async {
    final user = CognitoUser(email.trim().toLowerCase(), _pool);
    try {
      await user.forgotPassword();
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  @override
  Future<void> confirmForgotPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    final user = CognitoUser(email.trim().toLowerCase(), _pool);
    try {
      await user.confirmPassword(code.trim(), newPassword);
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  // Single-flight guard: on startup several requests can 401 at once (the
  // session provider's /v1/me plus the push device-token registration), and
  // firing concurrent refreshes races on the same refresh token — which can
  // wedge the app on the splash. Concurrent callers share one in-flight refresh.
  Future<AuthTokens?>? _refreshInFlight;

  @override
  Future<AuthTokens?> refreshSession() {
    return _refreshInFlight ??=
        _doRefreshSession().whenComplete(() => _refreshInFlight = null);
  }

  Future<AuthTokens?> _doRefreshSession() async {
    final email = await storage.read(key: _kEmail);
    final refresh = await storage.read(key: _kRefreshToken);
    if (email == null || refresh == null) return null;

    final user = CognitoUser(email, _pool);
    try {
      // The Cognito client has no built-in timeout; without this a stalled
      // network call would hang the splash indefinitely.
      final session = await user
          .refreshSession(CognitoRefreshToken(refresh))
          .timeout(const Duration(seconds: 12));
      if (session == null) return null;
      final refreshed = _tokensFromSession(session);
      // A refresh response usually omits the refresh token; keep the stored one
      // so we can refresh again next time.
      final tokens = AuthTokens(
        accessToken: refreshed.accessToken,
        idToken: refreshed.idToken,
        refreshToken: refreshed.refreshToken ?? refresh,
      );
      await saveTokens(tokens);
      return tokens;
    } catch (_) {
      // Refresh token expired/revoked — caller falls back to re-authentication.
      return null;
    }
  }

  @override
  Future<void> changePassword({required String oldPassword, required String newPassword}) async {
    final email = await storage.read(key: _kEmail);
    if (email == null) throw const AuthException('Not signed in');
    final user = CognitoUser(email, _pool);
    try {
      // Re-authenticate with the current password to obtain a live session bound
      // to this user, then change the password.
      final session = await user.authenticateUser(
        AuthenticationDetails(username: email, password: oldPassword),
      );
      if (session == null) {
        throw const AuthException('Could not verify your current password.');
      }
      await user.changePassword(oldPassword, newPassword);
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    } on CognitoUserException catch (e) {
      throw AuthException(e.message ?? 'Could not change password.');
    }
  }

  @override
  Future<void> deleteCognitoUser() async {
    final email = await storage.read(key: _kEmail);
    final refresh = await storage.read(key: _kRefreshToken);
    if (email == null || refresh == null) return;
    final user = CognitoUser(email, _pool);
    try {
      // Establish a valid session for this user, then delete it from Cognito.
      await user.refreshSession(CognitoRefreshToken(refresh));
      await user.deleteUser();
    } on CognitoClientException catch (e) {
      throw _mapException(e);
    }
  }

  AuthTokens _tokensFromSession(CognitoUserSession session) {
    final access = session.getAccessToken().getJwtToken();
    if (access == null) {
      throw const AuthException('Missing access token');
    }
    return AuthTokens(
      accessToken: access,
      idToken: session.getIdToken().getJwtToken(),
      // A refresh response does not re-issue a refresh token; keep the prior
      // one if absent so the stored value isn't wiped.
      refreshToken: session.getRefreshToken()?.getToken(),
    );
  }

  AuthException _mapException(CognitoClientException e) {
    return AuthException(e.message ?? 'Something went wrong. Please try again.', code: e.code);
  }
}
