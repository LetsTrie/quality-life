import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../shared/l10n/l10n_extension.dart';
import 'router.dart';
import 'tab_refresh.dart';

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

    // The first tab is "home" for this role (USER → home, PROFESSIONAL →
    // dashboard). Android back never silently kills the app: it pops a nested
    // detail page, else returns to the home tab, else asks before exiting.
    final homeBranch = tabs.first.branch;
    final onHomeTab = navigationShell.currentIndex == homeBranch;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final router = GoRouter.of(context);
        if (router.canPop()) {
          router.pop(); // pop a nested route within the current branch
          return;
        }
        if (!onHomeTab) {
          navigationShell.goBranch(homeBranch);
          return;
        }
        final shouldExit = await _confirmExit(context);
        if (shouldExit) await SystemNavigator.pop();
      },
      child: Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        // Hide labels on unselected tabs; show selected tab label without wrapping
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
        selectedIndex: selected,
        onDestinationSelected: (i) {
          // Force each tab's data to reload from the backend on every tap so
          // the user never sees cached/stale data when navigating tabs.
          ref.read(tabRefreshProvider.notifier).state++;
          navigationShell.goBranch(
            tabs[i].branch,
            initialLocation: tabs[i].branch == navigationShell.currentIndex,
          );
        },
        height: 84,
        destinations: [
          for (final t in tabs)
            NavigationDestination(
              icon: Icon(t.icon),
              selectedIcon: Icon(t.selectedIcon),
              label: t.label,
            ),
        ],
      ),
      ),
    );
  }

  Future<bool> _confirmExit(BuildContext context) async {
    final l = context.l10n;
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.exitAppTitle),
        content: Text(l.exitAppMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(l.actionCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(l.actionExit),
          ),
        ],
      ),
    );
    return result ?? false;
  }
}
