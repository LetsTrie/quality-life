import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../../auth/state/auth_intent.dart';
import '../../auth/state/auth_state.dart';
import '../data/professional_repository.dart';

class ProfessionalRegisterScreen extends ConsumerStatefulWidget {
  const ProfessionalRegisterScreen({super.key});

  @override
  ConsumerState<ProfessionalRegisterScreen> createState() =>
      _ProfessionalRegisterScreenState();
}

class _ProfessionalRegisterScreenState
    extends ConsumerState<ProfessionalRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _designationCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  String? _professionType;
  String? _gender;
  bool _saving = false;
  String? _error;
  List<Map<String, dynamic>> _professionTypeData = [];

  @override
  void initState() {
    super.initState();
    _loadProfessionTypes();
  }

  Future<void> _loadProfessionTypes() async {
    try {
      final types = await ref.read(professionalRepositoryProvider).listProfessionTypes();
      if (mounted) setState(() => _professionTypeData = types);
    } catch (_) {
      // Fall back to hardcoded list if server unreachable at registration time.
      if (mounted) {
        setState(() => _professionTypeData = [
          {'value': 'CLINICAL_PSYCHOLOGIST', 'labelEn': 'Clinical psychologist', 'labelBn': 'ক্লিনিক্যাল সাইকোলজিস্ট'},
          {'value': 'ASSISTANT_CLINICAL_PSYCHOLOGIST', 'labelEn': 'Assistant clinical psychologist', 'labelBn': 'সহকারী ক্লিনিক্যাল সাইকোলজিস্ট'},
          {'value': 'PSYCHIATRIST', 'labelEn': 'Psychiatrist', 'labelBn': 'মনোরোগ বিশেষজ্ঞ'},
          {'value': 'COUNSELOR', 'labelEn': 'Counselor', 'labelBn': 'কাউন্সেলর'},
          {'value': 'OTHER', 'labelEn': 'Other', 'labelBn': 'অন্যান্য'},
        ]);
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _designationCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  String _labelForProfession(BuildContext context, Map<String, dynamic> item) {
    final isBangla = Localizations.localeOf(context).languageCode == 'bn';
    return (isBangla
        ? item['labelBn'] as String?
        : item['labelEn'] as String?) ?? item['value'] as String? ?? '';
  }

  Future<void> _submit() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final ok = _formKey.currentState?.validate() ?? false;
      if (!ok) return;

      if (_professionType == null) {
        setState(() => _error = context.l10n.selectProfessionType);
        return;
      }

      await ref.read(professionalRepositoryProvider).register(
            fullName: _nameCtrl.text.trim(),
            professionType: _professionType!,
            gender: _gender,
            designation: _designationCtrl.text.trim().isEmpty
                ? null
                : _designationCtrl.text.trim(),
            phone: _phoneCtrl.text.trim().isEmpty
                ? null
                : _phoneCtrl.text.trim(),
          );

      // The account is now PROFESSIONAL: clear the pending-pro intent and drop
      // the stale (USER) session so the router re-resolves to the pro flow.
      ref.read(pendingProfessionalRegistrationProvider.notifier).state = false;
      ref.invalidate(appSessionProvider);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.registeredAsProfessional)),
      );
      context.go(const SplashRoute().location);
    } catch (e) {
      if (mounted) setState(() => _error = context.l10n.registrationFailed);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(
            title: l.becomeProfessionalTitle,
            subtitle: l.navBecomeProfessionalDesc,
            showBack: true,
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
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.page),
                children: [
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: InputDecoration(
                      labelText: l.fieldFullName,
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                    validator: (v) => (v == null || v.trim().length < 2)
                        ? l.nameRequired
                        : null,
                  ),
                const Gap(AppSpacing.md),
                DropdownMenu<String>(
                  initialSelection: _professionType,
                  label: Text(l.fieldProfessionType),
                  enabled: !_saving && _professionTypeData.isNotEmpty,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _professionType = v),
                  dropdownMenuEntries: _professionTypeData
                      .map((item) => DropdownMenuEntry(
                            value: item['value'] as String,
                            label: _labelForProfession(context, item),
                          ))
                      .toList(),
                ),
                const Gap(AppSpacing.md),
                DropdownMenu<String>(
                  initialSelection: _gender,
                  label: Text(l.fieldGenderOptional),
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
                TextFormField(
                  controller: _designationCtrl,
                  decoration:
                      InputDecoration(labelText: l.fieldDesignationOptional),
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _phoneCtrl,
                  decoration:
                      InputDecoration(labelText: l.fieldPhoneOptional),
                ),
                  if (_error != null) ...[
                    const Gap(AppSpacing.lg),
                    _ErrorBanner(_error!),
                  ],
                  const Gap(AppSpacing.xl),
                  FilledButton(
                    onPressed: _saving ? null : _submit,
                    child:
                        Text(_saving ? l.actionSubmitting : l.actionContinue),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A soft, non-alarming inline error banner for forms.
class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner(this.message);
  final String message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: scheme.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: scheme.error.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline_rounded, size: 20, color: scheme.error),
          const Gap.horizontal(AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: scheme.error),
            ),
          ),
        ],
      ),
    );
  }
}
