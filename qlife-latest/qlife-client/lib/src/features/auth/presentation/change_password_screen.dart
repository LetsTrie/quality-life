import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/gradient_header.dart';
import '../data/auth_repository.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l = context.l10n;
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(authRepositoryProvider).changePassword(
            oldPassword: _currentCtrl.text,
            newPassword: _newCtrl.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.passwordChanged)));
      context.pop();
    } catch (e) {
      if (mounted) setState(() => _error = l.changePasswordFailed);
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
            title: l.navChangePassword,
            showBack: true,
            compact: true,
          ),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.page),
                children: [
                  if (_error != null) ...[
                    Text(_error!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error)),
                    const Gap(AppSpacing.md),
                  ],
                  TextFormField(
                    controller: _currentCtrl,
                    obscureText: true,
                    decoration:
                        InputDecoration(labelText: l.fieldCurrentPassword),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? l.requiredField : null,
                  ),
                  const Gap(AppSpacing.md),
                  TextFormField(
                    controller: _newCtrl,
                    obscureText: true,
                    decoration: InputDecoration(labelText: l.fieldNewPassword),
                    validator: (v) =>
                        (v == null || v.length < 8) ? l.passwordTooShort : null,
                  ),
                  const Gap(AppSpacing.md),
                  TextFormField(
                    controller: _confirmCtrl,
                    obscureText: true,
                    decoration:
                        InputDecoration(labelText: l.fieldConfirmPassword),
                    validator: (v) =>
                        v != _newCtrl.text ? l.passwordMismatch : null,
                  ),
                  const Gap(AppSpacing.xl),
                  FilledButton(
                    onPressed: _saving ? null : _submit,
                    child: Text(_saving ? l.actionSaving : l.navChangePassword),
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
