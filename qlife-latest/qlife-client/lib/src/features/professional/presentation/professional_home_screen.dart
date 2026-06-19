import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/app_illustration.dart';
import '../../../shared/providers/tips_provider.dart';
import '../../../shared/widgets/daily_tip_card.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/professional_repository.dart';

/// Latest verification status (PENDING/APPROVED/REJECTED/REVOKED) for the
/// signed-in professional, surfaced as a dashboard banner.
final _verificationStatusProvider =
    FutureProvider.autoDispose<String?>((ref) async {
  final res = await ref.read(professionalRepositoryProvider).me();
  final data = (res['data'] as Map<String, dynamic>)['professional']
      as Map<String, dynamic>;
  final verifications = (data['verifications'] as List<dynamic>?) ?? const [];
  if (verifications.isEmpty) return null;
  return (verifications.first as Map<String, dynamic>)['status']?.toString();
});

class ProfessionalHomeScreen extends ConsumerWidget {
  const ProfessionalHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final status = ref.watch(_verificationStatusProvider).valueOrNull;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.proDashTitle,
            subtitle: l.proDashGreeting,
            art: AppArt.meditation,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.lg,
                AppSpacing.page,
                AppSpacing.xl,
              ),
              children: [
                if (status != null) ...[
                  AppCard(
                    child: Row(
                      children: [
                        Icon(
                          status == 'APPROVED'
                              ? Icons.verified_rounded
                              : Icons.hourglass_top_rounded,
                          color: statusTone(context, status),
                        ),
                        const Gap.horizontal(AppSpacing.md),
                        Expanded(child: Text(l.verificationStatus(humanizeStatus(status)))),
                        StatusBadge(
                          humanizeStatus(status),
                          color: statusTone(context, status),
                        ),
                      ],
                    ),
                  ),
                  const Gap(AppSpacing.md),
                ],
                Builder(builder: (context) {
                  final isBn = Localizations.localeOf(context).languageCode == 'bn';
                  final serverTips = ref.watch(tipsProvider('professional'));
                  final tips = serverTips.maybeWhen(
                    data: (list) => list.map((t) => isBn ? t.bn : t.en).toList(),
                    orElse: () => [l.proTip1, l.proTip2, l.proTip3],
                  );
                  return DailyTipCard(
                    title: l.proTipTitle,
                    icon: Icons.tips_and_updates_outlined,
                    tips: tips,
                  );
                }),
                const Gap(AppSpacing.lg),
                FeatureCard(
                  icon: Icons.event_note_rounded,
                  title: l.proAppointmentRequests,
                  subtitle: l.proAppointmentRequestsDesc,
                  onTap: () => context.go(const AppointmentsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.groups_rounded,
                  title: l.proMyClients,
                  subtitle: l.proMyClientsDesc,
                  tint: AppColors.secondary,
                  onTap: () => context.go(const ClientsRoute().location),
                ),
                const Gap(AppSpacing.md),
                FeatureCard(
                  icon: Icons.notifications_none_rounded,
                  title: l.navNotifications,
                  subtitle: l.navNotificationsDesc,
                  tint: AppColors.tertiary,
                  onTap: () =>
                      context.push(const NotificationsRoute().location),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
