import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';
import '../../../shared/models/instrument.dart';

final instrumentsRepositoryProvider = Provider<InstrumentsRepository>((ref) {
  return InstrumentsRepository(ref.watch(apiClientProvider));
});

class InstrumentsRepository {
  final Dio _dio;
  InstrumentsRepository(this._dio);

  Future<List<InstrumentSummary>> listInstruments() async {
    final res = await _dio.get('/v1/instruments');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final items = data['instruments'] as List<dynamic>;
    return items
        .map((e) => InstrumentSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<InstrumentDetail> getInstrument(String slug) async {
    final res = await _dio.get('/v1/instruments/$slug');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return InstrumentDetail.fromJson(data);
  }
}
