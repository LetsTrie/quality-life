import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/professional.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/prefetch.dart';
import '../data/professionals_repository.dart';

const _professionTypes = <String>[
  'CLINICAL_PSYCHOLOGIST',
  'ASSISTANT_CLINICAL_PSYCHOLOGIST',
  'PSYCHIATRIST',
  'COUNSELOR',
  'OTHER',
];

class ProfessionalsScreen extends ConsumerStatefulWidget {
  const ProfessionalsScreen({super.key});

  @override
  ConsumerState<ProfessionalsScreen> createState() =>
      _ProfessionalsScreenState();
}

class _ProfessionalsScreenState extends ConsumerState<ProfessionalsScreen> {
  final _searchCtrl = TextEditingController();
  String? _professionType;
  late Future<PagedResult<Professional>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<PagedResult<Professional>> _load() {
    return ref.read(professionalsRepositoryProvider).list(
          q: _searchCtrl.text,
          professionType: _professionType,
        );
  }

  void _reload() => setState(() => _future = _load());

  Future<void> _refresh() async {
    setState(() => _future = _load());
    try {
      await _future;
    } catch (_) {
      // FutureBuilder renders the error state; RefreshIndicator just needs to stop.
    }
  }

  String _professionLabel(BuildContext context, String v) {
    final l = context.l10n;
    return switch (v) {
      'CLINICAL_PSYCHOLOGIST' => l.professionClinicalPsychologist,
      'ASSISTANT_CLINICAL_PSYCHOLOGIST' =>
        l.professionAssistantClinicalPsychologist,
      'PSYCHIATRIST' => l.professionPsychiatrist,
      'COUNSELOR' => l.professionCounselor,
      _ => l.professionOther,
    };
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.navProfessionals,
            subtitle: l.navProfessionalsDesc,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.page, AppSpacing.md, AppSpacing.page, 0),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: l.searchByName,
                    prefixIcon: const Icon(Icons.search_rounded),
                    isDense: true,
                  ),
                  textInputAction: TextInputAction.search,
                  onSubmitted: (_) => _reload(),
                ),
                const Gap(AppSpacing.sm),
                DropdownMenu<String?>(
                  initialSelection: _professionType,
                  label: Text(l.allProfessions),
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) {
                    _professionType = v;
                    _reload();
                  },
                  dropdownMenuEntries: [
                    DropdownMenuEntry(value: null, label: l.allProfessions),
                    ..._professionTypes.map((p) => DropdownMenuEntry(
                        value: p, label: _professionLabel(context, p))),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<PagedResult<Professional>>(
              future: _future,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const LoadingView();
                }
                if (snap.hasError) {
                  return ErrorView(
                    message: l.errLoadProfessionals,
                    onRetry: _reload,
                  );
                }
                final items = snap.data?.items ?? const [];
                if (items.isEmpty) {
                  final theme = Theme.of(context);
                  return RefreshIndicator(
                    onRefresh: _refresh,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: SizedBox(
                        height: MediaQuery.sizeOf(context).height * 0.45,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const AppIllustration(AppArt.empty, height: 132),
                            const Gap(AppSpacing.lg),
                            Text(
                              l.emptyProfessionals,
                              textAlign: TextAlign.center,
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const Gap(AppSpacing.sm),
                            Text(
                              l.emptyProfessionalsHint,
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const Gap(AppSpacing.lg),
                            OutlinedButton.icon(
                              onPressed: _reload,
                              icon: const Icon(Icons.refresh_rounded),
                              label: Text(l.actionRetry),
                              style: OutlinedButton.styleFrom(
                                minimumSize: const Size(0, 44),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.lg),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.page),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                    itemBuilder: (context, idx) {
                      final p = items[idx];
                      return AppCard(
                        onTap: () => prefetchThenPush<Professional>(
                          context,
                          future: ref
                              .read(professionalsRepositoryProvider)
                              .get(p.id),
                          location: ProfessionalDetailRoute(id: p.id).location,
                          errorMessage: l.errLoadProfessionals,
                        ),
                        child: Row(
                          children: [
                            InitialAvatar(name: p.fullName, size: 52),
                            const Gap.horizontal(AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p.fullName,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleSmall
                                        ?.copyWith(fontWeight: FontWeight.w600),
                                  ),
                                  const Gap(2),
                                  Text(
                                    p.professionLabel,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onSurfaceVariant,
                                        ),
                                  ),
                                  if (p.feeAmount != null) ...[
                                    const Gap(2),
                                    Text(
                                      '${context.l10n.labelFee}: ${p.feeAmount} ${p.feeCurrency ?? 'BDT'}',
                                      style:
                                          Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const Gap.horizontal(AppSpacing.sm),
                            const Icon(Icons.chevron_right_rounded),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
