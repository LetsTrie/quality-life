import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/models/appointment.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/appointments_repository.dart';

/// Strips a trailing "label: {value}" colon so a templated l10n string can be
/// reused as a standalone field label (works for both English ":" and the
/// Bangla full-width variant).
String _label(String templated) =>
    templated.replaceAll(RegExp(r'[:：]\s*$'), '').trim();

class AppointmentDetailScreen extends ConsumerStatefulWidget {
  final String appointmentId;
  // Prefetched detail passed via the load-then-navigate flow (null for deep links).
  final AppointmentDetail? initial;
  const AppointmentDetailScreen(
      {super.key, required this.appointmentId, this.initial});

  @override
  ConsumerState<AppointmentDetailScreen> createState() =>
      _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState
    extends ConsumerState<AppointmentDetailScreen> {
  bool _acting = false;
  AppointmentDetail? _mutated;

  Future<void> _markSeen() async {
    setState(() => _acting = true);
    try {
      final a = await ref
          .read(appointmentsRepositoryProvider)
          .markSeen(widget.appointmentId);
      if (mounted) setState(() => _mutated = a);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.apptMarkSeenFailed)),
      );
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _respond(String action) async {
    DateTime? pickedDate;
    TimeOfDay? pickedTime;
    final message = TextEditingController();
    final link = TextEditingController();

    try {
      if (action != 'DECLINED') {
        pickedDate = await showDatePicker(
          context: context,
          initialDate: DateTime.now().add(const Duration(days: 1)),
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
        );
        if (pickedDate == null || !mounted) return;

        pickedTime = await showTimePicker(
          context: context,
          initialTime: TimeOfDay.now(),
        );
        if (pickedTime == null || !mounted) return;
      }

      final l = context.l10n;
      final dialogTitle = action == 'DECLINED'
          ? l.actionDecline
          : action == 'ACCEPTED'
              ? l.actionAccept
              : l.actionProposeReschedule;

      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(dialogTitle),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (pickedDate != null && pickedTime != null)
                Text(
                  context.l10n.fieldScheduled(
                      '${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')} ${pickedTime.hour.toString().padLeft(2, '0')}:${pickedTime.minute.toString().padLeft(2, '0')} UTC'),
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              if (pickedDate != null) const Gap(AppSpacing.md),
              TextField(
                controller: link,
                decoration: InputDecoration(
                  labelText: context.l10n.fieldMeetingLinkInput,
                ),
              ),
              const Gap(AppSpacing.sm),
              TextField(
                controller: message,
                decoration: InputDecoration(
                  labelText: context.l10n.fieldMessageOptional,
                ),
                minLines: 2,
                maxLines: 4,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(context.l10n.actionCancel),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text(context.l10n.actionSubmit),
            ),
          ],
        ),
      );
      if (ok != true) return;
      if (!mounted) return;

      String? scheduledIso;
      if (pickedDate != null && pickedTime != null) {
        final dt = DateTime.utc(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );
        scheduledIso = dt.toIso8601String();
      }

      setState(() => _acting = true);
      final a = await ref.read(appointmentsRepositoryProvider).respond(
            appointmentId: widget.appointmentId,
            action: action,
            scheduledStartAtIso: scheduledIso,
            professionalMessage:
                message.text.trim().isEmpty ? null : message.text.trim(),
            meetingLink: link.text.trim().isEmpty ? null : link.text.trim(),
          );
      if (mounted) setState(() => _mutated = a);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.apptActionFailed)),
      );
    } finally {
      message.dispose();
      link.dispose();
      if (mounted) setState(() => _acting = false);
    }
  }

  static const _activeStatuses = {
    'REQUESTED',
    'VIEWED',
    'ACCEPTED',
    'RESCHEDULE_PROPOSED',
  };

  Future<void> _runAction(Future<AppointmentDetail> Function() op) async {
    setState(() => _acting = true);
    try {
      final a = await op();
      if (mounted) setState(() => _mutated = a);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.apptActionFailed)),
      );
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _cancel() async {
    final l = context.l10n;
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.actionCancelAppointment),
        content: Text(l.confirmCancelAppointment),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.actionBack),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l.actionCancelAppointment),
          ),
        ],
      ),
    );
    if (ok != true) return;
    await _runAction(() =>
        ref.read(appointmentsRepositoryProvider).cancel(widget.appointmentId));
  }

  @override
  Widget build(BuildContext context) {
    // Prefer a local mutation, then the prefetched seed — only fall back to the
    // network when neither is available (deep links).
    final seed = _mutated ?? widget.initial;
    if (seed != null) return _buildDetail(context, seed);

    final asyncAppointment =
        ref.watch(_appointmentDetailProvider(widget.appointmentId));
    return asyncAppointment.when(
      loading: () => Scaffold(
        body: Column(
          children: [
            GradientHeader(
                title: context.l10n.appointmentTitle,
                showBack: true,
                compact: true),
            const Expanded(child: LoadingView()),
          ],
        ),
      ),
      error: (e, _) => Scaffold(
        body: Column(
          children: [
            GradientHeader(
              title: context.l10n.appointmentTitle,
              showBack: true,
              compact: true,
            ),
            Expanded(
              child: ErrorView(
                message: context.l10n.errLoadAppointmentDetail,
                onRetry: () => ref.invalidate(
                    _appointmentDetailProvider(widget.appointmentId)),
              ),
            ),
          ],
        ),
      ),
      data: (appointment) => _buildDetail(context, appointment),
    );
  }

  Widget _buildDetail(BuildContext context, AppointmentDetail a) {
    final l = context.l10n;
    final dash = l.valueDash;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: a.counterpartName.isNotEmpty
                ? a.counterpartName
                : l.appointmentTitle,
            showBack: true,
            compact: true,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.page),
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: StatusBadge(
                    humanizeStatus(a.status),
                    color: statusTone(context, a.status),
                  ),
                ),
                const Gap(AppSpacing.md),
                AppCard(
                  child: Column(
                    children: [
                      InfoRow(
                        icon: Icons.schedule_rounded,
                        label: _label(l.fieldRequested('')),
                        value: a.requestedStartAt ?? dash,
                      ),
                      InfoRow(
                        icon: Icons.event_available_rounded,
                        label: _label(l.fieldScheduled('')),
                        value: a.scheduledStartAt ?? dash,
                      ),
                      InfoRow(
                        icon: Icons.link_rounded,
                        label: _label(l.fieldMeetingLinkValue('')),
                        value: a.meetingLink ?? dash,
                      ),
                    ],
                  ),
                ),
                const Gap(AppSpacing.md),
                AppCard(
                  child: Column(
                    children: [
                      InfoRow(
                        icon: Icons.message_outlined,
                        label: _label(l.fieldClientMessage('')),
                        value: a.requestMessage ?? dash,
                      ),
                      InfoRow(
                        icon: Icons.support_agent_rounded,
                        label: _label(l.fieldProfessionalMessage('')),
                        value: a.professionalMessage ?? dash,
                      ),
                    ],
                  ),
                ),
                if (a.isProfessionalView) ...[
                  const Gap(AppSpacing.xl),
                  FilledButton.icon(
                    onPressed: _acting ? null : () => _respond('ACCEPTED'),
                    icon: const Icon(Icons.check_rounded),
                    label: Text(l.actionAccept),
                  ),
                  const Gap(AppSpacing.md),
                  OutlinedButton.icon(
                    onPressed:
                        _acting ? null : () => _respond('RESCHEDULE_PROPOSED'),
                    icon: const Icon(Icons.edit_calendar_rounded),
                    label: Text(l.actionProposeReschedule),
                  ),
                  const Gap(AppSpacing.md),
                  OutlinedButton.icon(
                    onPressed: _acting ? null : _markSeen,
                    icon: const Icon(Icons.visibility_outlined),
                    label: Text(l.actionMarkSeen),
                  ),
                  const Gap(AppSpacing.md),
                  TextButton.icon(
                    onPressed: _acting ? null : () => _respond('DECLINED'),
                    icon: const Icon(Icons.close_rounded),
                    label: Text(l.actionDecline),
                    style: TextButton.styleFrom(
                      foregroundColor: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                if (a.isProfessionalView && a.status == 'ACCEPTED') ...[
                  const Gap(AppSpacing.xl),
                  FilledButton.icon(
                    onPressed: _acting
                        ? null
                        : () => _runAction(() => ref
                            .read(appointmentsRepositoryProvider)
                            .complete(widget.appointmentId)),
                    icon: const Icon(Icons.task_alt_rounded),
                    label: Text(l.actionMarkComplete),
                  ),
                  const Gap(AppSpacing.md),
                  OutlinedButton.icon(
                    onPressed: _acting
                        ? null
                        : () => _runAction(() => ref
                            .read(appointmentsRepositoryProvider)
                            .noShow(widget.appointmentId)),
                    icon: const Icon(Icons.person_off_outlined),
                    label: Text(l.actionMarkNoShow),
                  ),
                ],
                if (_activeStatuses.contains(a.status)) ...[
                  const Gap(AppSpacing.md),
                  TextButton.icon(
                    onPressed: _acting ? null : _cancel,
                    icon: const Icon(Icons.event_busy_outlined),
                    label: Text(l.actionCancelAppointment),
                    style: TextButton.styleFrom(
                      foregroundColor: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

final _appointmentDetailProvider =
    FutureProvider.family<AppointmentDetail, String>((ref, id) async {
  return ref.read(appointmentsRepositoryProvider).get(id);
});
