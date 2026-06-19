import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../../shared/widgets/terms_conditions_dialog.dart';
import '../../auth/state/auth_state.dart';
import '../../geo/data/geo_repository.dart';
import '../data/users_repository.dart';

class UserProfileCompletionScreen extends ConsumerStatefulWidget {
  const UserProfileCompletionScreen({super.key});

  @override
  ConsumerState<UserProfileCompletionScreen> createState() => _UserProfileCompletionScreenState();
}

class _UserProfileCompletionScreenState extends ConsumerState<UserProfileCompletionScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  DateTime? _dateOfBirth;

  String? _gender;
  String? _marital;

  String? _districtId;
  String? _upazilaId;
  String? _unionId;

  bool _loading = true;
  bool _saving = false;
  bool _isEditing = false;
  bool _hasAcceptedConsent = false;
  bool _agreedToTerms = false;
  String? _error;

  List<Map<String, dynamic>> _districts = const [];
  List<Map<String, dynamic>> _upazilas = const [];
  List<Map<String, dynamic>> _unions = const [];
  bool _loadingUpazilas = false;
  bool _loadingUnions = false;
  String? _upazilaError;
  String? _unionError;

  @override
  void initState() {
    super.initState();
    Future<void>(() async {
      await _loadInitial();
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _dobCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  String _fmtDate(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  int _ageYearsFromDob(DateTime dob) {
    final now = DateTime.now();
    var age = now.year - dob.year;
    if (now.month < dob.month || (now.month == dob.month && now.day < dob.day)) {
      age -= 1;
    }
    return age;
  }

  Future<void> _pickDob() async {
    final now = DateTime.now();
    final firstDate = DateTime(now.year - 150, 1, 1);
    final lastDate = DateTime(now.year - 5, now.month, now.day);
    var initial = _dateOfBirth ?? DateTime(now.year - 25, now.month, now.day);
    if (initial.isBefore(firstDate)) initial = firstDate;
    if (initial.isAfter(lastDate)) initial = lastDate;

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: firstDate,
      lastDate: lastDate,
    );
    if (picked == null) return;
    final cleaned = DateTime(picked.year, picked.month, picked.day);
    setState(() {
      _dateOfBirth = cleaned;
      _dobCtrl.text = _fmtDate(cleaned);
    });
  }

  Future<void> _loadInitial() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final l = context.l10n;
    try {
      final users = ref.read(usersRepositoryProvider);
      final geo = ref.read(geoRepositoryProvider);

      final me = await users.me();
      final data = me['data'] as Map<String, dynamic>;
      final user = data['user'] as Map<String, dynamic>;
      final isProfileComplete = data['isProfileComplete'] == true;
      final hasAcceptedConsent = data['hasAcceptedConsent'] == true;

      _isEditing = isProfileComplete;
      _hasAcceptedConsent = hasAcceptedConsent;
      _agreedToTerms = hasAcceptedConsent;

      _nameCtrl.text = (user['displayName']?.toString() ?? '').trim();
      _phoneCtrl.text = (user['phone']?.toString() ?? '').trim();

      final dob = user['dateOfBirth']?.toString();
      if (dob != null) {
        final parsed = DateTime.tryParse(dob);
        if (parsed != null) {
          final cleaned = DateTime(parsed.year, parsed.month, parsed.day);
          _dateOfBirth = cleaned;
          _dobCtrl.text = _fmtDate(cleaned);
        }
      }

      _gender = user['gender']?.toString();
      _marital = user['marital']?.toString();

      _districtId = user['districtId']?.toString();
      _upazilaId = user['upazilaId']?.toString();
      _unionId = user['unionId']?.toString();

      _districts = await geo.listDistricts();
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
    } catch (e) {
      if (mounted) setState(() => _error = l.errLoadProfile);
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
      final geo = ref.read(geoRepositoryProvider);
      final list = await geo.listUpazilas(id);
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
      final geo = ref.read(geoRepositoryProvider);
      final list = await geo.listUnions(id);
      if (mounted) setState(() => _unions = list);
    } catch (_) {
      if (mounted) setState(() => _unionError = l.errLoadUnions);
    } finally {
      if (mounted) setState(() => _loadingUnions = false);
    }
  }

  Future<void> _save() async {
    final l = context.l10n;
    setState(() {
      _error = null;
      _saving = true;
    });
    try {
      final ok = _formKey.currentState?.validate() ?? false;
      if (!ok) return;

      if (!_hasAcceptedConsent && !_agreedToTerms) {
        setState(() => _error = l.fieldAgreeTerms);
        return;
      }

      // DropdownMenu does not participate in Form validation, so required
      // selections are validated explicitly here.
      if (_gender == null || _marital == null || _districtId == null) {
        setState(() => _error = l.selectGenderMaritalDistrict);
        return;
      }

      final users = ref.read(usersRepositoryProvider);
      // Terms acceptance is captured by the checkbox and saved together with
      // the profile in a single request (no separate consent screen).
      await users.updateMe(
        displayName: _nameCtrl.text.trim(),
        dateOfBirth: _dateOfBirth == null ? '' : _fmtDate(_dateOfBirth!),
        gender: _gender!,
        marital: _marital!,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        districtId: _districtId,
        upazilaId: _upazilaId,
        unionId: _unionId,
        consentAccepted: (!_hasAcceptedConsent && _agreedToTerms) ? true : null,
      );

      // Re-resolve the session in place (button stays in its spinner) so the
      // router doesn't flash the full-screen splash between pages.
      ref.invalidate(appSessionProvider);
      await ref.read(appSessionProvider.future);

      if (!mounted) return;
      if (_isEditing) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l.profileSaved)),
        );
        if (context.canPop()) {
          context.pop();
        } else {
          context.go(const AccountRoute().location);
        }
        return;
      }
      // Offer the optional intro self-check as a modal instead of a screen.
      await _showSelfCheckModal();
    } catch (e) {
      if (mounted) setState(() => _error = context.l10n.profileSaveFailed);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _showSelfCheckModal() async {
    final l = context.l10n;
    final start = await showModalBottomSheet<bool>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l.introTitle, style: Theme.of(ctx).textTheme.titleLarge),
            const Gap(AppSpacing.sm),
            Text(l.introBody, style: Theme.of(ctx).textTheme.bodyMedium),
            const Gap(AppSpacing.lg),
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              child: Text(l.introStart),
            ),
            const Gap(AppSpacing.sm),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: Text(l.introLater),
            ),
          ],
        ),
      ),
    );
    if (!mounted) return;
    if (start == true) {
      context.go(const InstrumentDetailRoute(slug: 'wellbeing-5').location);
    } else {
      context.go(const HomeRoute().location);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final title = _isEditing ? l.navProfile : l.completeProfileTitle;
    final subtitle = _isEditing ? l.navProfileDesc : l.completeProfileSubtitle;
    final requiresConsent = !_hasAcceptedConsent;
    if (_loading) {
      return Scaffold(
        body: Column(
          children: [
            GradientHeader(
              title: title,
              subtitle: subtitle,
              compact: true,
            ),
            const Expanded(child: LoadingView()),
          ],
        ),
      );
    }
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: title,
            subtitle: subtitle,
            actions: [
              IconButton(
                onPressed: _saving ? null : _loadInitial,
                icon: const Icon(Icons.refresh_rounded),
              ),
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
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.page),
                children: [
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: InputDecoration(
                      labelText: l.fieldName,
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? l.nameRequired : null,
                  ),
                  const Gap(AppSpacing.md),
                  TextFormField(
                    controller: _dobCtrl,
                    readOnly: true,
                    decoration: InputDecoration(
                      labelText: l.fieldDateOfBirth,
                      prefixIcon: const Icon(Icons.cake_outlined),
                      suffixIcon: const Icon(Icons.calendar_month_rounded),
                    ),
                    onTap: (_saving) ? null : _pickDob,
                    validator: (_) {
                      final dob = _dateOfBirth;
                      if (dob == null) return l.dobRequired;
                      final age = _ageYearsFromDob(dob);
                      if (age < 5 || age > 150) return l.dobRange;
                      return null;
                    },
                  ),
                  if (_dateOfBirth != null) ...[
                    const Gap(AppSpacing.xs),
                    Text(
                      l.labelAgeYears(_ageYearsFromDob(_dateOfBirth!)),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                  const Gap(AppSpacing.md),
                  DropdownMenu<String>(
                    initialSelection: _gender,
                    label: Text(l.fieldGender),
                    enabled: !_saving,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => setState(() => _gender = v),
                    dropdownMenuEntries: [
                      DropdownMenuEntry(value: 'MALE', label: l.genderMale),
                      DropdownMenuEntry(value: 'FEMALE', label: l.genderFemale),
                      DropdownMenuEntry(value: 'OTHER', label: l.genderOther),
                      DropdownMenuEntry(
                          value: 'UNDISCLOSED', label: l.genderUndisclosed),
                    ],
                  ),
                  const Gap(AppSpacing.md),
                  DropdownMenu<String>(
                    initialSelection: _marital,
                    label: Text(l.fieldMaritalStatus),
                    enabled: !_saving,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => setState(() => _marital = v),
                    dropdownMenuEntries: [
                      DropdownMenuEntry(value: 'SINGLE', label: l.maritalSingle),
                      DropdownMenuEntry(
                          value: 'MARRIED', label: l.maritalMarried),
                      DropdownMenuEntry(
                          value: 'DIVORCED', label: l.maritalDivorced),
                      DropdownMenuEntry(
                          value: 'WIDOWED', label: l.maritalWidowed),
                      DropdownMenuEntry(
                          value: 'SEPARATED', label: l.maritalSeparated),
                      DropdownMenuEntry(
                          value: 'UNDISCLOSED', label: l.maritalUndisclosed),
                    ],
                  ),
                  const Gap(AppSpacing.md),
                  TextFormField(
                    controller: _phoneCtrl,
                    decoration: InputDecoration(
                      labelText: l.fieldPhoneOptional,
                      prefixIcon: const Icon(Icons.phone_outlined),
                    ),
                  ),
                  const Gap(AppSpacing.md),
                  DropdownMenu<String>(
                    initialSelection: _districtId,
                    label: Text(l.fieldDistrict),
                    enabled: !_saving,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => _onDistrictChanged(v),
                    dropdownMenuEntries: _districts
                        .map((d) => DropdownMenuEntry(
                              value: d['id'] as String,
                              label: d['nameBn'] as String? ?? '',
                            ))
                        .toList(),
                  ),
                  const Gap(AppSpacing.md),
                  DropdownMenu<String>(
                    // DropdownMenu caches its entries; a key tied to the parent
                    // selection forces a rebuild when the list reloads.
                    key: ValueKey('upazila-$_districtId'),
                    initialSelection: _upazilaId,
                    label: Text(l.fieldUpazilaOptional),
                    enabled: !_saving && !_loadingUpazilas && _upazilas.isNotEmpty,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => _onUpazilaChanged(v),
                    dropdownMenuEntries: _upazilas
                        .map((u) => DropdownMenuEntry(
                              value: u['id'] as String,
                              label: u['nameBn'] as String? ?? '',
                            ))
                        .toList(),
                  ),
                  if (_loadingUpazilas) ...[
                    const Gap(AppSpacing.xs),
                    const LinearProgressIndicator(minHeight: 2),
                  ],
                  if (_upazilaError != null) ...[
                    const Gap(AppSpacing.xs),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _upazilaError!,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: _saving ? null : () => _onDistrictChanged(_districtId),
                          child: Text(l.actionRetry),
                        ),
                      ],
                    ),
                  ],
                  const Gap(AppSpacing.md),
                  DropdownMenu<String>(
                    key: ValueKey('union-$_upazilaId'),
                    initialSelection: _unionId,
                    label: Text(l.fieldUnionOptional),
                    enabled: !_saving && !_loadingUnions && _unions.isNotEmpty,
                    expandedInsets: EdgeInsets.zero,
                    onSelected: (v) => setState(() => _unionId = v),
                    dropdownMenuEntries: _unions
                        .map((u) => DropdownMenuEntry(
                              value: u['id'] as String,
                              label: u['nameBn'] as String? ?? '',
                            ))
                        .toList(),
                  ),
                  if (_loadingUnions) ...[
                    const Gap(AppSpacing.xs),
                    const LinearProgressIndicator(minHeight: 2),
                  ],
                  if (_unionError != null) ...[
                    const Gap(AppSpacing.xs),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _unionError!,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: _saving ? null : () => _onUpazilaChanged(_upazilaId),
                          child: Text(l.actionRetry),
                        ),
                      ],
                    ),
                  ],
                  const Gap(AppSpacing.lg),
                  if (requiresConsent)
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      controlAffinity: ListTileControlAffinity.leading,
                      value: _agreedToTerms,
                      onChanged: _saving
                          ? null
                          : (v) => setState(() => _agreedToTerms = v ?? false),
                      title: InkWell(
                        onTap: _saving
                            ? null
                            : () async {
                                final accepted =
                                    await TermsConditionsDialog.show(context);
                                if (accepted && mounted) {
                                  setState(() => _agreedToTerms = true);
                                }
                              },
                        child: Text(
                          l.fieldAgreeTerms,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                decoration: TextDecoration.underline,
                              ),
                        ),
                      ),
                    ),
                  if (_error != null) ...[
                    const Gap(AppSpacing.sm),
                    Text(_error!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error)),
                  ],
                  const Gap(AppSpacing.md),
                  FilledButton(
                    onPressed:
                        (_saving || (requiresConsent && !_agreedToTerms))
                            ? null
                            : _save,
                    child: Text(
                      _saving
                          ? l.actionSaving
                          : (_isEditing
                              ? MaterialLocalizations.of(context)
                                  .saveButtonLabel
                              : l.saveAndContinue),
                    ),
                  ),
                  const Gap(AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
