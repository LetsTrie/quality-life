import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';

/// A single assessment question rendered as a card with single-choice options.
/// Shared by the self-check (instrument detail) and the assigned-assessment
/// (professional worklist) flows so both look and behave identically.
class AssessmentQuestionCard extends StatelessWidget {
  const AssessmentQuestionCard({
    super.key,
    required this.index,
    required this.question,
    required this.groupValue,
    required this.onChanged,
  });

  final int index;
  final InstrumentQuestion question;
  final String? groupValue;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final answered = groupValue != null;
    return AppCard(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 26,
                height: 26,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: (answered ? AppColors.primary : theme.colorScheme.outline)
                      .withValues(alpha: answered ? 1 : 0.15),
                  shape: BoxShape.circle,
                ),
                child: answered
                    ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                    : Text(
                        '$index',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
              const Gap.horizontal(AppSpacing.md),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    question.prompt,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const Gap(AppSpacing.sm),
          RadioGroup<String>(
            groupValue: groupValue,
            onChanged: onChanged,
            child: Column(
              children: question.options
                  .map(
                    (option) => RadioListTile<String>(
                      value: option.id,
                      title: Text(
                        option.label,
                        style: theme.textTheme.bodyLarge,
                      ),
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      visualDensity:
                          const VisualDensity(horizontal: -2, vertical: -1),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

/// The post-completion result card: severity, score, band advice, follow-up
/// actions and a reassuring note. [slug] is the completed scale's slug, used to
/// surface scale-relevant crisis hotlines on the help center.
class AssessmentResultCard extends StatelessWidget {
  const AssessmentResultCard({
    super.key,
    required this.result,
    required this.slug,
  });

  final AssessmentResult result;
  final String slug;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l = context.l10n;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.insights_rounded, color: AppColors.primary),
              const Gap.horizontal(AppSpacing.sm),
              Text(
                l.resultTitle,
                style: theme.textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const Gap(AppSpacing.md),
          if (result.severityLabel != null)
            _ResultLine(
              icon: Icons.thermostat_rounded,
              text: l.severityLabel(result.severityLabel!),
            ),
          if (result.rawScore != null)
            _ResultLine(
              icon: Icons.numbers_rounded,
              text: l.scoreLabel(
                '${result.rawScore}${result.maxScore != null ? ' / ${result.maxScore}' : ''}',
              ),
            ),
          const Gap(AppSpacing.md),
          Text(
            result.advice?.isNotEmpty == true ? result.advice! : l.resultIntro,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.45,
            ),
          ),
          const Gap(AppSpacing.lg),
          _FollowUpActions(result: result, slug: slug),
          const Gap(AppSpacing.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.spa_outlined,
                  size: 16, color: theme.colorScheme.onSurfaceVariant),
              const Gap.horizontal(AppSpacing.xs),
              Expanded(
                child: Text(
                  l.followUpReassurance,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The post-completion "what next" block. The primary call-to-action is chosen
/// from the scoring band's recommended outcome: urgent/help-center support →
/// the help center; a linked coping resource → resources; otherwise → find a
/// professional. A secondary action is always offered so there's never a dead
/// end after a result.
class _FollowUpActions extends StatelessWidget {
  const _FollowUpActions({required this.result, required this.slug});

  final AssessmentResult result;
  final String slug;

  void _goHelp(BuildContext context) =>
      context.go(HelpCenterRoute(urgent: result.isUrgent, slug: slug).location);
  void _goProfessionals(BuildContext context) =>
      context.go(const ProfessionalsDirectoryRoute().location);
  void _goResources(BuildContext context) =>
      context.go(const ContentLibraryRoute().location);

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;

    late final Widget primary;
    late final Widget secondary;

    // Resources are no longer tied to a specific scale/result. A result either
    // routes to the help center (risk) or to a professional, always offering a
    // generic "take help from our resources" path to the library.
    if (result.needsHelpCenter) {
      primary = FilledButton.icon(
        onPressed: () => _goHelp(context),
        icon: const Icon(Icons.favorite_rounded),
        label: Text(l.followUpHelpCenter),
      );
      secondary = OutlinedButton.icon(
        onPressed: () => _goProfessionals(context),
        icon: const Icon(Icons.psychology_outlined),
        label: Text(l.followUpTalkToProfessional),
      );
    } else {
      primary = FilledButton.icon(
        onPressed: () => _goProfessionals(context),
        icon: const Icon(Icons.psychology_outlined),
        label: Text(l.followUpTalkToProfessional),
      );
      secondary = OutlinedButton.icon(
        onPressed: () => _goResources(context),
        icon: const Icon(Icons.spa_outlined),
        label: Text(l.followUpTakeHelpResources),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(l.followUpTitle),
        const Gap(AppSpacing.sm),
        primary,
        const Gap(AppSpacing.sm),
        secondary,
      ],
    );
  }
}

class _ResultLine extends StatelessWidget {
  const _ResultLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const Gap.horizontal(AppSpacing.sm),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodyMedium?.copyWith(height: 1.35),
            ),
          ),
        ],
      ),
    );
  }
}
