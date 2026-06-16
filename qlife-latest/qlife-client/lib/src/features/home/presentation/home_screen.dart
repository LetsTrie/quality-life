import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/state/auth_state.dart';
import '../../../app/router.dart';
import '../../../shared/theme/app_spacing.dart';

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
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.page),
        children: [
          FilledButton(
            onPressed: () => context.go(const ProfileRoute().location),
            child: const Text('My profile'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const InstrumentsRoute().location),
            child: const Text('Scales'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const ProfessionalsDirectoryRoute().location),
            child: const Text('Professionals'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const AppointmentsRoute().location),
            child: const Text('Appointments'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const NotificationsRoute().location),
            child: const Text('Notifications'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const ContentLibraryRoute().location),
            child: const Text('Content'),
          ),
          const Gap(AppSpacing.md),
          FilledButton(
            onPressed: () => context.go(const ProfessionalRegisterRoute().location),
            child: const Text('Become a professional'),
          ),
        ],
      ),
    );
  }
}
