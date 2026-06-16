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

  // TODO: wire these from build-time config per environment.
  static const _cognitoDomain = 'YOUR_DOMAIN_PREFIX.auth.YOUR_REGION.amazoncognito.com';
  static const _clientId = 'YOUR_COGNITO_APP_CLIENT_ID';
  static const _redirectUrl = 'qlife://auth/callback';
  static const _issuer = 'https://cognito-idp.YOUR_REGION.amazonaws.com/YOUR_USER_POOL_ID';

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
        discoveryUrl: 'https://$_cognitoDomain/.well-known/openid-configuration',
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

