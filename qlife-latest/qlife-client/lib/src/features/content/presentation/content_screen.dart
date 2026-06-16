import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../shared/models/content_item.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../data/content_repository.dart';

class ContentScreen extends ConsumerWidget {
  const ContentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncContent = ref.watch(_contentProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Content'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_contentProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncContent.when(
        loading: () => const LoadingView(),
        error: (e, _) => const ErrorView(
          message: 'Could not load content. Please try again.',
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyView(
              message: 'No content available yet',
              icon: Icons.video_library_outlined,
            );
          }
          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final item = items[idx];
              return ListTile(
                title: Text(item.title),
                subtitle: Text(item.provider ?? ''),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.play_arrow),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.star_outline),
                      tooltip: 'Rate',
                      onPressed: () => _showRatingDialog(context, ref, item),
                    ),
                  ],
                ),
                onTap: () async {
                  // View tracking is best-effort and must not block opening the
                  // content or surface as an uncaught async error.
                  try {
                    await ref
                        .read(contentRepositoryProvider)
                        .markViewed(item.contentKey, completed: true);
                  } catch (_) {
                    // ignore: tracking failure should not interrupt playback
                  }
                  if (item.provider == 'YOUTUBE' && item.providerRef != null) {
                    final uri = Uri.parse('https://www.youtube.com/watch?v=${item.providerRef}');
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _showRatingDialog(BuildContext context, WidgetRef ref, ContentItem item) async {
    int? selectedRating;
    final commentCtrl = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Rate this content'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final rating = i + 1;
                  return IconButton(
                    icon: Icon(
                      rating <= (selectedRating ?? 0) ? Icons.star : Icons.star_outline,
                      color: AppSemanticColors.of(context).rating,
                    ),
                    onPressed: () => setDialogState(() => selectedRating = rating),
                  );
                }),
              ),
              const Gap(AppSpacing.sm),
              TextField(
                controller: commentCtrl,
                decoration: const InputDecoration(
                  labelText: 'Comment (optional)',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: selectedRating == null
                  ? null
                  : () => Navigator.of(ctx).pop(),
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );

    if (selectedRating != null && context.mounted) {
      try {
        await ref.read(contentRepositoryProvider).rate(
              item.contentKey,
              rating: selectedRating!,
              comment: commentCtrl.text.trim().isEmpty ? null : commentCtrl.text.trim(),
            );
        commentCtrl.dispose();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Rated $selectedRating star${selectedRating == 1 ? '' : 's'}')),
          );
        }
      } catch (e) {
        commentCtrl.dispose();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to submit rating. Please try again.')),
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
