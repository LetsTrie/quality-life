import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/content_item.dart';

final contentRepositoryProvider = Provider<ContentRepository>((ref) {
  return ContentRepository(ref.watch(apiClientProvider));
});

class ContentRepository {
  final Dio _dio;
  ContentRepository(this._dio);

  Future<List<ContentItem>> list() async {
    final res = await _dio.get('/v1/content');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['content'] as List<dynamic>)
        .map((e) => ContentItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markViewed(String contentKey, {bool completed = false}) async {
    await _dio.post('/v1/content/$contentKey/viewed', data: {'completed': completed});
  }

  Future<void> rate(String contentKey, {required int rating, String? comment}) async {
    await _dio.post('/v1/content/$contentKey/rating', data: {'rating': rating, 'comment': comment});
  }
}
