import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/phone_field.dart';
import '../../auth/state/auth_state.dart';
import '../../geo/data/geo_repository.dart';
import '../data/professional_repository.dart';

/// One editable weekly availability window.
class _AvailabilityRow {
  String? weekday;
  TimeOfDay? start;
  TimeOfDay? end;
  _AvailabilityRow({this.weekday, this.start, this.end});
}

/// One editable caseload-by-location row (legacy numberOfClients).
class _CaseloadRow {
  final TextEditingController location;
  final TextEditingController count;
  _CaseloadRow({String location = '', String count = ''})
      : location = TextEditingController(text: location),
        count = TextEditingController(text: count);
  void dispose() {
    location.dispose();
    count.dispose();
  }
}

const _weekdays = <String>[
  'SATURDAY',
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
];

/// Graduation-batch options, mirroring the legacy picker: "Batch N - YYYY/YY"
/// for each intake year from 1997 up to last year, newest first.
List<String> _graduationBatches() {
  final currentYear = DateTime.now().year;
  final out = <String>[];
  for (var i = 1997; i < currentYear; i++) {
    final next = (i + 1) % 100;
    out.add('Batch ${i - 1996} - $i/${next.toString().padLeft(2, '0')}');
  }
  return out.reversed.toList();
}

class ProfessionalOnboardingScreen extends ConsumerStatefulWidget {
  const ProfessionalOnboardingScreen({super.key});

  @override
  ConsumerState<ProfessionalOnboardingScreen> createState() =>
      _ProfessionalOnboardingScreenState();
}

