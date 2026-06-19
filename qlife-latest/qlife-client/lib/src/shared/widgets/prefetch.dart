import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Loads [future] while showing a brief blocking spinner over the CURRENT
/// screen, then `push`es [location] passing the loaded value as `extra` so the
/// destination renders immediately — no full-screen loader on arrival.
///
/// On error, dismisses the spinner and shows a snackbar; no navigation happens.
Future<void> prefetchThenPush<T>(
  BuildContext context, {
  required Future<T> future,
  required String location,
  String? errorMessage,
  // Shell-nested routes navigate with `go` (stays in-tab); top-level detail
  // routes use `push`. Defaults to push.
  bool useGo = false,
}) async {
  showDialog<void>(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black.withValues(alpha: 0.15),
    builder: (_) => const Center(child: CircularProgressIndicator()),
  );
  try {
    final value = await future;
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop(); // dismiss spinner
    if (!context.mounted) return;
    if (useGo) {
      context.go(location, extra: value);
    } else {
      context.push(location, extra: value);
    }
  } catch (_) {
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(errorMessage ?? 'Could not open. Please try again.')),
    );
  }
}
