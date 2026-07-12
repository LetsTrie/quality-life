import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/professional_repository.dart';

/// Read-only, comprehensive view of the signed-in professional's own profile —
/// every field collected during onboarding, with an Edit action that reuses the
/// onboarding form. Fills the previous gap where onboarding data could never be
/// reviewed or updated.
class ProfessionalProfileScreen extends ConsumerWidget {
  const ProfessionalProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final async = ref.watch(professionalMeProvider);
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.navProfile,
            showBack: true,
            compact: true,
            actions: [
              IconButton(
                tooltip: l.actionEditProfile,
                onPressed: () =>
                    context.push(const ProfessionalProfileEditRoute().location),
                icon: const Icon(Icons.edit_outlined),
              ),
            ],
          ),
          Expanded(
            child: async.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: l.errLoadProfile,
                onRetry: () => ref.invalidate(professionalMeProvider),
              ),
              data: (p) => _ProfileBody(data: p),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileBody extends StatelessWidget {
  final Map<String, dynamic> data;
  const _ProfileBody({required this.data});

  String? _s(dynamic v) {
    final s = v?.toString().trim();
    return (s == null || s.isEmpty) ? null : s;
  }

  String _weekday(BuildContext context, String? raw) {
    final l = context.l10n;
    switch (raw) {
      case 'SATURDAY':
        return l.weekdaySaturday;
      case 'SUNDAY':
        return l.weekdaySunday;
      case 'MONDAY':
        return l.weekdayMonday;
      case 'TUESDAY':
        return l.weekdayTuesday;
      case 'WEDNESDAY':
        return l.weekdayWednesday;
      case 'THURSDAY':
        return l.weekdayThursday;
      case 'FRIDAY':
        return l.weekdayFriday;
      default:
        return raw ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final na = l.labelNotSet;
    final locale = Localizations.localeOf(context);
    final isBn = locale.languageCode == 'bn';

    // Verification status pill.
    final verifications = (data['verifications'] as List<dynamic>?) ?? const [];
    final status = verifications.isNotEmpty
        ? (verifications.first as Map<String, dynamic>)['status']?.toString()
        : null;

    // Location (Bangla place names come from the backend).
    final loc = [
      (data['union'] as Map<String, dynamic>?)?['nameBn'],
      (data['upazila'] as Map<String, dynamic>?)?['nameBn'],
      (data['district'] as Map<String, dynamic>?)?['nameBn'],
    ].map((e) => e?.toString().trim()).where((e) => e != null && e.isNotEmpty).join(', ');

    // Specializations (name in the active language, with any free-text note).
    final specs = (data['specializations'] as List<dynamic>?) ?? const [];
    final specNames = specs.map((s) {
      final m = s as Map<String, dynamic>;
      final spec = m['specialization'] as Map<String, dynamic>?;
      final name = isBn
          ? (spec?['nameBn'] ?? spec?['nameEn'])
          : (spec?['nameEn'] ?? spec?['nameBn']);
      final note = _s(m['note']);
      return note != null ? '$name — $note' : name?.toString();
    }).whereType<String>().toList();

    final availability = (data['availability'] as List<dynamic>?) ?? const [];
    final caseloads = (data['caseloads'] as List<dynamic>?) ?? const [];

    final fee = _s(data['feeAmount']);
    final feeCurrency = _s(data['feeCurrency']) ?? 'BDT';

    return ListView(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.page,
        AppSpacing.lg,
        AppSpacing.page,
        AppSpacing.page + MediaQuery.of(context).viewPadding.bottom,
      ),
      children: [
        Row(
          children: [
            InitialAvatar(name: _s(data['fullName']) ?? '?', size: 56),
            const Gap.horizontal(AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _s(data['fullName']) ?? na,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  if (_s(data['professionType']) != null) ...[
                    const Gap(AppSpacing.xs),
                    Text(_s(data['professionType'])!,
                        style: Theme.of(context).textTheme.bodyMedium),
                  ],
                  if (status != null) ...[
                    const Gap(AppSpacing.sm),
                    StatusBadge(humanizeStatus(status),
                        color: statusTone(context, status)),
                  ],
                ],
              ),
            ),
          ],
        ),
        const Gap(AppSpacing.lg),

        SectionHeader(l.sectionBasics),
        AppCard(
          child: Column(children: [
            InfoRow(icon: Icons.person_outline_rounded, label: l.fieldGender, value: _s(data['gender']) ?? na),
            InfoRow(icon: Icons.badge_outlined, label: l.fieldDesignation, value: _s(data['designation']) ?? na),
          ]),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionCredentials),
        AppCard(
          child: Column(children: [
            InfoRow(icon: Icons.verified_outlined, label: l.fieldBmdcOptional, value: _s(data['bmdcRegistrationNo']) ?? na),
            InfoRow(icon: Icons.school_outlined, label: l.fieldGraduationBatchOptional, value: _s(data['graduationBatch']) ?? na),
            InfoRow(icon: Icons.menu_book_outlined, label: l.fieldEducation, value: _s(data['educationSummary']) ?? na),
          ]),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionPractice),
        AppCard(
          child: Column(children: [
            InfoRow(icon: Icons.business_outlined, label: l.fieldWorkplaceOptional, value: _s(data['workplace']) ?? na),
            InfoRow(icon: Icons.work_history_outlined, label: l.fieldYearsRequired, value: _s(data['yearsOfExperience']) ?? na),
            InfoRow(icon: Icons.phone_outlined, label: l.fieldPhoneRequired, value: _s(data['phone']) ?? na),
            InfoRow(icon: Icons.info_outline_rounded, label: l.fieldBioOptional, value: _s(data['bio']) ?? na),
          ]),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionFees),
        AppCard(
          child: InfoRow(
            icon: Icons.payments_outlined,
            label: l.fieldFeeAmount,
            value: fee != null ? '$fee $feeCurrency' : na,
          ),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionLocation),
        AppCard(
          child: InfoRow(
            icon: Icons.place_outlined,
            label: l.sectionLocation,
            value: loc.isNotEmpty ? loc : na,
          ),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionSpecializations),
        AppCard(
          child: specNames.isEmpty
              ? Text(na, style: Theme.of(context).textTheme.bodyLarge)
              : Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: [for (final s in specNames) Chip(label: Text(s))],
                ),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionAvailability),
        AppCard(
          child: availability.isEmpty
              ? Text(na, style: Theme.of(context).textTheme.bodyLarge)
              : Column(
                  children: [
                    for (final a in availability)
                      InfoRow(
                        icon: Icons.schedule_rounded,
                        label: _weekday(context, (a as Map<String, dynamic>)['weekday']?.toString()),
                        value:
                            '${_s(a['startTime']) ?? ''} – ${_s(a['endTime']) ?? ''}',
                      ),
                  ],
                ),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionCaseload),
        AppCard(
          child: Column(children: [
            InfoRow(icon: Icons.groups_outlined, label: l.fieldMaxWeeklyClientsRequired, value: _s(data['maxWeeklyClients']) ?? na),
            InfoRow(icon: Icons.group_outlined, label: l.fieldAvgWeeklyClientsRequired, value: _s(data['avgWeeklyClients']) ?? na),
            for (final c in caseloads)
              InfoRow(
                icon: Icons.location_city_outlined,
                label: _s((c as Map<String, dynamic>)['locationLabel']) ?? l.fieldCaseloadLocation,
                value: _s(c['clientCount']) ?? na,
              ),
          ]),
        ),
        const Gap(AppSpacing.md),

        SectionHeader(l.sectionVisibility),
        AppCard(
          child: Column(children: [
            InfoRow(
              icon: Icons.event_available_outlined,
              label: l.acceptingNewClients,
              value: (data['acceptingNewClients'] as bool? ?? false) ? l.labelYes : l.labelNo,
            ),
            InfoRow(
              icon: Icons.visibility_outlined,
              label: l.fieldVisibleInDirectory,
              value: (data['isVisible'] as bool? ?? false) ? l.labelYes : l.labelNo,
            ),
            InfoRow(icon: Icons.link_outlined, label: l.fieldReferralSource, value: _s(data['referralSource']) ?? na),
          ]),
        ),
      ],
    );
  }
}
