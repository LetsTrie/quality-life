import 'package:flutter/material.dart';

import '../l10n/l10n_extension.dart';
import '../theme/app_spacing.dart';
import 'app_illustration.dart';

/// Shared placeholders for the loading / error / empty states that every
/// data-backed screen renders. Centralizing them keeps spacing, tone, and the
/// calming illustration style consistent instead of each screen hand-rolling
/// its own.

/// Centered progress indicator for the loading state of an async view.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) =>
      const Center(child: CircularProgressIndicator(strokeWidth: 3));
}

/// Centered, gently-styled error message for a failed async load, with an
/// optional retry action.
class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.spa_outlined,
              color: theme.colorScheme.error.withValues(alpha: 0.8),
              size: 44,
            ),
            const Gap(AppSpacing.md),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
            if (onRetry != null) ...[
              const Gap(AppSpacing.lg),
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: Text(context.l10n.actionRetry),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 44),
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Centered, calm empty-state placeholder with a soothing illustration.
class EmptyView extends StatelessWidget {
  const EmptyView({super.key, required this.message, this.icon, this.art});

  final String message;
  final IconData? icon;

  /// Optional illustration shown above the message. Defaults to [AppArt.empty].
  final AppArt? art;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppIllustration(art ?? AppArt.empty, height: 132),
            const Gap(AppSpacing.lg),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
