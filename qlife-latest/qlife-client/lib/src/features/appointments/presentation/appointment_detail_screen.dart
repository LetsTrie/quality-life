import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/appointment.dart';
import '../data/appointments_repository.dart';

class AppointmentDetailScreen extends ConsumerStatefulWidget {
  final String appointmentId;
  const AppointmentDetailScreen({super.key, required this.appointmentId});

  @override
  ConsumerState<AppointmentDetailScreen> createState() => _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState extends ConsumerState<AppointmentDetailScreen> {
  bool _acting = false;
  AppointmentDetail? _mutated; // holds locally mutated state after action

  Future<void> _markSeen() async {
    setState(() => _acting = true);
    try {
      final a = await ref.read(appointmentsRepositoryProvider).markSeen(widget.appointmentId);
      if (mounted) setState(() => _mutated = a);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to mark as seen. Please try again.')),
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
      // For non-decline actions, show date+time picker first
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

      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(action == 'DECLINED'
              ? 'Decline'
              : action == 'ACCEPTED'
                  ? 'Accept'
                  : 'Propose reschedule'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (pickedDate != null && pickedTime != null)
                Text(
                  'Scheduled: ${pickedDate!.year}-${pickedDate!.month.toString().padLeft(2, '0')}-${pickedDate!.day.toString().padLeft(2, '0')} '
                  '${pickedTime!.hour.toString().padLeft(2, '0')}:${pickedTime!.minute.toString().padLeft(2, '0')} UTC',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              if (pickedDate != null) const SizedBox(height: 12),
              TextField(
                controller: link,
                decoration: const InputDecoration(labelText: 'Meeting link / address (optional)'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: message,
                decoration: const InputDecoration(labelText: 'Message (optional)'),
                minLines: 2,
                maxLines: 4,
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Submit')),
          ],
        ),
      );
      if (ok != true) return;

      String? scheduledIso;
      if (pickedDate != null && pickedTime != null) {
        final dt = DateTime.utc(
          pickedDate!.year,
          pickedDate!.month,
          pickedDate!.day,
          pickedTime!.hour,
          pickedTime!.minute,
        );
        scheduledIso = dt.toIso8601String();
      }

      setState(() => _acting = true);
      final a = await ref.read(appointmentsRepositoryProvider).respond(
            appointmentId: widget.appointmentId,
            action: action,
            scheduledStartAtIso: scheduledIso,
            professionalMessage: message.text.trim().isEmpty ? null : message.text.trim(),
            meetingLink: link.text.trim().isEmpty ? null : link.text.trim(),
          );
      if (mounted) setState(() => _mutated = a);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Action failed. Please try again.')),
      );
    } finally {
      message.dispose();
      link.dispose();
      if (mounted) setState(() => _acting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncAppointment = ref.watch(_appointmentDetailProvider(widget.appointmentId));

    // If we have a locally mutated version (after action), show it directly
    if (_mutated != null) {
      return _buildDetail(context, _mutated!);
    }

    return asyncAppointment.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Appointment')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Could not load appointment details. Please go back and try again.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
      data: (appointment) => _buildDetail(context, appointment),
    );
  }

  Widget _buildDetail(BuildContext context, AppointmentDetail a) {
    return Scaffold(
      appBar: AppBar(
        title: Text(a.counterpartName),
        actions: [
          IconButton(
            onPressed: _acting
                ? null
                : () {
                    setState(() => _mutated = null);
                    ref.invalidate(_appointmentDetailProvider(widget.appointmentId));
                  },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView(
            children: [
              Text('Status: ${a.status}'),
              const SizedBox(height: 8),
              Text('Requested: ${a.requestedStartAt ?? '—'}'),
              const SizedBox(height: 8),
              Text('Scheduled: ${a.scheduledStartAt ?? '—'}'),
              const SizedBox(height: 8),
              Text('Meeting link: ${a.meetingLink ?? '—'}'),
              const SizedBox(height: 8),
              Text('Client message: ${a.requestMessage ?? '—'}'),
              const SizedBox(height: 8),
              Text('Professional message: ${a.professionalMessage ?? '—'}'),
              const SizedBox(height: 16),
              if (a.isProfessionalView) ...[
                FilledButton(
                  onPressed: _acting ? null : _markSeen,
                  child: const Text('Mark seen'),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _acting ? null : () => _respond('ACCEPTED'),
                  child: const Text('Accept'),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _acting ? null : () => _respond('RESCHEDULE_PROPOSED'),
                  child: const Text('Propose reschedule'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: _acting ? null : () => _respond('DECLINED'),
                  child: const Text('Decline'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

final _appointmentDetailProvider =
    FutureProvider.family<AppointmentDetail, String>((ref, id) async {
  return ref.read(appointmentsRepositoryProvider).get(id);
});
