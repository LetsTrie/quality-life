import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/models/appointment.dart';
import '../../../shared/models/paged_result.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../data/appointments_repository.dart';

class AppointmentsScreen extends ConsumerWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncAppointments = ref.watch(_appointmentsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_appointmentsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: asyncAppointments.when(
        loading: () => const LoadingView(),
        error: (e, _) => const ErrorView(
          message: 'Could not load appointments. Please try again.',
        ),
        data: (result) {
          if (result.items.isEmpty) {
            return const EmptyView(
              message: 'No appointments yet',
              icon: Icons.event_available_outlined,
            );
          }
          return ListView.separated(
            itemCount: result.items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, idx) {
              final a = result.items[idx];
              final counterpart = a.counterpartName;
              final status = a.status;
              final requested = a.requestedStartAt ?? '';
              return ListTile(
                title: Text(counterpart.isNotEmpty ? counterpart : 'Appointment'),
                subtitle: Text('$status${requested.isNotEmpty ? ' • $requested' : ''}'),
                onTap: () => context.go(AppointmentDetailRoute(id: a.id).location),
              );
            },
          );
        },
      ),
    );
  }
}

final _appointmentsProvider = FutureProvider<PagedResult<AppointmentSummary>>((ref) async {
  return ref.read(appointmentsRepositoryProvider).list(page: 1);
});
