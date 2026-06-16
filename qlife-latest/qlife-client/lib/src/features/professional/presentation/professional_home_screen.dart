import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/state/auth_state.dart';
import '../../../app/router.dart';
import '../../../shared/theme/app_spacing.dart';

class ProfessionalHomeScreen extends ConsumerWidget {
  const ProfessionalHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Professional'),
        actions: [
          TextButton(
            onPressed: () async => ref.read(authStateProvider.notifier).signOut(),
            child: const Text('Sign out'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.page),
        children: [
          FilledButton(
            onPressed: () => context.go(const AppointmentsRoute().location),
            child: const Text('Appointment requests'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const ClientsRoute().location),
            child: const Text('My clients'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const NotificationsRoute().location),
            child: const Text('Notifications'),
          ),
        ],
      ),
    );
  }
}
