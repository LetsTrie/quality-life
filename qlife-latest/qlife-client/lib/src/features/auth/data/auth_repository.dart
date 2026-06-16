import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'auth_tokens.dart';

abstract class AuthRepository {
  Future<AuthTokens?> loadTokens();
  Future<void> saveTokens(AuthTokens tokens);
  Future<void> clearTokens();
  Future<AuthTokens> signInInteractive();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return CognitoAuthRepository(
    appAuth: const FlutterAppAuth(),
    storage: const FlutterSecureStorage(),
  );
});

class CognitoAuthRepository implements AuthRepository {
  static const _kAccessToken = 'auth.access_token';
  static const _kRefreshToken = 'auth.refresh_token';
  static const _kIdToken = 'auth.id_token';

  final FlutterAppAuth appAuth;
  final FlutterSecureStorage storage;

  CognitoAuthRepository({required this.appAuth, required this.storage});

  // TODO: move these to build-time config (--dart-define) per environment.
  // Pool: us-east-1_hOeGWWCFT (us-east-1). The hosted-UI domain is resolved
  // automatically via OIDC discovery from `_issuer`, so it isn't hardcoded.
  static const _clientId = '6htidlqi2jqk7t45j5ntnb40di';
  static const _redirectUrl = 'qlife://auth/callback';
  static const _issuer = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_hOeGWWCFT';

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
  }

  @override
  Future<AuthTokens> signInInteractive() async {
    final result = await appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        _clientId,
        _redirectUrl,
        issuer: _issuer,
        scopes: const ['openid', 'email', 'profile'],
      ),
    );

    final access = result?.accessToken;
    if (access == null) {
      throw StateError('Missing access token');
    }

    return AuthTokens(
      accessToken: access,
      refreshToken: result?.refreshToken,
      idToken: result?.idToken,
    );
  }
}

