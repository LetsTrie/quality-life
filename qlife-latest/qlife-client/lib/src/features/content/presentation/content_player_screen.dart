import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/content_repository.dart';

/// Arguments for the in-app content player, passed via GoRouter `extra`.
class ContentPlayerArgs {
  final String contentKey;
  final String videoId;
  final String title;
  const ContentPlayerArgs({
    required this.contentKey,
    required this.videoId,
    required this.title,
  });
}

/// Plays a YouTube video INSIDE the app (instead of launching the YouTube app)
/// so we can track whether it was actually watched: a view is recorded on first
/// play, and marked completed only when playback reaches the end.
class ContentPlayerScreen extends ConsumerStatefulWidget {
  final ContentPlayerArgs args;
  const ContentPlayerScreen({super.key, required this.args});

  @override
  ConsumerState<ContentPlayerScreen> createState() =>
      _ContentPlayerScreenState();
}

class _ContentPlayerScreenState extends ConsumerState<ContentPlayerScreen> {
  late final YoutubePlayerController _controller;
  StreamSubscription<YoutubePlayerValue>? _sub;

  bool _viewTracked = false;
  bool _completedTracked = false;
  bool _completed = false;

  @override
  void initState() {
    super.initState();
    _controller = YoutubePlayerController.fromVideoId(
      videoId: widget.args.videoId,
      autoPlay: false,
      params: const YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: true,
      ),
    );
    _sub = _controller.stream.listen(_onValue);
  }

  void _onValue(YoutubePlayerValue value) {
    // First playback → record a view (not yet completed).
    if (value.playerState == PlayerState.playing && !_viewTracked) {
      _viewTracked = true;
      _track(completed: false);
    }
    // Reached the end → mark completed exactly once.
    if (value.playerState == PlayerState.ended && !_completedTracked) {
      _completedTracked = true;
      _track(completed: true);
      if (mounted) setState(() => _completed = true);
    }
  }

  Future<void> _track({required bool completed}) async {
    // Best-effort: tracking must never interrupt playback.
    try {
      await ref
          .read(contentRepositoryProvider)
          .markViewed(widget.args.contentKey, completed: completed);
    } catch (_) {}
  }

  @override
  void dispose() {
    _sub?.cancel();
    _controller.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final theme = Theme.of(context);

    return Scaffold(
      body: YoutubePlayerControllerProvider(
        controller: _controller,
        child: Column(
          children: [
            GradientHeader(title: widget.args.title, showBack: true, compact: true),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: YoutubePlayer(controller: _controller),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.page),
                children: [
                  Text(
                    widget.args.title,
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const Gap(AppSpacing.md),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _completed
                            ? Icons.check_circle_rounded
                            : Icons.timelapse_rounded,
                        size: 20,
                        color: _completed
                            ? AppColors.primary
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                      const Gap.horizontal(AppSpacing.sm),
                      Expanded(
                        child: Text(
                          _completed ? l.watchCompleted : l.watchTrackingNote,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: _completed
                                ? AppColors.primary
                                : theme.colorScheme.onSurfaceVariant,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
