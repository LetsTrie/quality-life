import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/help_center_hotlines.dart';

/// A calm, supportive landing for the `SHOW_HELP_CENTER` /
/// `SHOW_HELP_CENTER_URGENT` assessment outcomes. Deliberately avoids clinical
/// or alarming language and routes the user to crisis hotlines, a professional,
/// or calming resources. The [urgent] variant adds an immediate-danger callout.
///
/// [slug] (the scale the user just completed) filters which hotlines are shown
/// to those relevant to that scale; absent it, all hotlines are listed.
class HelpCenterScreen extends ConsumerWidget {
  final bool urgent;
  final String? slug;
  const HelpCenterScreen({super.key, this.urgent = false, this.slug});

  Future<void> _dial(BuildContext context, HotlineContact contact) async {
    final ok = await launchUrl(contact.uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.helpCenterCallError)),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final hotlinesAsync = ref.watch(hotlinesProvider(slug));

    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.helpCenterTitle,
            subtitle: l.helpCenterSubtitle,
            showBack: true,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.page),
              children: [
                if (urgent) ...[
                  _UrgentCard(
                    title: l.helpCenterUrgentTitle,
                    body: l.helpCenterUrgentBody,
                  ),
                  const Gap(AppSpacing.lg),
                ],
                Text(
                  l.helpCenterBody,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.5),
                ),
                hotlinesAsync.when(
                  data: (hotlines) => hotlines.isEmpty
                      ? const SizedBox.shrink()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Gap(AppSpacing.xl),
                            SectionHeader(l.helpCenterHotlinesTitle),
                            const Gap(AppSpacing.sm),
                            for (final group in hotlines) ...[
                              _HotlineCard(group: group, onCall: (c) => _dial(context, c)),
                              const Gap(AppSpacing.md),
                            ],
                          ],
                        ),
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const Gap(AppSpacing.md),
                FilledButton.icon(
                  onPressed: () =>
                      context.go(const ProfessionalsDirectoryRoute().location),
                  icon: const Icon(Icons.psychology_outlined),
                  label: Text(l.helpCenterFindProfessional),
                ),
                const Gap(AppSpacing.sm),
                OutlinedButton.icon(
                  onPressed: () =>
                      context.go(const ContentLibraryRoute().location),
                  icon: const Icon(Icons.spa_outlined),
                  label: Text(l.helpCenterExploreResources),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A hotline provider with one or more tap-to-call / WhatsApp contacts.
class _HotlineCard extends StatelessWidget {
  const _HotlineCard({required this.group, required this.onCall});

  final HotlineGroup group;
  final ValueChanged<HotlineContact> onCall;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l = context.l10n;
    final bn = isBanglaLocale(context);
    final location = group.location(bn);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            group.place(bn),
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (location != null) ...[
            const Gap(AppSpacing.xs),
            Text(
              location,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ],
          const Gap(AppSpacing.sm),
          for (final contact in group.contacts)
            _ContactRow(
              contact: contact,
              tollFreeLabel: l.helpCenterTollFree,
              onTap: () => onCall(contact),
            ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({
    required this.contact,
    required this.tollFreeLabel,
    required this.onTap,
  });

  final HotlineContact contact;
  final String tollFreeLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bn = isBanglaLocale(context);
    final isWhatsapp = contact.type == HotlineContactType.whatsapp;
    final time = contact.time(bn);
    final successColor =
        theme.extension<AppSemanticColors>()?.success ?? AppColors.success;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(
          children: [
            Icon(
              isWhatsapp ? Icons.chat_rounded : Icons.call_rounded,
              size: 22,
              color: AppColors.primary,
            ),
            const Gap.horizontal(AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    contact.number,
                    style: theme.textTheme.bodyLarge
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  if (time != null)
                    Text(
                      time,
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                    ),
                ],
              ),
            ),
            if (contact.tollFree)
              StatusBadge(tollFreeLabel, color: successColor),
          ],
        ),
      ),
    );
  }
}

/// High-visibility (but still gentle) callout for the urgent variant.
class _UrgentCard extends StatelessWidget {
  const _UrgentCard({required this.title, required this.body});
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.favorite_rounded, color: AppColors.secondary),
              const Gap.horizontal(AppSpacing.sm),
              Expanded(
                child: Text(
                  title,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const Gap(AppSpacing.sm),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
        ],
      ),
    );
  }
}
