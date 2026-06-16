import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/notification_model.dart';
import '../../../shared/models/pagination.dart';
import '../../../shared/models/paged_result.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepository(ref.watch(apiClientProvider));
});

class NotificationsRepository {
  final Dio _dio;
  NotificationsRepository(this._dio);

  Future<int> unreadCount() async {
    final res = await _dio.get('/v1/notifications/unread-count');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['unreadNotificationCount'] as num?)?.toInt() ?? 0;
  }

  Future<PagedResult<AppNotification>> list({int page = 1}) async {
    final res = await _dio.get('/v1/notifications', queryParameters: {'page': page});
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['notifications'] as List<dynamic>)
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }

  Future<void> markSeen(String id) async {
    await _dio.patch('/v1/notifications/$id/seen');
  }
}
