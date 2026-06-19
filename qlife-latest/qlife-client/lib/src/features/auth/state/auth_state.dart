import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import 'auth_controller.dart';

class AuthState {
  final bool isInitialized;
  final bool isAuthenticated;

  const AuthState({
    required this.isInitialized,
    required this.isAuthenticated,
  });

  const AuthState.initial() : this(isInitialized: false, isAuthenticated: false);
}

final authStateProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  // The account repository is read lazily (via `ref`) inside the controller
  // rather than watched here — that would create a provider cycle
  // (authState → account → apiClient → authState) since the API client now
  // signs out through authState on an unrecoverable 401.
  return AuthController(ref.watch(authRepositoryProvider), ref);
});

