import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/professional.dart';
import '../../../shared/models/paged_result.dart';
import '../../appointments/data/appointments_repository.dart';
import '../data/professionals_repository.dart';

class ProfessionalsScreen extends ConsumerWidget {
  const ProfessionalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncProfessionals = ref.watch(_professionalsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Professionals'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_professionalsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncProfessionals.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Could not load professionals. Please try again.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (result) {
          if (result.items.isEmpty) {
            return const Center(child: Text('No professionals'));
          }
          return ListView.separated(
            itemCount: result.items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final p = result.items[idx];
              return ListTile(
                title: Text(p.fullName),
                subtitle: Text(p.professionLabel),
                trailing: const Icon(Icons.calendar_month),
                onTap: () => _showRequestSheet(context, ref, p),
              );
            },
          );
        },
      ),
    );
  }

  void _showRequestSheet(BuildContext context, WidgetRef ref, Professional professional) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => _AppointmentRequestSheet(
        professional: professional,
        onRequest: (requestedAt, message) async {
          await ref.read(appointmentsRepositoryProvider).request(
                professionalProfileId: professional.id,
                requestedStartAt: requestedAt,
                requestMessage: message,
                profileShareGranted: false,
              );
        },
      ),
    );
  }
}

class _AppointmentRequestSheet extends StatefulWidget {
  final Professional professional;
  final Future<void> Function(DateTime requestedAt, String? message) onRequest;

  const _AppointmentRequestSheet({
    required this.professional,
    required this.onRequest,
  });

  @override
  State<_AppointmentRequestSheet> createState() => _AppointmentRequestSheetState();
}

class _AppointmentRequestSheetState extends State<_AppointmentRequestSheet> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
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
    if (date != null && mounted) {
      setState(() => _selectedDate = date);
    }
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time != null && mounted) {
      setState(() => _selectedTime = time);
    }
  }

  Future<void> _submit() async {
    if (_selectedDate == null || _selectedTime == null) {
      setState(() => _error = 'Please select a date and time.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final dt = DateTime.utc(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );
      final msg = _messageCtrl.text.trim().isEmpty ? null : _messageCtrl.text.trim();
      await widget.onRequest(dt, msg);
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appointment requested')),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _error = 'Failed to request appointment. Please try again.');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = _selectedDate == null
        ? 'Select date'
        : '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
    final timeLabel = _selectedTime == null
        ? 'Select time'
        : '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Request appointment with ${widget.professional.fullName}',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 16),
          if (_error != null) ...[
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 8),
          ],
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _submitting ? null : _pickDate,
                  icon: const Icon(Icons.calendar_today),
                  label: Text(dateLabel),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _submitting ? null : _pickTime,
                  icon: const Icon(Icons.access_time),
                  label: Text(timeLabel),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _messageCtrl,
            decoration: const InputDecoration(
              labelText: 'Message (optional)',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
            maxLength: 500,
            enabled: !_submitting,
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? 'Requesting...' : 'Confirm'),
          ),
        ],
      ),
    );
  }
}

final _professionalsProvider = FutureProvider<PagedResult<Professional>>((ref) async {
  return ref.read(professionalsRepositoryProvider).list(page: 1);
});
