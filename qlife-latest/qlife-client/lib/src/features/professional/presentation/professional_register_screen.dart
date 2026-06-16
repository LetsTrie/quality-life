import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/theme/app_spacing.dart';
import '../data/professional_repository.dart';

class ProfessionalRegisterScreen extends ConsumerStatefulWidget {
  const ProfessionalRegisterScreen({super.key});

  @override
  ConsumerState<ProfessionalRegisterScreen> createState() => _ProfessionalRegisterScreenState();
}

class _ProfessionalRegisterScreenState extends ConsumerState<ProfessionalRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _designationCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  String? _professionType;
  String? _gender;
  bool _saving = false;
  String? _error;

  static const _professionTypes = <String>[
    'CLINICAL_PSYCHOLOGIST',
    'ASSISTANT_CLINICAL_PSYCHOLOGIST',
    'PSYCHIATRIST',
    'COUNSELOR',
    'OTHER',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _designationCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  String _labelForProfession(String v) {
    return v
        .replaceAll('_', ' ')
        .toLowerCase()
        .split(' ')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
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
        setState(() => _error = 'Please select a profession type.');
        return;
      }

      await ref.read(professionalRepositoryProvider).register(
            fullName: _nameCtrl.text.trim(),
            professionType: _professionType!,
            gender: _gender,
            designation: _designationCtrl.text.trim().isEmpty ? null : _designationCtrl.text.trim(),
            phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
          );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registered as professional')),
      );
      context.go(const SplashRoute().location);
    } catch (e) {
      setState(() => _error = 'Registration failed. Please try again.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Become a professional')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.page),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                if (_error != null) ...[
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  const Gap(AppSpacing.md),
                ],
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'Full name'),
                  validator: (v) => (v == null || v.trim().length < 2) ? 'Name required' : null,
                ),
                const Gap(AppSpacing.md),
                DropdownMenu<String>(
                  initialSelection: _professionType,
                  label: const Text('Profession type'),
                  enabled: !_saving,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _professionType = v),
                  dropdownMenuEntries: _professionTypes
                      .map((p) => DropdownMenuEntry(value: p, label: _labelForProfession(p)))
                      .toList(),
                ),
                const Gap(AppSpacing.md),
                DropdownMenu<String>(
                  initialSelection: _gender,
                  label: const Text('Gender (optional)'),
                  enabled: !_saving,
                  expandedInsets: EdgeInsets.zero,
                  onSelected: (v) => setState(() => _gender = v),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 'MALE', label: 'Male'),
                    DropdownMenuEntry(value: 'FEMALE', label: 'Female'),
                    DropdownMenuEntry(value: 'OTHER', label: 'Other'),
                    DropdownMenuEntry(value: 'UNDISCLOSED', label: 'Prefer not to say'),
                  ],
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _designationCtrl,
                  decoration: const InputDecoration(labelText: 'Designation (optional)'),
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone (optional)'),
                ),
                const Gap(AppSpacing.xl),
                FilledButton(
                  onPressed: _saving ? null : _submit,
                  child: Text(_saving ? 'Submitting...' : 'Continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
