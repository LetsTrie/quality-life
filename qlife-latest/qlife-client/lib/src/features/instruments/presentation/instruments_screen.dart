import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/widgets/prefetch.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/instrument.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/instruments_repository.dart';
import '../scale_localization.dart';

class InstrumentsScreen extends ConsumerWidget {
  const InstrumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncInstruments = ref.watch(_instrumentsProvider);
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.scalesTitle,
            subtitle: l.navScalesDesc,
            actions: [
              IconButton(
                onPressed: () => ref.invalidate(_instrumentsProvider),
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
          Expanded(
            child: asyncInstruments.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadScales,
                onRetry: () => ref.invalidate(_instrumentsProvider),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return EmptyView(message: l.emptyScales);
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.page,
                    AppSpacing.lg,
                    AppSpacing.page,
                    AppSpacing.xl,
                  ),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                  itemBuilder: (context, idx) {
                    final instrument = items[idx];
                    return FeatureCard(
                      icon: Icons.self_improvement_rounded,
                      title: localizedScaleName(
                        context,
                        slug: instrument.slug,
                        fallback: instrument.name,
                        serverNameBn: instrument.nameBn,
                      ),
                      subtitle: localizedScaleCategory(
                        context,
                        instrument.category,
                        serverLabelEn: instrument.categoryLabelEn,
                        serverLabelBn: instrument.categoryLabelBn,
                      ),
                      tint: AppColors.primary,
                      onTap: () => prefetchThenPush<InstrumentDetail>(
                        context,
                        future: ref
                            .read(instrumentsRepositoryProvider)
                            .getInstrument(instrument.slug),
                        location:
                            InstrumentDetailRoute(slug: instrument.slug).location,
                        errorMessage: l.errLoadScaleDetail,
                        useGo: true,
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
}

final _instrumentsProvider =
    FutureProvider<List<InstrumentSummary>>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(instrumentsRepositoryProvider).listInstruments();
});
