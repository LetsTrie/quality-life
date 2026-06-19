import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_client.dart';

// ---------------------------------------------------------------------------
// Models (parsed from GET /v1/support/hotlines)
// ---------------------------------------------------------------------------

enum HotlineContactType { phone, whatsapp }

class HotlineContact {
  final String number;
  final HotlineContactType type;
  final String? availabilityNote;
  final bool tollFree;

  const HotlineContact({
    required this.number,
    this.type = HotlineContactType.phone,
    this.availabilityNote,
    this.tollFree = false,
  });

  factory HotlineContact.fromJson(Map<String, dynamic> json) {
    final channel = (json['channel'] as String? ?? '').toUpperCase();
    return HotlineContact(
      number: json['value'] as String? ?? '',
      type: channel == 'WHATSAPP' ? HotlineContactType.whatsapp : HotlineContactType.phone,
      availabilityNote: json['availabilityNote'] as String?,
      tollFree: json['isTollFree'] as bool? ?? false,
    );
  }

  /// `tel:` / `https://wa.me/` URI for tap-to-call / WhatsApp.
  Uri get uri {
    if (type == HotlineContactType.whatsapp) {
      final intl = number.startsWith('01') ? '880${number.substring(1)}' : number;
      return Uri.parse('https://wa.me/$intl');
    }
    return Uri(scheme: 'tel', path: number);
  }

  /// Time note shown to the user (available in Bangla from the server).
  String? time(bool bangla) => availabilityNote;
}

class HotlineGroup {
  final String nameBn;
  final String nameEn;
  final String? locationNote;
  final List<HotlineContact> contacts;

  const HotlineGroup({
    required this.nameBn,
    required this.nameEn,
    this.locationNote,
    required this.contacts,
  });

  factory HotlineGroup.fromJson(Map<String, dynamic> json) {
    return HotlineGroup(
      nameBn: json['nameBn'] as String? ?? '',
      nameEn: json['nameEn'] as String? ?? '',
      locationNote: json['locationNote'] as String?,
      contacts: (json['contacts'] as List<dynamic>)
          .map((c) => HotlineContact.fromJson(c as Map<String, dynamic>))
          .toList(),
    );
  }

  String place(bool bangla) => bangla ? nameBn : nameEn;
  String? location(bool bangla) => locationNote;
}

bool isBanglaLocale(BuildContext context) =>
    Localizations.localeOf(context).languageCode == 'bn';

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class HelpCenterRepository {
  final Dio _dio;
  const HelpCenterRepository(this._dio);

  Future<List<HotlineGroup>> fetchHotlines({String? slug}) async {
    final uri = slug != null && slug.isNotEmpty
        ? '/v1/support/hotlines?slug=${Uri.encodeComponent(slug)}'
        : '/v1/support/hotlines';
    final res = await _dio.get(uri);
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final list = (data['hotlines'] as List<dynamic>);
    return list.map((h) => HotlineGroup.fromJson(h as Map<String, dynamic>)).toList();
  }
}

final helpCenterRepositoryProvider = Provider<HelpCenterRepository>((ref) {
  return HelpCenterRepository(ref.watch(apiClientProvider));
});

/// FutureProvider.family keyed by the scale slug (null/empty = generic visit).
final hotlinesProvider = FutureProvider.autoDispose.family<List<HotlineGroup>, String?>(
  (ref, slug) => ref.read(helpCenterRepositoryProvider).fetchHotlines(slug: slug),
);
