import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/auth/data/auth_repository.dart';
import 'package:qlife/src/features/auth/data/auth_tokens.dart';
import 'package:qlife/src/features/auth/state/auth_controller.dart';
import 'package:qlife/src/features/account/data/account_repository.dart';

class FakeAuthRepo implements AuthRepository {
  AuthTokens? tokens;

  @override
  Future<void> clearTokens() async {
    tokens = null;
  }

  @override
  Future<AuthTokens?> loadTokens() async => tokens;

  @override
  Future<void> saveTokens(AuthTokens tokens) async {
    this.tokens = tokens;
  }

  @override
  Future<AuthTokens> signInInteractive() async {
    return const AuthTokens(accessToken: 'a', refreshToken: 'r', idToken: 'i');
  }
}

class FakeAccountRepo implements AccountRepository {
  @override
  Future<Map<String, dynamic>> me() async => {'account': {'role': 'USER'}};
}

void main() {
  test('initialize sets authenticated when token exists', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null, idToken: null);
    final controller = AuthController(repo, FakeAccountRepo());

    await controller.initialize();
    expect(controller.state.isInitialized, true);
    expect(controller.state.isAuthenticated, true);
  });

  test('signOut clears auth', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null, idToken: null);
    final controller = AuthController(repo, FakeAccountRepo());

    await controller.initialize();
    await controller.signOut();
    expect(controller.state.isAuthenticated, false);
  });
}

