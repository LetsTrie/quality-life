import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/auth/data/auth_repository.dart';
import 'package:qlife/src/features/auth/data/auth_tokens.dart';
import 'package:qlife/src/features/auth/state/auth_state.dart';

class FakeAuthRepo implements AuthRepository {
  AuthTokens? tokens;

  @override
  Future<void> clearTokens() async {
    tokens = null;
  }

  @override
  Future<AuthTokens?> loadTokens() async => tokens;

  @override
  Future<void> saveTokens(AuthTokens t) async {
    tokens = t;
  }

  @override
  Future<SignUpOutcome> signUp({required String email, required String password}) async =>
      const SignUpOutcome(userConfirmed: false);

  @override
  Future<void> confirmSignUp({required String email, required String code}) async {}

  @override
  Future<void> resendConfirmationCode(String email) async {}

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r', idToken: 'i');

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<void> confirmForgotPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {}

  @override
  Future<AuthTokens?> refreshSession() async => tokens;

  @override
  Future<void> changePassword(
      {required String oldPassword, required String newPassword}) async {}

  @override
  Future<void> deleteCognitoUser() async {}
}

ProviderContainer _container(FakeAuthRepo repo) {
  final container = ProviderContainer(
    overrides: [authRepositoryProvider.overrideWithValue(repo)],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  test('initialize sets authenticated when token exists', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null, idToken: null);
    final controller = _container(repo).read(authStateProvider.notifier);

    await controller.initialize();
    expect(controller.state.isInitialized, true);
    expect(controller.state.isAuthenticated, true);
  });

  test('signOut clears auth', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null, idToken: null);
    final controller = _container(repo).read(authStateProvider.notifier);

    await controller.initialize();
    await controller.signOut();
    expect(controller.state.isAuthenticated, false);
  });
}
