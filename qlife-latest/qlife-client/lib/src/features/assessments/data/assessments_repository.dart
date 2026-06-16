import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/models/pagination.dart';
import '../../../shared/models/paged_result.dart';

final assessmentsRepositoryProvider = Provider<AssessmentsRepository>((ref) {
  return AssessmentsRepository(ref.watch(apiClientProvider));
});

class AssessmentsRepository {
  final Dio _dio;
  AssessmentsRepository(this._dio);

  Future<String> createAssessment({required String instrumentSlug}) async {
    final res = await _dio.post('/v1/assessments', data: {'instrumentSlug': instrumentSlug});
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final assessment = data['assessment'] as Map<String, dynamic>;
    return assessment['id'] as String;
  }

  Future<AssessmentResult> submitAnswers({
    required String assessmentId,
    required List<Map<String, String>> answers,
  }) async {
    final res = await _dio.post('/v1/assessments/$assessmentId/answers', data: {'answers': answers});
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return AssessmentResult.fromJson(data['assessment'] as Map<String, dynamic>);
  }

  Future<List<AssessmentSummary>> assignToClient({
    required String careRelationshipId,
    required List<String> instrumentSlugs,
    String? dueAtIso,
  }) async {
    final res = await _dio.post('/v1/assessments/assign/$careRelationshipId', data: {
      'instrumentSlugs': instrumentSlugs,
      if (dueAtIso != null) 'dueAt': dueAtIso,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (data['assessments'] as List<dynamic>)
        .map((e) => AssessmentSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<PagedResult<AssessmentSummary>> list({String? status, int page = 1}) async {
    final res = await _dio.get('/v1/assessments', queryParameters: {
      'page': page,
      if (status != null) 'status': status,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['assessments'] as List<dynamic>)
        .map((e) => AssessmentSummary.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }

  Future<Map<String, dynamic>> getById(String id) async {
    final res = await _dio.get('/v1/assessments/$id');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return data;
  }
}
