import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../data/auth_repository.dart';
import '../state/auth_state.dart';
import 'widgets/auth_form_scaffold.dart';

/// Fully in-app password reset: request a one-time code by email, then enter
/// the code + a new password. On success the user is signed in.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _newPassword = TextEditingController();
  bool _codeSent = false;
  bool _obscure = true;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _code.dispose();
    _newPassword.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final l = context.l10n;
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(authRepositoryProvider).forgotPassword(_email.text.trim());
      setState(() => _codeSent = true);
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = l.authErrGeneric);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _reset() async {
    final l = context.l10n;
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final tokens = await ref.read(authRepositoryProvider).resetPassword(
            email: _email.text.trim(),
            code: _code.text,
            newPassword: _newPassword.text,
          );
      // The reset signs the user in — establish the session and go home.
      await ref.read(authStateProvider.notifier).onAuthenticated(tokens);
      ref.invalidate(appSessionProvider);
      if (mounted) context.go(const SplashRoute().location);
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = l.authErrGeneric);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;

    return AuthFormScaffold(
      title: l.authForgotTitle,
      subtitle: l.authForgotSubtitle,
      onBack: () => context.pop(),
      children: [
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _email,
                enabled: !_codeSent,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                decoration: InputDecoration(
                  labelText: l.authEmail,
                  prefixIcon: const Icon(Icons.mail_outline_rounded),
                ),
                validator: (v) {
                  final t = v?.trim() ?? '';
                  if (t.isEmpty) return l.authErrEmailRequired;
                  if (!authEmailRegExp.hasMatch(t)) return l.authErrEmailInvalid;
                  return null;
                },
              ),
              if (_codeSent) ...[
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _code,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: l.authVerifyCode,
                    prefixIcon: const Icon(Icons.password_rounded),
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? l.authErrCodeRequired
                      : null,
                ),
                const Gap(AppSpacing.md),
                TextFormField(
                  controller: _newPassword,
                  obscureText: _obscure,
                  autofillHints: const [AutofillHints.newPassword],
                  decoration: InputDecoration(
                    labelText: l.authNewPassword,
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (v) {
                    final t = v ?? '';
                    if (t.isEmpty) return l.authErrPasswordRequired;
                    if (t.length < authMinPasswordLength) {
                      return l.authErrPasswordShort;
                    }
                    return null;
                  },
                ),
              ],
              if (_error != null) ...[
                const Gap(AppSpacing.md),
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ],
              const Gap(AppSpacing.lg),
              FilledButton(
                onPressed: _busy ? null : (_codeSent ? _reset : _sendCode),
                child: _busy
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : Text(_codeSent ? l.authResetAction : l.authSendCode),
              ),
              const Gap(AppSpacing.sm),
              TextButton(
                onPressed: _busy
                    ? null
                    : () => context.go(const SignInRoute().location),
                child: Text(l.authBackToSignIn),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
