// Pure-Dart tests for the shared model layer: JSON parsing robustness (missing /
// null fields must never throw) and the derived getters the UI depends on.
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/shared/models/appointment.dart';
import 'package:qlife/src/shared/models/assessment.dart';
import 'package:qlife/src/shared/models/client.dart';
import 'package:qlife/src/shared/models/content_item.dart';
import 'package:qlife/src/shared/models/instrument.dart';
import 'package:qlife/src/shared/models/notification_model.dart';
import 'package:qlife/src/shared/models/pagination.dart';
import 'package:qlife/src/shared/models/professional.dart';

void main() {
  group('Pagination.fromJson', () {
    test('reads all fields', () {
      final p = Pagination.fromJson(
        {'page': 2, 'pageSize': 20, 'total': 41, 'hasMore': true},
      );
      expect(p.page, 2);
      expect(p.pageSize, 20);
      expect(p.total, 41);
      expect(p.hasMore, true);
    });

    test('applies safe defaults when fields are missing', () {
      final p = Pagination.fromJson({});
      expect(p.page, 1);
      expect(p.pageSize, 0);
      expect(p.total, 0);
      expect(p.hasMore, false);
    });

    test('coerces numeric strings/doubles via num and treats non-true hasMore as false', () {
      final p = Pagination.fromJson({'page': 3.0, 'total': 9.9, 'hasMore': 'yes'});
      expect(p.page, 3);
      expect(p.total, 9);
      expect(p.hasMore, false);
    });
  });

  group('AppointmentSummary.counterpartName', () {
    test('prefers professional fullName', () {
      final a = AppointmentSummary.fromJson({
        'id': 'a1',
        'status': 'REQUESTED',
        'professional': {'fullName': 'Dr. Rahman'},
      });
      expect(a.counterpartName, 'Dr. Rahman');
      expect(a.status, 'REQUESTED');
    });

    test('falls back to user displayName when no professional', () {
      final a = AppointmentSummary.fromJson({
        'id': 'a1',
        'user': {'displayName': 'Karim'},
      });
      expect(a.counterpartName, 'Karim');
      expect(a.status, ''); // defaulted
    });

    test('returns "Appointment" when neither side is present', () {
      final a = AppointmentSummary.fromJson({'id': 'a1'});
      expect(a.counterpartName, 'Appointment');
    });
  });

  group('AppointmentDetail', () {
    test('isProfessionalView is true only when a user is attached', () {
      final pro = AppointmentDetail.fromJson({
        'id': 'a1',
        'user': {'displayName': 'Karim'},
      });
      final client = AppointmentDetail.fromJson({
        'id': 'a2',
        'professional': {'fullName': 'Dr. Rahman'},
      });
      expect(pro.isProfessionalView, true);
      expect(client.isProfessionalView, false);
    });

    test('counterpartName falls back to role-specific labels', () {
      final withUserButNoName =
          AppointmentDetail.fromJson({'id': 'a1', 'user': <String, dynamic>{}});
      final withProButNoName =
          AppointmentDetail.fromJson({'id': 'a2', 'professional': <String, dynamic>{}});
      final empty = AppointmentDetail.fromJson({'id': 'a3'});
      expect(withUserButNoName.counterpartName, 'Client');
      expect(withProButNoName.counterpartName, 'Professional');
      expect(empty.counterpartName, 'Appointment');
    });
  });

  group('AssessmentResult', () {
    test('needsHelpCenter / isUrgent reflect the recommended action', () {
      final urgent = AssessmentResult.fromJson({
        'id': 'r1',
        'recommendedAction': 'SHOW_HELP_CENTER_URGENT',
      });
      final help = AssessmentResult.fromJson({
        'id': 'r2',
        'recommendedAction': 'SHOW_HELP_CENTER',
      });
      final none = AssessmentResult.fromJson({
        'id': 'r3',
        'recommendedAction': 'SHOW_CONTENT',
      });
      expect(urgent.needsHelpCenter, true);
      expect(urgent.isUrgent, true);
      expect(help.needsHelpCenter, true);
      expect(help.isUrgent, false);
      expect(none.needsHelpCenter, false);
      expect(none.isUrgent, false);
    });

    test('parses nested recommendedContent when present', () {
      final r = AssessmentResult.fromJson({
        'id': 'r1',
        'recommendedContent': {
          'contentKey': 'breathing-101',
          'type': 'VIDEO',
          'title': 'Box breathing',
        },
      });
      expect(r.recommendedContent, isNotNull);
      expect(r.recommendedContent!.contentKey, 'breathing-101');
      expect(r.recommendedContent!.isVideo, true);
    });

    test('recommendedContent is null when absent', () {
      final r = AssessmentResult.fromJson({'id': 'r1'});
      expect(r.recommendedContent, isNull);
    });
  });

  group('RecommendedContent.fromJson', () {
    test('defaults type to VIDEO', () {
      final c = RecommendedContent.fromJson({'contentKey': 'k', 'title': 'T'});
      expect(c.type, 'VIDEO');
      expect(c.isVideo, true);
    });

    test('non-video type is respected', () {
      final c = RecommendedContent.fromJson(
        {'contentKey': 'k', 'type': 'ARTICLE', 'title': 'T'},
      );
      expect(c.isVideo, false);
    });
  });

  group('AssessmentSummary.instrumentName / instrumentSlug', () {
    test('uses instrument name when available', () {
      final s = AssessmentSummary.fromJson({
        'id': 's1',
        'instrumentVersion': {
          'instrument': {'name': 'GHQ-12', 'slug': 'ghq-12'},
        },
      });
      expect(s.instrumentName, 'GHQ-12');
      expect(s.instrumentSlug, 'ghq-12');
    });

    test('falls back to slug when name missing, empty otherwise', () {
      final slugOnly = AssessmentSummary.fromJson({
        'id': 's1',
        'instrumentVersion': {
          'instrument': {'slug': 'pss-10'},
        },
      });
      final none = AssessmentSummary.fromJson({'id': 's2'});
      expect(slugOnly.instrumentName, 'pss-10');
      expect(none.instrumentName, '');
      expect(none.instrumentSlug, '');
    });
  });

  group('AppNotification', () {
    test('isUnread is driven by readAt', () {
      final unread = AppNotification.fromJson({
        'id': 'n1',
        'type': 'APPOINTMENT_REQUESTED',
        'createdAt': '2026-01-01T00:00:00Z',
      });
      final read = AppNotification.fromJson({
        'id': 'n2',
        'type': 'APPOINTMENT_REQUESTED',
        'createdAt': '2026-01-01T00:00:00Z',
        'readAt': '2026-01-02T00:00:00Z',
      });
      expect(unread.isUnread, true);
      expect(read.isUnread, false);
    });

    test('displayTitle prefers the server title', () {
      final n = AppNotification.fromJson({
        'id': 'n1',
        'type': 'APPOINTMENT_REQUESTED',
        'title': 'Custom title',
        'createdAt': 'x',
      });
      expect(n.displayTitle, 'Custom title');
    });

    test('displayTitle maps known types when title is missing', () {
      AppNotification of(String type) => AppNotification.fromJson({
            'id': 'n',
            'type': type,
            'createdAt': 'x',
          });
      expect(of('APPOINTMENT_ACCEPTED').displayTitle, 'Appointment confirmed');
      expect(of('ASSESSMENT_ASSIGNED').displayTitle, 'A new self-check for you');
      expect(of('APPOINTMENT_DECLINED').displayTitle, 'Appointment update');
      expect(of('ASSESSMENT_COMPLETED').displayTitle, 'Self-check completed');
    });

    test('displayTitle humanizes unknown types', () {
      final n = AppNotification.fromJson({
        'id': 'n1',
        'type': 'SOME_NEW_EVENT',
        'createdAt': 'x',
      });
      expect(n.displayTitle, 'some new event');
    });
  });

  group('ContentItem.fromJson', () {
    test('defaults watched to false and reads duration', () {
      final c = ContentItem.fromJson({
        'contentKey': 'k',
        'title': 'Title',
        'durationSeconds': 90,
      });
      expect(c.watched, false);
      expect(c.durationSeconds, 90);
    });

    test('reads watched flag and tolerates missing optionals', () {
      final c = ContentItem.fromJson({'contentKey': 'k', 'watched': true});
      expect(c.title, '');
      expect(c.watched, true);
      expect(c.durationSeconds, isNull);
    });
  });

  group('Instrument parsing', () {
    test('InstrumentOption.weight is stringified from numbers', () {
      final o = InstrumentOption.fromJson({'id': 'o1', 'label': 'Often', 'weight': 3});
      expect(o.weight, '3');
    });

    test('InstrumentOption.weight defaults to "0" when missing', () {
      final o = InstrumentOption.fromJson({'id': 'o1'});
      expect(o.weight, '0');
      expect(o.label, '');
    });

    test('InstrumentDetail reads nested instrument + version questions', () {
      final d = InstrumentDetail.fromJson({
        'instrument': {'id': 'i1', 'slug': 'ghq-12', 'name': 'GHQ-12'},
        'version': {
          'id': 'v1',
          'questions': [
            {
              'id': 'q1',
              'prompt': 'How often?',
              'options': [
                {'id': 'o1', 'label': 'Never', 'weight': 0},
              ],
            },
          ],
        },
      });
      expect(d.versionId, 'v1');
      expect(d.questions, hasLength(1));
      expect(d.questions.first.options.first.label, 'Never');
    });
  });

  group('Professional', () {
    test('professionLabel title-cases an underscored enum', () {
      final p = Professional.fromJson({
        'id': 'p1',
        'fullName': 'Dr. Rahman',
        'professionType': 'CLINICAL_PSYCHOLOGIST',
      });
      expect(p.professionLabel, 'Clinical Psychologist');
    });

    test('reads nested district and lists with safe defaults', () {
      final p = Professional.fromJson({
        'id': 'p1',
        'fullName': 'Dr. Rahman',
        'professionType': 'PSYCHIATRIST',
        'district': {'nameBn': 'ঢাকা'},
      });
      expect(p.districtNameBn, 'ঢাকা');
      expect(p.specializations, isEmpty);
      expect(p.availability, isEmpty);
    });

    test('parses nested specializations and availability windows', () {
      final p = Professional.fromJson({
        'id': 'p1',
        'fullName': 'Dr. Rahman',
        'professionType': 'PSYCHIATRIST',
        'specializations': [
          {
            'specialization': {'slug': 'anxiety', 'nameEn': 'Anxiety', 'nameBn': 'উদ্বেগ'},
            'note': 'Primary focus',
          },
        ],
        'availability': [
          {'weekday': 'MON', 'startTime': '09:00', 'endTime': '12:00'},
        ],
      });
      expect(p.specializations, hasLength(1));
      expect(p.specializations.first.nameEn, 'Anxiety');
      expect(p.availability.first.weekday, 'MON');
    });

    test('AvailabilityWindow normalizes time labels', () {
      final fromIso = AvailabilityWindow.fromJson({
        'weekday': 'MON',
        'startTime': '2026-01-01T09:05:00',
        'endTime': '17:30',
      });
      expect(fromIso.startLabel, '09:05');
      expect(fromIso.endLabel, '17:30');

      final unpadded = AvailabilityWindow.fromJson({
        'weekday': 'TUE',
        'startTime': '9:5',
        'endTime': '8:00',
      });
      expect(unpadded.startLabel, '09:05');
      expect(unpadded.endLabel, '08:00');
    });
  });

  group('Client.fromJson', () {
    test('defaults status to ACTIVE and parses nested user', () {
      final c = Client.fromJson({
        'id': 'c1',
        'user': {'id': 'u1', 'displayName': 'Karim'},
      });
      expect(c.status, 'ACTIVE');
      expect(c.user.displayName, 'Karim');
    });
  });
}
