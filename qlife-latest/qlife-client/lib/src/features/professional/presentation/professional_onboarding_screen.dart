import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/async_state_views.dart';
import '../data/professional_repository.dart';

class ProfessionalOnboardingScreen extends ConsumerStatefulWidget {
  const ProfessionalOnboardingScreen({super.key});

  @override
  ConsumerState<ProfessionalOnboardingScreen> createState() => _ProfessionalOnboardingScreenState();
}

class _ProfessionalOnboardingScreenState extends ConsumerState<ProfessionalOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _workplaceCtrl = TextEditingController();
  final _yearsCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  bool _acceptingNewClients = false;
  bool _isVisible = false;
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
    _workplaceCtrl.dispose();
    _yearsCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(professionalRepositoryProvider);
      final res = await repo.me();
      final data = (res['data'] as Map<String, dynamic>)['professional'] as Map<String, dynamic>;

      _workplaceCtrl.text = (data['workplace']?.toString() ?? '').trim();
      _bioCtrl.text = (data['bio']?.toString() ?? '').trim();
      final years = data['yearsOfExperience'];
      _yearsCtrl.text = years == null ? '' : years.toString();

      _acceptingNewClients = (data['acceptingNewClients'] as bool?) ?? false;
      _isVisible = (data['isVisible'] as bool?) ?? false;

      final verifications = (data['verifications'] as List<dynamic>?) ?? const [];
      if (verifications.isNotEmpty) {
        final latest = verifications.first as Map<String, dynamic>;
        _verificationStatus = latest['status']?.toString();
      }
    } catch (e) {
      setState(() => _error = 'Could not load profile. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _finish() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final ok = _formKey.currentState?.validate() ?? false;
      if (!ok) return;

      final patch = <String, dynamic>{
        'workplace': _workplaceCtrl.text.trim().isEmpty ? null : _workplaceCtrl.text.trim(),
        'bio': _bioCtrl.text.trim().isEmpty ? null : _bioCtrl.text.trim(),
        'acceptingNewClients': _acceptingNewClients,
        'isVisible': _isVisible,
        'isOnboardingComplete': true,
      };

      final years = _yearsCtrl.text.trim();
      if (years.isNotEmpty) patch['yearsOfExperience'] = int.tryParse(years) ?? 0;

      await ref.read(professionalRepositoryProvider).updateMe(patch);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Onboarding completed')),
      );
      context.go(const ProfessionalDashboardRoute().location);
    } catch (e) {
      setState(() => _error = 'Failed to save. Please try again.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: LoadingView());
    return Scaffold(
      appBar: AppBar(
        title: const Text('Professional onboarding'),
        actions: [
          IconButton(onPressed: _saving ? null : _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.page),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                if (_verificationStatus != null)
                  Text('Verification: $_verificationStatus',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                if (_error != null) ...[
                  const Gap(AppSpacing.md),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _workplaceCtrl,
                  decoration: const InputDecoration(labelText: 'Workplace (optional)'),
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _yearsCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Years of experience (optional)'),
                  validator: (v) {
                    final s = v?.trim() ?? '';
                    if (s.isEmpty) return null;
                    final n = int.tryParse(s);
                    if (n == null || n < 0) return 'Enter a non-negative integer';
                    return null;
                  },
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _bioCtrl,
                  minLines: 3,
                  maxLines: 6,
                  decoration: const InputDecoration(labelText: 'Bio (optional)'),
                ),
                const Gap(AppSpacing.md),
                SwitchListTile(
                  title: const Text('Accepting new clients'),
                  value: _acceptingNewClients,
                  onChanged: _saving ? null : (v) => setState(() => _acceptingNewClients = v),
                ),
                SwitchListTile(
                  title: const Text('Show in directory'),
                  subtitle: const Text('Visible only after admin approval'),
                  value: _isVisible,
                  onChanged: _saving ? null : (v) => setState(() => _isVisible = v),
                ),
                const Gap(AppSpacing.xl),
                FilledButton(
                  onPressed: _saving ? null : _finish,
                  child: Text(_saving ? 'Saving...' : 'Finish onboarding'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
