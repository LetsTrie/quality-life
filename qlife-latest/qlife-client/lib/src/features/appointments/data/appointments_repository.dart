import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/appointment.dart';
import '../../../shared/models/pagination.dart';
import '../../../shared/models/paged_result.dart';

final appointmentsRepositoryProvider = Provider<AppointmentsRepository>((ref) {
  return AppointmentsRepository(ref.watch(apiClientProvider));
});

class AppointmentsRepository {
  final Dio _dio;
  AppointmentsRepository(this._dio);

  Future<PagedResult<AppointmentSummary>> list({int page = 1, String? status}) async {
    final res = await _dio.get('/v1/appointments', queryParameters: {
      'page': page,
      if (status != null && status.isNotEmpty) 'status': status,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['appointments'] as List<dynamic>)
        .map((e) => AppointmentSummary.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }

  Future<AppointmentDetail> get(String id) async {
    final res = await _dio.get('/v1/appointments/$id');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  Future<String> request({
    required String professionalProfileId,
    required DateTime requestedStartAt,
    String? requestMessage,
    bool profileShareGranted = false,
  }) async {
    final res = await _dio.post('/v1/appointments', data: {
      'professionalProfileId': professionalProfileId,
      'requestedStartAt': requestedStartAt.toUtc().toIso8601String(),
      'requestMessage': requestMessage,
      'profileShareGranted': profileShareGranted,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return data['appointmentId'] as String;
  }

  Future<AppointmentDetail> markSeen(String appointmentId) async {
    final res = await _dio.patch('/v1/appointments/$appointmentId/seen');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  Future<AppointmentDetail> respond({
    required String appointmentId,
    required String action, // ACCEPTED | DECLINED | RESCHEDULE_PROPOSED
    String? scheduledStartAtIso,
    String? professionalMessage,
    String? meetingLink,
  }) async {
    final res = await _dio.post('/v1/appointments/$appointmentId/respond', data: {
      'action': action,
      if (scheduledStartAtIso != null) 'scheduledStartAt': scheduledStartAtIso,
      if (professionalMessage != null) 'professionalMessage': professionalMessage,
      if (meetingLink != null) 'meetingLink': meetingLink,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  /// User responds to a professional-proposed reschedule: ACCEPT the proposed
  /// time, or COUNTER with a different [requestedStartAtIso].
  Future<AppointmentDetail> rescheduleResponse({
    required String appointmentId,
    required String action, // ACCEPT | COUNTER
    String? requestedStartAtIso,
    String? userMessage,
  }) async {
    final res = await _dio.post(
      '/v1/appointments/$appointmentId/reschedule-response',
      data: {
        'action': action,
        if (requestedStartAtIso != null) 'requestedStartAt': requestedStartAtIso,
        if (userMessage != null) 'userMessage': userMessage,
      },
    );
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  /// Either party cancels the appointment.
  Future<AppointmentDetail> cancel(String appointmentId, {String? reason}) async {
    final res = await _dio.post('/v1/appointments/$appointmentId/cancel', data: {
      if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  /// Professional marks an accepted appointment as completed.
  Future<AppointmentDetail> complete(String appointmentId) async {
    final res = await _dio.post('/v1/appointments/$appointmentId/complete');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  /// Professional marks an accepted appointment as a no-show.
  Future<AppointmentDetail> noShow(String appointmentId) async {
    final res = await _dio.post('/v1/appointments/$appointmentId/no-show');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AppointmentDetail.fromJson(data['appointment'] as Map<String, dynamic>);
  }
}
