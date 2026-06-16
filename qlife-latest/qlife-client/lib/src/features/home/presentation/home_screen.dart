import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/state/auth_state.dart';
import '../../../app/router.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
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
              onPressed: () => context.go(const ProfileRoute().location),
              child: const Text('My profile'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const InstrumentsRoute().location),
              child: const Text('Scales'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const ProfessionalsDirectoryRoute().location),
              child: const Text('Professionals'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const AppointmentsRoute().location),
              child: const Text('Appointments'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const NotificationsRoute().location),
              child: const Text('Notifications'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const ContentLibraryRoute().location),
              child: const Text('Content'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go(const ProfessionalRegisterRoute().location),
              child: const Text('Become a professional'),
            ),
          ],
        ),
      ),
    );
  }
}
