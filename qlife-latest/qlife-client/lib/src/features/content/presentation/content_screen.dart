import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/content_item.dart';
import 'content_player_screen.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/content_repository.dart';

class ContentScreen extends ConsumerWidget {
  const ContentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncContent = ref.watch(_contentProvider);
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.contentTitle,
            subtitle: l.navContentDesc,
            showBack: true,
            actions: [
              IconButton(
                onPressed: () => ref.invalidate(_contentProvider),
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
          Expanded(
            child: asyncContent.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadContent,
                onRetry: () => ref.invalidate(_contentProvider),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return EmptyView(message: l.emptyContent);
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                  itemBuilder: (context, idx) {
                    final item = items[idx];
                    final theme = Theme.of(context);
                    return AppCard(
                      onTap: () => _openItem(context, ref, item),
                      child: Row(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: AppColors.tertiary.withValues(alpha: 0.12),
                              borderRadius:
                                  BorderRadius.circular(AppRadius.md),
                            ),
                            child: Icon(
                              item.watched
                                  ? Icons.check_circle_rounded
                                  : Icons.play_circle_outline_rounded,
                              color: item.watched
                                  ? AppSemanticColors.of(context).success
                                  : AppColors.tertiary,
                            ),
                          ),
                          const Gap.horizontal(AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.title,
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                if ((item.provider ?? '').isNotEmpty) ...[
                                  const Gap(2),
                                  Text(
                                    item.provider!,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.star_outline_rounded),
                            tooltip: l.rateThisContent,
                            color: AppSemanticColors.of(context).rating,
                            onPressed: () =>
                                _showRatingDialog(context, ref, item),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openItem(
      BuildContext context, WidgetRef ref, ContentItem item) async {
    // YouTube videos play IN-APP so we can track real watch progress — the
    // player records the view on play and marks it completed only at the end
    // (rather than the old behaviour of marking completed the instant the
    // external YouTube app was launched).
    if (item.provider == 'YOUTUBE' && (item.providerRef ?? '').isNotEmpty) {
      context.push(
        const ContentPlayerRoute().location,
        extra: ContentPlayerArgs(
          contentKey: item.contentKey,
          videoId: item.providerRef!,
          title: item.title,
        ),
      );
      return;
    }

    // Non-video / unsupported provider: record a view and open externally.
    try {
      await ref
          .read(contentRepositoryProvider)
          .markViewed(item.contentKey, completed: false);
    } catch (_) {}
    if ((item.providerRef ?? '').isNotEmpty) {
      final uri =
          Uri.parse('https://www.youtube.com/watch?v=${item.providerRef}');
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _showRatingDialog(
      BuildContext context, WidgetRef ref, ContentItem item) async {
    int? selectedRating;
    final commentCtrl = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final l = ctx.l10n;
          return AlertDialog(
            title: Text(l.rateThisContent),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) {
                    final rating = i + 1;
                    return IconButton(
                      icon: Icon(
                        rating <= (selectedRating ?? 0)
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        color: AppSemanticColors.of(ctx).rating,
                      ),
                      onPressed: () =>
                          setDialogState(() => selectedRating = rating),
                    );
                  }),
                ),
                const Gap(AppSpacing.sm),
                TextField(
                  controller: commentCtrl,
                  decoration: InputDecoration(labelText: l.commentOptional),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: Text(l.actionCancel),
              ),
              FilledButton(
                onPressed: selectedRating == null
                    ? null
                    : () => Navigator.of(ctx).pop(),
                child: Text(l.actionSubmit),
              ),
            ],
          );
        },
      ),
    );

    if (selectedRating != null && context.mounted) {
      final l = context.l10n;
      try {
        await ref.read(contentRepositoryProvider).rate(
              item.contentKey,
              rating: selectedRating!,
              comment: commentCtrl.text.trim().isEmpty
                  ? null
                  : commentCtrl.text.trim(),
            );
        commentCtrl.dispose();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l.ratedStars(selectedRating!))),
          );
        }
      } catch (e) {
        commentCtrl.dispose();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l.ratingSubmitFailed)),
          );
        }
      }
    } else {
      commentCtrl.dispose();
    }
  }
}

final _contentProvider = FutureProvider<List<ContentItem>>((ref) async {
  return ref.read(contentRepositoryProvider).list();
});
