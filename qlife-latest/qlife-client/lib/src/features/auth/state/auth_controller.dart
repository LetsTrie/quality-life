import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../account/data/account_repository.dart';
import '../../../shared/push/push_notification_service.dart';
import '../../../shared/realtime/realtime_service.dart';
import '../data/auth_repository.dart';
import 'auth_state.dart';

class AuthController extends StateNotifier<AuthState> {
  final AuthRepository _repo;
  final Ref _ref;

  AuthController(this._repo, this._ref) : super(const AuthState.initial());

  Future<void> initialize() async {
    final tokens = await _repo.loadTokens();
    state = AuthState(
      isInitialized: true,
      isAuthenticated: tokens?.accessToken != null,
    );
    if (tokens?.accessToken != null) {
      await _startSessionServices();
    }
  }

  Future<void> signInWithPassword(String email, String password) async {
    final tokens = await _repo.signIn(email: email, password: password);
    await _repo.saveTokens(tokens);
    // Best-effort: hit backend so it can link/create local account from Cognito claims.
    try {
      await _ref.read(accountRepositoryProvider).me();
    } catch (_) {}
    state = const AuthState(isInitialized: true, isAuthenticated: true);
    await _startSessionServices();
  }

  /// Tears down push + realtime, then clears the session.
  ///
  /// [deregisterRemote] is false on the 401 path: the token is already invalid,
  /// so the remote device-token DELETE is skipped (it would just 401-loop);
  /// teardown still flips its `_active` guard and invalidates the OS token, and
  /// the socket is disconnected locally.
  Future<void> signOut({bool deregisterRemote = true}) async {
    // Tear down WHILE still authenticated so the DELETE carries a valid token.
    try {
      await _ref
          .read(pushNotificationServiceProvider)
          .teardown(deregisterRemote: deregisterRemote);
    } catch (_) {}
    try {
      await _ref.read(realtimeServiceProvider).disconnect();
    } catch (_) {}

    await _repo.clearTokens();
    state = const AuthState(isInitialized: true, isAuthenticated: false);
  }

  /// Connects the session-gated delivery channels (push registration + socket).
  Future<void> _startSessionServices() async {
    try {
      await _ref.read(pushNotificationServiceProvider).initialize();
    } catch (_) {}
    try {
      await _ref.read(realtimeServiceProvider).connect();
    } catch (_) {}
  }
}
