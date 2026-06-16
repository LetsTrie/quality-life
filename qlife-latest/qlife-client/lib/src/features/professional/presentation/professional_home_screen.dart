import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/state/auth_state.dart';
import '../../../app/router.dart';

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
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FilledButton(
              onPressed: () => context.go(const AppointmentsRoute().location),
              child: const Text('Appointment requests'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const ClientsRoute().location),
              child: const Text('My clients'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const NotificationsRoute().location),
              child: const Text('Notifications'),
            ),
          ],
        ),
      ),
    );
  }
}
