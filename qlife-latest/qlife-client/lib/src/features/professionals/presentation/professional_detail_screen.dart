import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/professional.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../appointments/data/appointments_repository.dart';
import '../data/professionals_repository.dart';

String weekdayLabel(BuildContext context, String w) {
  final l = context.l10n;
  return switch (w) {
    'SUNDAY' => l.weekdaySunday,
    'MONDAY' => l.weekdayMonday,
    'TUESDAY' => l.weekdayTuesday,
    'WEDNESDAY' => l.weekdayWednesday,
    'THURSDAY' => l.weekdayThursday,
    'FRIDAY' => l.weekdayFriday,
    _ => l.weekdaySaturday,
  };
}

class ProfessionalDetailScreen extends ConsumerWidget {
  final String id;
  // When opened via prefetch (load-then-navigate), the already-loaded profile
  // is passed in so no on-arrival loader is shown. Null for deep links.
  final Professional? initial;
  const ProfessionalDetailScreen({super.key, required this.id, this.initial});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = context.l10n;
    final seed = initial;
    if (seed != null) return Scaffold(body: _content(context, ref, seed));

    final async = ref.watch(_professionalDetailProvider(id));
    return Scaffold(
      body: async.when(
        loading: () => Column(
          children: [
            GradientHeader(title: l.navProfessionals, showBack: true, compact: true),
            const Expanded(child: LoadingView()),
          ],
        ),
        error: (e, _) => Column(
          children: [
            GradientHeader(title: l.navProfessionals, showBack: true, compact: true),
            Expanded(
              child: ErrorView(
                message: l.errLoadProfessionals,
                onRetry: () => ref.invalidate(_professionalDetailProvider(id)),
              ),
            ),
          ],
        ),
        data: (p) => _content(context, ref, p),
      ),
    );
  }

  Widget _content(BuildContext context, WidgetRef ref, Professional p) {
    final l = context.l10n;
    final isBn = Localizations.localeOf(context).languageCode == 'bn';
    final fee = p.feeAmount;
    return Column(
            children: [
              GradientHeader(
                title: p.fullName,
                subtitle: p.professionLabel,
                showBack: true,
                compact: true,
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  children: [
                    if (fee != null)
                      InfoRow(
                        icon: Icons.payments_outlined,
                        label: l.labelFee,
                        value: '$fee ${p.feeCurrency ?? 'BDT'}',
                      ),
                    if (p.designation != null && p.designation!.isNotEmpty)
                      InfoRow(
                        icon: Icons.badge_outlined,
                        label: l.fieldDesignationOptional,
                        value: p.designation!,
                      ),
                    if (p.workplace != null && p.workplace!.isNotEmpty)
                      InfoRow(
                        icon: Icons.business_outlined,
                        label: l.fieldWorkplaceOptional,
                        value: p.workplace!,
                      ),
                    if (p.districtNameBn != null && p.districtNameBn!.isNotEmpty)
                      InfoRow(
                        icon: Icons.location_on_outlined,
                        label: l.fieldDistrict,
                        value: p.districtNameBn!,
                      ),
                    if (p.educationSummary != null &&
                        p.educationSummary!.isNotEmpty)
                      InfoRow(
                        icon: Icons.school_outlined,
                        label: l.labelEducation,
                        value: p.educationSummary!,
                      ),
                    if (p.bio != null && p.bio!.isNotEmpty)
                      InfoRow(
                        icon: Icons.person_outline_rounded,
                        label: l.labelAbout,
                        value: p.bio!,
                      ),
                    if (p.specializations.isNotEmpty) ...[
                      SectionHeader(l.sectionSpecializations),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.xs,
                        children: p.specializations.map((s) {
                          final label = (isBn ? s.nameBn : s.nameEn);
                          final text = s.note != null && s.note!.isNotEmpty
                              ? '$label (${s.note})'
                              : label;
                          return Chip(label: Text(text));
                        }).toList(),
                      ),
                    ],
                    SectionHeader(l.labelAvailability),
                    if (p.availability.isEmpty)
                      Text(l.noScheduleSet,
                          style: Theme.of(context).textTheme.bodySmall)
                    else
                      ...p.availability.map((a) => InfoRow(
                            icon: Icons.schedule_rounded,
                            label: weekdayLabel(context, a.weekday),
                            value: '${a.startLabel} – ${a.endLabel}',
                          )),
                    const Gap(AppSpacing.xl),
                    if (p.acceptingNewClients == false)
                      Text(l.notAcceptingClients,
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.error)),
                  ],
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  child: FilledButton.icon(
                    onPressed: p.acceptingNewClients == false
                        ? null
                        : () => _showRequestSheet(context, ref, p),
                    icon: const Icon(Icons.calendar_month_rounded),
                    label: Text(l.actionRequestAppointment),
                  ),
                ),
              ),
            ],
          );
  }

  void _showRequestSheet(BuildContext context, WidgetRef ref, Professional p) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => _AppointmentRequestSheet(
        professional: p,
        onRequest: (requestedAt, message, shareProfile) async {
          await ref.read(appointmentsRepositoryProvider).request(
                professionalProfileId: p.id,
                requestedStartAt: requestedAt,
                requestMessage: message,
                profileShareGranted: shareProfile,
              );
        },
      ),
    );
  }
}

