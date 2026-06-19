import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_decorations.dart';
import '../theme/app_spacing.dart';

/// A calming, rotating "tip of the day" card for the dashboards. The tip is
/// chosen deterministically from [tips] by the day of the year, so it changes
/// daily but stays stable within a day — a gentle reason to return.
class DailyTipCard extends StatelessWidget {
  final String title;
  final List<String> tips;
  final IconData icon;

  const DailyTipCard({
    super.key,
    required this.title,
    required this.tips,
    this.icon = Icons.lightbulb_outline_rounded,
  });

  String _tipForToday() {
    if (tips.isEmpty) return '';
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year)).inDays;
    return tips[dayOfYear % tips.length];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.tertiary.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadows.soft,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.tertiary.withValues(alpha: 0.18),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.tertiary, size: 22),
          ),
          const Gap.horizontal(AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Gap(AppSpacing.xs),
                Text(
                  _tipForToday(),
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.45),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