class _ProfessionalOnboardingScreenState
    extends ConsumerState<ProfessionalOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();

  final _bmdcCtrl = TextEditingController();
  final _workplaceCtrl = TextEditingController();
  final _yearsCtrl = TextEditingController();
  final _educationCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _phone = PhoneFieldController();
  final _feeCtrl = TextEditingController();
  final _maxWeeklyCtrl = TextEditingController();
  final _avgWeeklyCtrl = TextEditingController();
  final _referralCtrl = TextEditingController();
  final _otherSpecCtrl = TextEditingController();

  // Graduation batch is a picker, not free text.
  String? _batchValue;
  late final List<String> _batchOptions = _graduationBatches();

  String? _districtId;
  String? _upazilaId;
  String? _unionId;

  List<Map<String, dynamic>> _districts = const [];
  List<Map<String, dynamic>> _upazilas = const [];
  List<Map<String, dynamic>> _unions = const [];
  bool _loadingUpazilas = false;
  bool _loadingUnions = false;
  String? _upazilaError;
  String? _unionError;

  List<Map<String, dynamic>> _specVocab = const [];
  final Set<String> _selectedSpecIds = <String>{};
  String? _otherSpecId; // id of the 'other' vocabulary row, if present

  final List<_AvailabilityRow> _availability = [];
  final List<_CaseloadRow> _caseloads = [];

  bool _acceptingNewClients = true;
  bool _isVisible = true;
  bool _loading = true;
  bool _saving = false;
  String? _error;
  String? _verificationStatus;

  @override
  void initState() {
    super.initState();
    Future<void>(() async => _load());
  }

  @override
  void dispose() {
    for (final c in [
      _bmdcCtrl,
      _workplaceCtrl,
      _yearsCtrl,
      _educationCtrl,
      _bioCtrl,
      _feeCtrl,
      _maxWeeklyCtrl,
      _avgWeeklyCtrl,
      _referralCtrl,
      _otherSpecCtrl,
    ]) {
      c.dispose();
    }
    _phone.dispose();
    for (final r in _caseloads) {
      r.dispose();
    }
    super.dispose();
  }

  TimeOfDay? _parseTime(Object? raw) {
    if (raw == null) return null;
    final s = raw.toString();
    // Server returns a Time as an ISO datetime ("1970-01-01T10:00:00.000Z")
    // or a bare "HH:MM[:SS]".
    final timePart = s.contains('T') ? s.split('T').last : s;
    final hm = timePart.split(':');
    if (hm.length < 2) return null;
    final h = int.tryParse(hm[0]);
    final m = int.tryParse(hm[1]);
    if (h == null || m == null) return null;
    return TimeOfDay(hour: h, minute: m);
  }

  String _fmtTime(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  /// Pull a human-readable reason out of the backend error envelope
  /// (`{ error: { message, details } }`). ValidationPipe rejections carry the
  /// per-field messages in `details.message` (a list); other failures use the
  /// top-level `error.message`. Returns null when nothing useful is present so
  /// the caller falls back to the generic localized message.
  String? _serverErrorMessage(Object e) {
    if (e is! DioException) return null;
    final data = e.response?.data;
    if (data is! Map) return null;
    final error = data['error'];
    if (error is! Map) return null;

    final details = error['details'];
    if (details is Map) {
      final msg = details['message'];
      if (msg is List && msg.isNotEmpty) {
        return msg.map((m) => m.toString()).join('\n');
      }
      if (msg is String && msg.trim().isNotEmpty) return msg.trim();
    }

    final top = error['message'];
    // Skip the generic NestJS wrapper title; it carries no field detail.
    if (top is String &&
        top.trim().isNotEmpty &&
        top.trim() != 'Bad Request Exception') {
      return top.trim();
    }
    return null;
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final l = context.l10n;
    try {
      final repo = ref.read(professionalRepositoryProvider);
      final geo = ref.read(geoRepositoryProvider);

      final results = await Future.wait([
        repo.me(),
        repo.listSpecializations(),
        geo.listDistricts(),
      ]);
      final res = results[0] as Map<String, dynamic>;
      _specVocab = results[1] as List<Map<String, dynamic>>;
      _districts = results[2] as List<Map<String, dynamic>>;

      _otherSpecId = _specVocab
          .firstWhere((s) => s['slug'] == 'other', orElse: () => const {})['id']
          ?.toString();

      final data = (res['data'] as Map<String, dynamic>)['professional']
          as Map<String, dynamic>;

      _bmdcCtrl.text = (data['bmdcRegistrationNo']?.toString() ?? '').trim();
      final batch = (data['graduationBatch']?.toString() ?? '').trim();
      _batchValue = _batchOptions.contains(batch) ? batch : null;
      _workplaceCtrl.text = (data['workplace']?.toString() ?? '').trim();
      _educationCtrl.text = (data['educationSummary']?.toString() ?? '').trim();
      _bioCtrl.text = (data['bio']?.toString() ?? '').trim();
      _phone.seed(data['phone']?.toString());

      final years = data['yearsOfExperience'];
      _yearsCtrl.text = years == null ? '' : years.toString();
      final fee = data['feeAmount'];
      _feeCtrl.text = fee == null ? '' : fee.toString();
      final maxW = data['maxWeeklyClients'];
      _maxWeeklyCtrl.text = maxW == null ? '' : maxW.toString();
      final avgW = data['avgWeeklyClients'];
      _avgWeeklyCtrl.text = avgW == null ? '' : avgW.toString();
      _referralCtrl.text = (data['referralSource']?.toString() ?? '').trim();

      _districtId = data['districtId']?.toString();
      _upazilaId = data['upazilaId']?.toString();
      _unionId = data['unionId']?.toString();
      if (_districtId != null) {
        try {
          _upazilas = await geo.listUpazilas(_districtId!);
        } catch (_) {
          _upazilaError = l.errLoadUpazilas;
        }
      }
      if (_upazilaId != null) {
        try {
          _unions = await geo.listUnions(_upazilaId!);
        } catch (_) {
          _unionError = l.errLoadUnions;
        }
      }

      // Existing specializations.
      final specs = (data['specializations'] as List<dynamic>?) ?? const [];
      for (final s in specs) {
        final m = s as Map<String, dynamic>;
        final spec = m['specialization'] as Map<String, dynamic>?;
        final id = spec?['id']?.toString();
        if (id != null) _selectedSpecIds.add(id);
        final note = m['note']?.toString();
        if (note != null && note.trim().isNotEmpty) _otherSpecCtrl.text = note.trim();
      }

      // Existing availability.
      final avail = (data['availability'] as List<dynamic>?) ?? const [];
      for (final a in avail) {
        final m = a as Map<String, dynamic>;
        _availability.add(_AvailabilityRow(
          weekday: m['weekday']?.toString(),
          start: _parseTime(m['startTime']),
          end: _parseTime(m['endTime']),
        ));
      }

      // Existing caseloads.
      final cases = (data['caseloads'] as List<dynamic>?) ?? const [];
      for (final c in cases) {
        final m = c as Map<String, dynamic>;
        _caseloads.add(_CaseloadRow(
          location: m['locationLabel']?.toString() ?? '',
          count: (m['clientCount']?.toString() ?? ''),
        ));
      }

      _acceptingNewClients = (data['acceptingNewClients'] as bool?) ?? true;
      _isVisible = (data['isVisible'] as bool?) ?? true;

      final verifications =
          (data['verifications'] as List<dynamic>?) ?? const [];
      if (verifications.isNotEmpty) {
        _verificationStatus =
            (verifications.first as Map<String, dynamic>)['status']?.toString();
      }
    } catch (e) {
      if (mounted) setState(() => _error = context.l10n.errLoadProfile);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _onDistrictChanged(String? id) async {
    final l = context.l10n;
    setState(() {
      _districtId = id;
      _upazilaId = null;
      _unionId = null;
      _upazilas = const [];
      _unions = const [];
      _upazilaError = null;
      _unionError = null;
      _loadingUpazilas = id != null;
      _loadingUnions = false;
    });
    if (id == null) return;
    try {
      final list = await ref.read(geoRepositoryProvider).listUpazilas(id);
      if (mounted) setState(() => _upazilas = list);
    } catch (_) {
      if (mounted) setState(() => _upazilaError = l.errLoadUpazilas);
    } finally {
      if (mounted) setState(() => _loadingUpazilas = false);
    }
  }

  Future<void> _onUpazilaChanged(String? id) async {
    final l = context.l10n;
    setState(() {
      _upazilaId = id;
      _unionId = null;
      _unions = const [];
      _unionError = null;
      _loadingUnions = id != null;
    });
    if (id == null) return;
    try {
      final list = await ref.read(geoRepositoryProvider).listUnions(id);
      if (mounted) setState(() => _unions = list);
    } catch (_) {
      if (mounted) setState(() => _unionError = l.errLoadUnions);
    } finally {
      if (mounted) setState(() => _loadingUnions = false);
    }
  }

  String _specLabel(Map<String, dynamic> s) {
    final isBn = Localizations.localeOf(context).languageCode == 'bn';
    return ((isBn ? s['nameBn'] : s['nameEn'])?.toString() ??
            s['nameEn']?.toString() ??
            '')
        .trim();
  }

  String _weekdayLabel(String w) {
    final l = context.l10n;
    return switch (w) {
      'SUNDAY' => l.weekdaySunday,
      'MONDAY' => l.weekdayMonday,
      'TUESDAY' => l.weekdayTuesday,
      'WEDNESDAY' => l.weekdayWednesday,
      'THURSDAY' => l.weekdayThursday,
      'FRIDAY' => l.weekdayFriday,
      _ => l.weekdaySaturday,
    };
  }

  Future<void> _pickTime(_AvailabilityRow row, bool isStart) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: (isStart ? row.start : row.end) ??
          const TimeOfDay(hour: 10, minute: 0),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        row.start = picked;
      } else {
        row.end = picked;
      }
    });
  }

  Future<void> _finish() async {
    final l = context.l10n;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final ok = _formKey.currentState?.validate() ?? false;
      if (!ok) return;

      // The average can never exceed the weekly maximum (both required above, so
      // they parse cleanly here). Caught client-side to avoid a save round-trip.
      final maxWeekly = int.tryParse(_maxWeeklyCtrl.text.trim());
      final avgWeekly = int.tryParse(_avgWeeklyCtrl.text.trim());
      if (maxWeekly != null && avgWeekly != null && avgWeekly > maxWeekly) {
        setState(() => _error = l.avgExceedsMax);
        return;
      }

      if (_selectedSpecIds.isEmpty) {
        setState(() => _error = l.selectAtLeastOneSpecialization);
        return;
      }
      if (_otherSpecId != null &&
          _selectedSpecIds.contains(_otherSpecId) &&
          _otherSpecCtrl.text.trim().isEmpty) {
        setState(() => _error = l.otherSpecializationRequired);
        return;
      }

      // Build availability; require at least one complete, ordered window.
      final windows = <Map<String, dynamic>>[];
      for (final r in _availability) {
        if (r.weekday == null || r.start == null || r.end == null) continue;
        final startMin = r.start!.hour * 60 + r.start!.minute;
        final endMin = r.end!.hour * 60 + r.end!.minute;
        if (startMin >= endMin) {
          setState(() => _error = l.availabilityStartBeforeEnd);
          return;
        }
        windows.add({
          'weekday': r.weekday,
          'startTime': _fmtTime(r.start!),
          'endTime': _fmtTime(r.end!),
        });
      }
      if (windows.isEmpty) {
        setState(() => _error = l.addAtLeastOneAvailability);
        return;
      }

      final specs = _selectedSpecIds.map((id) {
        final isOther = id == _otherSpecId;
        return <String, dynamic>{
          'specializationId': id,
          if (isOther && _otherSpecCtrl.text.trim().isNotEmpty)
            'note': _otherSpecCtrl.text.trim(),
        };
      }).toList();

      final caseloads = <Map<String, dynamic>>[];
      for (final c in _caseloads) {
        final label = c.location.text.trim();
        if (label.isEmpty) continue;
        caseloads.add({
          'locationLabel': label,
          'clientCount': int.tryParse(c.count.text.trim()) ?? 0,
        });
      }
      if (caseloads.isEmpty) {
        setState(() => _error = l.addAtLeastOneCaseload);
        return;
      }

      String? t(TextEditingController c) =>
          c.text.trim().isEmpty ? null : c.text.trim();
      int? n(TextEditingController c) =>
          c.text.trim().isEmpty ? null : int.tryParse(c.text.trim());

      final patch = <String, dynamic>{
        'bmdcRegistrationNo': t(_bmdcCtrl),
        'graduationBatch': _batchValue,
        'workplace': t(_workplaceCtrl),
        'educationSummary': t(_educationCtrl),
        'bio': t(_bioCtrl),
        'phone': _phone.compose(),
        'feeAmount': double.tryParse(_feeCtrl.text.trim()),
        'feeCurrency': 'BDT',
        if (n(_yearsCtrl) != null) 'yearsOfExperience': n(_yearsCtrl),
        if (n(_maxWeeklyCtrl) != null) 'maxWeeklyClients': n(_maxWeeklyCtrl),
        if (n(_avgWeeklyCtrl) != null) 'avgWeeklyClients': n(_avgWeeklyCtrl),
        'referralSource': t(_referralCtrl),
        if (_districtId != null) 'districtId': _districtId,
        if (_upazilaId != null) 'upazilaId': _upazilaId,
        if (_unionId != null) 'unionId': _unionId,
        'specializations': specs,
        'availability': windows,
        'caseloads': caseloads,
        'acceptingNewClients': _acceptingNewClients,
        'isVisible': _isVisible,
        'isOnboardingComplete': true,
      };

      await ref.read(professionalRepositoryProvider).updateMe(patch);

      // Re-resolve the session so the router lets the professional into the
      // dashboard instead of bouncing back to onboarding.
      ref.invalidate(appSessionProvider);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l.onboardingCompleted)),
      );
      context.go(const ProfessionalDashboardRoute().location);
    } catch (e) {
      if (mounted) {
        final reason = _serverErrorMessage(e);
        setState(() => _error = reason == null
            ? context.l10n.onboardingSaveFailed
            : context.l10n.saveFailedReason(reason));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: LoadingView());
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.proOnboardingTitle,
            subtitle: l.proOnboardingSubtitle,
            actions: [
              IconButton(
                onPressed: () =>
                    ref.read(authStateProvider.notifier).signOut(),
                icon: const Icon(Icons.logout_rounded),
                tooltip: l.actionSignOut,
              ),
            ],
          ),
          Expanded(
            child: Form(
              key: _formKey,
              // Denser inputs + tighter density so this long clinician form fits
              // mobile better (smaller field height, labels, and control insets).
              child: Theme(
                data: Theme.of(context).copyWith(
                  visualDensity: VisualDensity.compact,
                  inputDecorationTheme:
                      Theme.of(context).inputDecorationTheme.copyWith(
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                          ),
                ),
                child: ListView(
                  padding: const EdgeInsets.all(AppSpacing.page),
                  children: [
                  if (_verificationStatus != null &&
                      _verificationStatus != 'APPROVED')
                    _verificationBanner(l),
                  Text(l.onboardingRequiredHint,
                      style: Theme.of(context).textTheme.bodySmall),

                  // --- Credentials ---
                  SectionHeader(l.sectionCredentials),
                  TextFormField(
                    controller: _bmdcCtrl,
                    decoration: InputDecoration(
                      labelText: l.fieldBmdcOptional,
                      helperText: l.bmdcHint,
                    ),
                  ),
                  const Gap(AppSpacing.sm),
                  DropdownMenu<String>(
                    initialSelection: _batchValue,
                    label: Text(l.fieldGraduationBatchOptional),
                    enabled: !_saving,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => setState(() => _batchValue = v),
                    dropdownMenuEntries: _batchOptions
                        .map((b) => DropdownMenuEntry(value: b, label: b))
                        .toList(),
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _educationCtrl,
                    minLines: 2,
                    maxLines: 4,
                    decoration: InputDecoration(labelText: l.fieldEducation),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? l.educationRequired
                        : null,
                  ),

                  // --- Practice ---
                  SectionHeader(l.sectionPractice),
                  TextFormField(
                    controller: _workplaceCtrl,
                    decoration:
                        InputDecoration(labelText: l.fieldWorkplaceOptional),
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _yearsCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(labelText: l.fieldYearsRequired),
                    validator: (v) {
                      final s = v?.trim() ?? '';
                      if (s.isEmpty) return l.requiredField;
                      final parsed = int.tryParse(s);
                      if (parsed == null || parsed < 0) return l.nonNegativeInteger;
                      // Mirror the server bound (@Max(80)) so an out-of-range
                      // value is caught inline instead of failing the save.
                      if (parsed > 80) return l.yearsOutOfRange;
                      return null;
                    },
                  ),
                  const Gap(AppSpacing.sm),
                  PhoneField(
                    controller: _phone,
                    label: l.fieldPhoneRequired,
                    isRequired: true,
                    enabled: !_saving,
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _bioCtrl,
                    minLines: 3,
                    maxLines: 6,
                    decoration: InputDecoration(labelText: l.fieldBioOptional),
                  ),

                  // --- Fee ---
                  SectionHeader(l.sectionFees),
                  TextFormField(
                    controller: _feeCtrl,
                    keyboardType: const TextInputType.numberWithOptions(
                        decimal: true),
                    decoration: InputDecoration(labelText: l.fieldFeeAmount),
                    validator: (v) {
                      final s = v?.trim() ?? '';
                      final d = double.tryParse(s);
                      if (d == null || d < 0) return l.feeRequired;
                      return null;
                    },
                  ),

                  // --- Location ---
                  SectionHeader(l.sectionLocation),
                  _geoDropdown(l.fieldDistrict, _districtId, _districts,
                      _onDistrictChanged, true),
                  const Gap(AppSpacing.sm),
                  _geoDropdown(l.fieldUpazilaOptional, _upazilaId, _upazilas,
                      _onUpazilaChanged, _upazilas.isNotEmpty,
                      dropdownKey: ValueKey('upazila-$_districtId'),
                      loading: _loadingUpazilas,
                      error: _upazilaError,
                      onRetry: _districtId == null
                          ? null
                          : () => _onDistrictChanged(_districtId)),
                  const Gap(AppSpacing.sm),
                  _geoDropdown(
                      l.fieldUnionOptional,
                      _unionId,
                      _unions,
                      (v) => setState(() => _unionId = v),
                      _unions.isNotEmpty,
                      dropdownKey: ValueKey('union-$_upazilaId'),
                      loading: _loadingUnions,
                      error: _unionError,
                      onRetry: _upazilaId == null
                          ? null
                          : () => _onUpazilaChanged(_upazilaId)),

                  // --- Specializations ---
                  SectionHeader(l.sectionSpecializations),
                  Text(l.specializationsRequiredHint,
                      style: Theme.of(context).textTheme.bodySmall),
                  const Gap(AppSpacing.sm),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.xs,
                    children: _specVocab.map((s) {
                      final id = s['id'].toString();
                      final selected = _selectedSpecIds.contains(id);
                      return FilterChip(
                        label: Text(_specLabel(s)),
                        selected: selected,
                        onSelected: _saving
                            ? null
                            : (on) => setState(() {
                                  if (on) {
                                    _selectedSpecIds.add(id);
                                  } else {
                                    _selectedSpecIds.remove(id);
                                  }
                                }),
                      );
                    }).toList(),
                  ),
                  if (_otherSpecId != null &&
                      _selectedSpecIds.contains(_otherSpecId)) ...[
                    const Gap(AppSpacing.sm),
                    TextFormField(
                      controller: _otherSpecCtrl,
                      decoration: InputDecoration(
                          labelText: l.fieldOtherSpecialization),
                    ),
                  ],

                  // --- Availability ---
                  SectionHeader(l.sectionAvailability),
                  ..._availability.asMap().entries.map((e) =>
                      _availabilityRow(l, e.key, e.value)),
                  const Gap(AppSpacing.sm),
                  OutlinedButton.icon(
                    onPressed: _saving
                        ? null
                        : () => setState(
                            () => _availability.add(_AvailabilityRow())),
                    icon: const Icon(Icons.add_rounded),
                    label: Text(l.addAvailabilityWindow),
                  ),

                  // --- Caseload ---
                  SectionHeader(l.sectionCaseload),
                  Text(l.caseloadRequiredHint,
                      style: Theme.of(context).textTheme.bodySmall),
                  const Gap(AppSpacing.sm),
                  ..._caseloads.asMap().entries.map((e) =>
                      _caseloadRow(l, e.key, e.value)),
                  const Gap(AppSpacing.sm),
                  OutlinedButton.icon(
                    onPressed: _saving
                        ? null
                        : () => setState(() => _caseloads.add(_CaseloadRow())),
                    icon: const Icon(Icons.add_rounded),
                    label: Text(l.addCaseloadRow),
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _maxWeeklyCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                        labelText: l.fieldMaxWeeklyClientsRequired),
                    validator: (v) {
                      final s = v?.trim() ?? '';
                      if (s.isEmpty) return l.requiredField;
                      final parsed = int.tryParse(s);
                      if (parsed == null || parsed < 0) return l.nonNegativeInteger;
                      if (parsed > 500) return l.weeklyOutOfRange;
                      return null;
                    },
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _avgWeeklyCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                        labelText: l.fieldAvgWeeklyClientsRequired),
                    validator: (v) {
                      final s = v?.trim() ?? '';
                      if (s.isEmpty) return l.requiredField;
                      final parsed = int.tryParse(s);
                      if (parsed == null || parsed < 0) return l.nonNegativeInteger;
                      if (parsed > 500) return l.weeklyOutOfRange;
                      return null;
                    },
                  ),
                  const Gap(AppSpacing.sm),
                  TextFormField(
                    controller: _referralCtrl,
                    decoration:
                        InputDecoration(labelText: l.fieldReferralSource),
                  ),

                  // Visibility (listing + accepting new clients) defaults ON;
                  // the professional only appears publicly after admin approval.
                  // Kept off the onboarding form to keep it short and simple.
                  if (_error != null) ...[
                    const Gap(AppSpacing.lg),
                    Text(_error!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error)),
                  ],
                  const Gap(AppSpacing.xl),
                  FilledButton(
                    onPressed: _saving ? null : _finish,
                    child: Text(_saving ? l.actionSaving : l.finishOnboarding),
                  ),
                  const Gap(AppSpacing.xl),
                ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _verificationBanner(AppLocalizations l) => Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Theme.of(context)
              .colorScheme
              .secondary
              .withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          children: [
            Icon(Icons.verified_outlined,
                size: 20, color: Theme.of(context).colorScheme.secondary),
            const Gap.horizontal(AppSpacing.sm),
            Expanded(
              child: Text(
                l.verificationStatus(_verificationStatus!),
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );

  Widget _geoDropdown(
    String label,
    String? value,
    List<Map<String, dynamic>> items,
    ValueChanged<String?> onChanged,
    bool enabled, {
    Key? dropdownKey,
    bool loading = false,
    String? error,
    VoidCallback? onRetry,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DropdownMenu<String>(
          // DropdownMenu caches entries; a changing key forces a rebuild when the
          // dependent list reloads (district→upazila→union).
          key: dropdownKey,
          initialSelection: value,
          label: Text(label),
          enabled: !_saving && enabled && !loading,
          expandedInsets: EdgeInsets.zero,
          onSelected: onChanged,
          dropdownMenuEntries: items
              .map((d) => DropdownMenuEntry(
                    value: d['id'] as String,
                    label: d['nameBn'] as String? ?? '',
                  ))
              .toList(),
        ),
        if (loading) ...[
          const Gap(AppSpacing.xs),
          const LinearProgressIndicator(minHeight: 2),
        ],
        if (error != null) ...[
          const Gap(AppSpacing.xs),
          Row(
            children: [
              Expanded(
                child: Text(
                  error,
                  style: TextStyle(color: theme.colorScheme.error),
                ),
              ),
              if (onRetry != null)
                TextButton(
                  onPressed: _saving ? null : onRetry,
                  child: Text(context.l10n.actionRetry),
                ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _availabilityRow(AppLocalizations l, int index, _AvailabilityRow row) {
    // Match the time buttons to the Day dropdown's field height so all three
    // controls line up on the same baseline.
    final timeButtonStyle = OutlinedButton.styleFrom(
      minimumSize: const Size.fromHeight(56),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 3,
            child: DropdownMenu<String>(
              initialSelection: row.weekday,
              label: Text(l.fieldWeekday),
              enabled: !_saving,
              expandedInsets: EdgeInsets.zero,
              onSelected: (v) => setState(() => row.weekday = v),
              dropdownMenuEntries: _weekdays
                  .map((w) => DropdownMenuEntry(
                      value: w, label: _weekdayLabel(w)))
                  .toList(),
            ),
          ),
          const Gap.horizontal(AppSpacing.sm),
          Expanded(
            flex: 2,
            child: OutlinedButton(
              style: timeButtonStyle,
              onPressed: _saving ? null : () => _pickTime(row, true),
              child: Text(
                row.start == null ? l.fieldStartTime : _fmtTime(row.start!),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          const Gap.horizontal(AppSpacing.xs),
          Expanded(
            flex: 2,
            child: OutlinedButton(
              style: timeButtonStyle,
              onPressed: _saving ? null : () => _pickTime(row, false),
              child: Text(
                row.end == null ? l.fieldEndTime : _fmtTime(row.end!),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          IconButton(
            onPressed: _saving
                ? null
                : () => setState(() => _availability.removeAt(index)),
            icon: const Icon(Icons.close_rounded),
          ),
        ],
      ),
    );
  }

  Widget _caseloadRow(AppLocalizations l, int index, _CaseloadRow row) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: TextFormField(
              controller: row.location,
              decoration:
                  InputDecoration(labelText: l.fieldCaseloadLocation),
            ),
          ),
          const Gap.horizontal(AppSpacing.sm),
          Expanded(
            flex: 2,
            child: TextFormField(
              controller: row.count,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: l.fieldCaseloadCount),
            ),
          ),
          IconButton(
            onPressed: _saving
                ? null
                : () => setState(() {
                      _caseloads.removeAt(index).dispose();
                    }),
            icon: const Icon(Icons.close_rounded),
          ),
        ],
      ),
    );
  }
}