class _AppointmentRequestSheet extends StatefulWidget {
  final Professional professional;
  final Future<void> Function(
      DateTime requestedAt, String? message, bool shareProfile) onRequest;

  const _AppointmentRequestSheet({
    required this.professional,
    required this.onRequest,
  });

  @override
  State<_AppointmentRequestSheet> createState() =>
      _AppointmentRequestSheetState();
}

class _AppointmentRequestSheetState extends State<_AppointmentRequestSheet> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  bool _shareProfile = false;
  final _messageCtrl = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null && mounted) setState(() => _selectedDate = date);
  }

  Future<void> _pickTime() async {
    final time =
        await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (time != null && mounted) setState(() => _selectedTime = time);
  }

  Future<void> _submit() async {
    final l = context.l10n;
    if (_selectedDate == null || _selectedTime == null) {
      setState(() => _error = l.selectDateTimeError);
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final dt = DateTime.utc(_selectedDate!.year, _selectedDate!.month,
          _selectedDate!.day, _selectedTime!.hour, _selectedTime!.minute);
      final msg =
          _messageCtrl.text.trim().isEmpty ? null : _messageCtrl.text.trim();
      await widget.onRequest(dt, msg, _shareProfile);
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.apptRequested)));
    } catch (e) {
      if (mounted) {
        setState(() => _error = context.l10n.requestAppointmentFailed);
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final theme = Theme.of(context);
    final dateLabel = _selectedDate == null
        ? l.selectDate
        : '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
    final timeLabel = _selectedTime == null
        ? l.selectTime
        : '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.sm,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l.requestAppointmentWith(widget.professional.fullName),
            style: theme.textTheme.titleMedium,
          ),
          const Gap(AppSpacing.lg),
          if (_error != null) ...[
            Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
            const Gap(AppSpacing.sm),
          ],
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _submitting ? null : _pickDate,
                  icon: const Icon(Icons.calendar_today_rounded),
                  label: Text(dateLabel),
                ),
              ),
              const Gap.horizontal(AppSpacing.sm),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _submitting ? null : _pickTime,
                  icon: const Icon(Icons.access_time_rounded),
                  label: Text(timeLabel),
                ),
              ),
            ],
          ),
          const Gap(AppSpacing.md),
          TextFormField(
            controller: _messageCtrl,
            decoration: InputDecoration(labelText: l.fieldMessageOptional),
            maxLines: 3,
            maxLength: 500,
            enabled: !_submitting,
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(l.shareProfileWithPro),
            subtitle: Text(l.shareProfileHint),
            value: _shareProfile,
            onChanged:
                _submitting ? null : (v) => setState(() => _shareProfile = v),
          ),
          const Gap(AppSpacing.sm),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? l.actionSubmitting : l.actionConfirm),
          ),
        ],
      ),
    );
  }
}

final _professionalDetailProvider =
    FutureProvider.family.autoDispose<Professional, String>((ref, id) async {
  return ref.read(professionalsRepositoryProvider).get(id);
});
