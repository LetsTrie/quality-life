import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/state/auth_state.dart';
import '../../account/data/account_repository.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>(() async {
      await ref.read(authStateProvider.notifier).initialize();
      final auth = ref.read(authStateProvider);
      if (!mounted) return;
      if (!auth.isAuthenticated) {
        context.go('/sign-in');
        return;
      }

      // Route by backend role.
      try {
        final me = await ref.read(accountRepositoryProvider).me();
        if (!mounted) return;
        final account = me['account'] as Map<String, dynamic>?;
        final role = account?['role']?.toString();
        if (!mounted) return;
        context.go(role == 'PROFESSIONAL' ? '/pro' : '/home');
      } catch (_) {
        if (!mounted) return;
        context.go('/home');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

