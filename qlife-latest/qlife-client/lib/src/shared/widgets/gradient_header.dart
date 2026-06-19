import 'package:flutter/material.dart';

import '../theme/app_decorations.dart';
import '../theme/app_spacing.dart';
import 'app_illustration.dart';

/// A calming, gradient-filled header used at the top of most screens.
///
/// Replaces the flat [AppBar] on content screens with a soft, branded banner:
/// rounded bottom corners, faint decorative orbs for depth, an inline back
/// button sitting beside the title, a title + subtitle, and either a trailing
/// illustration (on landing screens) or trailing action icons (on list/detail
/// screens) — the two never co-occur. Pair it with a scrolling body below in a
/// [Column] + [Expanded].
class GradientHeader extends StatelessWidget {
  const GradientHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.showBack = false,
    this.art,
    this.actions = const [],
    this.compact = false,
  });

  final String title;
  final String? subtitle;
  final bool showBack;

  /// Optional illustration tucked into the right side of the banner.
  final AppArt? art;

  /// Trailing icon actions (rendered in white to sit on the gradient).
  final List<Widget> actions;

  /// A shorter banner (e.g. for detail screens) with slightly smaller type.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const onGradient = Colors.white;
    final radius = BorderRadius.vertical(
      bottom: Radius.circular(AppRadius.xl + 8),
    );

    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.header(theme.brightness),
        borderRadius: radius,
        boxShadow: AppShadows.card,
      ),
      child: ClipRRect(
        borderRadius: radius,
        child: Stack(
          children: [
            // Soft decorative orbs for depth — a gentle, organic touch.
            Positioned(
              top: -46,
              right: -26,
              child: _Orb(size: 150, color: Colors.white.withValues(alpha: 0.10)),
            ),
            Positioned(
              bottom: -54,
              left: -30,
              child: _Orb(size: 120, color: Colors.white.withValues(alpha: 0.07)),
            ),
            SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  showBack ? AppSpacing.sm : AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  compact ? AppSpacing.lg : AppSpacing.xl,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    if (showBack) ...[
                      IconButton(
                        onPressed: () => Navigator.of(context).maybePop(),
                        icon: const Icon(Icons.arrow_back_rounded),
                        color: onGradient,
                        visualDensity: VisualDensity.compact,
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.16),
                        ),
                      ),
                      const Gap.horizontal(AppSpacing.sm),
                    ],
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            title,
                            style: (compact
                                    ? theme.textTheme.titleLarge
                                    : theme.textTheme.headlineSmall)
                                ?.copyWith(
                              color: onGradient,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (subtitle != null) ...[
                            const Gap(AppSpacing.xs),
                            Text(
                              subtitle!,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.92),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (art != null) ...[
                      const Gap.horizontal(AppSpacing.md),
                      AppIllustration(art!, height: compact ? 52 : 82),
                    ],
                    ...actions.map(
                      (a) => IconTheme.merge(
                        data: const IconThemeData(color: onGradient),
                        child: a,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({required this.size, required this.color});
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
