import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/features/auth/data/auth_repository.dart';
import 'package:qlife/src/features/auth/data/auth_tokens.dart';
import 'package:qlife/src/features/auth/state/auth_state.dart';
import 'package:qlife/src/shared/push/push_notification_service.dart';
import 'package:qlife/src/shared/realtime/realtime_service.dart';

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
  Future<AuthTokens> confirmSignUp({
    required String pendingAuthenticationToken,
    required String code,
  }) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<String?> resendConfirmationCode({
    required String email,
    required String password,
  }) async =>
      null;

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<AuthTokens> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<AuthTokens?> refreshSession() async => tokens;

  @override
  Future<void> changePassword(
      {required String oldPassword, required String newPassword}) async {}

  @override
  Future<void> deleteAccount() async {}
}

// No-op session services so init/logout don't touch Firebase or open sockets.
class _NoopPush extends PushNotificationService {
  _NoopPush(super.ref);
  @override
  Future<void> initialize() async {}
  @override
  Future<void> syncToken() async {}
  @override
  Future<void> teardown({bool deregisterRemote = true}) async {}
}

class _NoopRealtime extends RealtimeService {
  _NoopRealtime(super.ref);
  @override
  Future<void> connect() async {}
  @override
  Future<void> disconnect() async {}
}

ProviderContainer _container(FakeAuthRepo repo) {
  final container = ProviderContainer(
    overrides: [
      authRepositoryProvider.overrideWithValue(repo),
      pushNotificationServiceProvider.overrideWith((ref) => _NoopPush(ref)),
      realtimeServiceProvider.overrideWith((ref) => _NoopRealtime(ref)),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  test('initialize sets authenticated when token exists', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null);
    final controller = _container(repo).read(authStateProvider.notifier);

    await controller.initialize();
    expect(controller.state.isInitialized, true);
    expect(controller.state.isAuthenticated, true);
  });

  test('signOut clears auth', () async {
    final repo = FakeAuthRepo()
      ..tokens = const AuthTokens(accessToken: 'a', refreshToken: null);
    final controller = _container(repo).read(authStateProvider.notifier);

    await controller.initialize();
    await controller.signOut();
    expect(controller.state.isAuthenticated, false);
  });
}
