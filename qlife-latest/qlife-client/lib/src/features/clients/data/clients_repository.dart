import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/assessment.dart';
import '../../../shared/models/client.dart';
import '../../../shared/models/pagination.dart';
import '../../../shared/models/paged_result.dart';

final clientsRepositoryProvider = Provider<ClientsRepository>((ref) {
  return ClientsRepository(ref.watch(apiClientProvider));
});

class ClientsRepository {
  final Dio _dio;
  ClientsRepository(this._dio);

  Future<PagedResult<Client>> list({int page = 1}) async {
    final res = await _dio.get('/v1/clients', queryParameters: {'page': page});
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['clients'] as List<dynamic>)
        .map((e) => Client.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }

  Future<Client> get(String careRelationshipId) async {
    final res = await _dio.get('/v1/clients/$careRelationshipId');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return Client.fromJson(data['client'] as Map<String, dynamic>);
  }

  /// A client's assessments (assigned + self-initiated) for the clinician.
  Future<PagedResult<AssessmentSummary>> listAssessments(
    String careRelationshipId, {
    int page = 1,
  }) async {
    final res = await _dio.get(
      '/v1/clients/$careRelationshipId/assessments',
      queryParameters: {'page': page},
    );
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = (data['assessments'] as List<dynamic>)
        .map((e) => AssessmentSummary.fromJson(e as Map<String, dynamic>))
        .toList();
    final pagination = Pagination.fromJson(data['pagination'] as Map<String, dynamic>);
    return PagedResult(items: items, pagination: pagination);
  }
}
