import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../account/data/account_repository.dart';
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
  }

  Future<void> signInWithPassword(String email, String password) async {
    final tokens = await _repo.signIn(email: email, password: password);
    await _repo.saveTokens(tokens);
    // Best-effort: hit backend so it can link/create local account from Cognito claims.
    try {
      await _ref.read(accountRepositoryProvider).me();
    } catch (_) {}
    state = const AuthState(isInitialized: true, isAuthenticated: true);
  }

  Future<void> signOut() async {
    await _repo.clearTokens();
    state = const AuthState(isInitialized: true, isAuthenticated: false);
  }
}
