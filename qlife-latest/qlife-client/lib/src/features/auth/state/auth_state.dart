import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../account/data/account_repository.dart';
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
  return AuthController(
    ref.watch(authRepositoryProvider),
    ref.watch(accountRepositoryProvider),
  );
});

