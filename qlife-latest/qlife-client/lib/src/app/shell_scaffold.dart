import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../shared/l10n/l10n_extension.dart';
import 'router.dart';

/// Branch indices in the [StatefulShellRoute] declared in `router.dart`.
/// Keep in sync with the branch order there.
abstract final class ShellBranch {
  static const home = 0;
  static const selfChecks = 1;
  static const professionals = 2;
  static const appointments = 3;
  static const clients = 4;
  static const account = 5;
  static const proDashboard = 6;
}

class _Tab {
  const _Tab(this.branch, this.icon, this.selectedIcon, this.label);
  final int branch;
  final IconData icon;
  final IconData selectedIcon;
  final String label;
}

/// The persistent bottom-navigation scaffold that wraps the main app.
///
/// The set of tabs is role-aware: people seeking care see the wellbeing tabs,
/// while professionals see their practice tabs. Both map onto the shared
/// [StatefulNavigationShell] branches.
class ShellScaffold extends ConsumerWidget {
  const ShellScaffold({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final role = ref.watch(appSessionProvider).valueOrNull?.role;

    final tabs = role == 'PROFESSIONAL'
        ? <_Tab>[
            _Tab(ShellBranch.proDashboard, Icons.dashboard_outlined,
                Icons.dashboard_rounded, l.proDashTitle),
            _Tab(ShellBranch.appointments, Icons.event_note_outlined,
                Icons.event_note_rounded, l.navAppointments),
            _Tab(ShellBranch.clients, Icons.groups_outlined,
                Icons.groups_rounded, l.proMyClients),
            _Tab(ShellBranch.account, Icons.person_outline_rounded,
                Icons.person_rounded, l.accountTitle),
          ]
        : <_Tab>[
            _Tab(ShellBranch.home, Icons.spa_outlined, Icons.spa_rounded,
                l.navHome),
            _Tab(ShellBranch.selfChecks, Icons.self_improvement_outlined,
                Icons.self_improvement_rounded, l.navScales),
            _Tab(ShellBranch.professionals, Icons.psychology_outlined,
                Icons.psychology_rounded, l.navProfessionals),
            _Tab(ShellBranch.appointments, Icons.event_note_outlined,
                Icons.event_note_rounded, l.navAppointments),
            _Tab(ShellBranch.account, Icons.person_outline_rounded,
                Icons.person_rounded, l.navMore),
          ];

    var selected = tabs.indexWhere((t) => t.branch == navigationShell.currentIndex);
    if (selected < 0) selected = 0;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        // Hide labels on unselected tabs; show selected tab label without wrapping
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
        selectedIndex: selected,
        onDestinationSelected: (i) => navigationShell.goBranch(
          tabs[i].branch,
          initialLocation: tabs[i].branch == navigationShell.currentIndex,
        ),
        height: 80,
        destinations: [
          for (final t in tabs)
            NavigationDestination(
              icon: Icon(t.icon),
              selectedIcon: Icon(t.selectedIcon),
              label: t.label,
            ),
        ],
      ),
    );
  }
}
