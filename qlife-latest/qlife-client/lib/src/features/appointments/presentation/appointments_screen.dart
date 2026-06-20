import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/router.dart';
import '../../../app/tab_refresh.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/appointment.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/prefetch.dart';
import '../data/appointments_repository.dart';

class AppointmentsScreen extends ConsumerWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncAppointments = ref.watch(_appointmentsProvider);
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.navAppointments,
            subtitle: l.navAppointmentsDesc,
            actions: [
              IconButton(
                onPressed: () => ref.invalidate(_appointmentsProvider),
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
          Expanded(
            child: asyncAppointments.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadAppointments,
                onRetry: () => ref.invalidate(_appointmentsProvider),
              ),
              data: (result) {
                if (result.items.isEmpty) {
                  return EmptyView(message: l.emptyAppointments);
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  itemCount: result.items.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.md),
                  itemBuilder: (context, idx) {
                    final a = result.items[idx];
                    final counterpart = a.counterpartName;
                    final requested = a.requestedStartAt ?? '';
                    return AppCard(
                      onTap: () => prefetchThenPush<AppointmentDetail>(
                        context,
                        future:
                            ref.read(appointmentsRepositoryProvider).get(a.id),
                        location: AppointmentDetailRoute(id: a.id).location,
                        errorMessage: l.errLoadAppointmentDetail,
                        useGo: true,
                      ),
                      child: Row(
                        children: [
                          InitialAvatar(
                            name: counterpart.isNotEmpty
                                ? counterpart
                                : l.appointmentTitle,
                            size: 48,
                          ),
                          const Gap.horizontal(AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  counterpart.isNotEmpty
                                      ? counterpart
                                      : l.appointmentTitle,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall
                                      ?.copyWith(fontWeight: FontWeight.w600),
                                ),
                                const Gap(AppSpacing.xs),
                                Row(
                                  children: [
                                    StatusBadge(
                                      humanizeStatus(a.status),
                                      color: statusTone(context, a.status),
                                    ),
                                    if (requested.isNotEmpty) ...[
                                      const Gap.horizontal(AppSpacing.sm),
                                      Expanded(
                                        child: Text(
                                          requested,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall
                                              ?.copyWith(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .onSurfaceVariant,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: Theme.of(context).colorScheme.outline,
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
}

final _appointmentsProvider =
    FutureProvider<PagedResult<AppointmentSummary>>((ref) async {
  ref.watch(tabRefreshProvider);
  return ref.read(appointmentsRepositoryProvider).list(page: 1);
});
