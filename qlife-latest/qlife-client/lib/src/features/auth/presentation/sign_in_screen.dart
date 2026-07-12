import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../data/auth_repository.dart';
import '../state/auth_intent.dart';
import '../state/auth_state.dart';
import 'email_verification_screen.dart';
import 'widgets/auth_form_scaffold.dart';

class SignInScreen extends ConsumerStatefulWidget {
  /// When true, this is the professional sign-in variant (blue accent).
  final bool professional;
  const SignInScreen({super.key, this.professional = false});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;

  /// Standard input text size — the themed body style runs large for Bengali.
  static const _inputStyle = TextStyle(fontSize: 16, height: 1.2);
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l = context.l10n;
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });

    final email = _email.text.trim();
    // The professional variant routes a plain USER account into the become-a-pro
    // flow after sign-in; harmless for accounts that are already PROFESSIONAL.
    ref.read(pendingProfessionalRegistrationProvider.notifier).state =
        widget.professional;

    try {
      await ref
          .read(authStateProvider.notifier)
          .signInWithPassword(email, _password.text);
      ref.invalidate(appSessionProvider);
      if (mounted) context.go(const SplashRoute().location);
    } on AuthException catch (e) {
      if (e.code == 'UserNotConfirmedException' && mounted) {
        context.go(
          const VerifyEmailRoute().location,
          extra: VerifyEmailArgs(
            email: email,
            password: _password.text,
            pendingAuthenticationToken: e.pendingAuthenticationToken,
          ),
        );
        return;
      }
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
      professional: widget.professional,
      title: widget.professional
          ? l.authProfessionalSignInTitle
          : l.authSignInTitle,
      subtitle: l.authSignInSubtitle,
      children: [
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _email,
                style: _inputStyle,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                textInputAction: TextInputAction.next,
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
              const Gap(AppSpacing.md),
              TextFormField(
                controller: _password,
                style: _inputStyle,
                obscureText: _obscure,
                autofillHints: const [AutofillHints.password],
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: l.authPassword,
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  suffixIcon: IconButton(
                    icon: Icon(_obscure
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) =>
                    (v == null || v.isEmpty) ? l.authErrPasswordRequired : null,
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _busy
                      ? null
                      : () => context.go(const ForgotPasswordRoute().location),
                  child: Text(l.authForgotPassword),
                ),
              ),
              if (_error != null) ...[
                const Gap(AppSpacing.xs),
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ],
              const Gap(AppSpacing.md),
              FilledButton(
                onPressed: _busy ? null : _submit,
                child: _busy
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : Text(l.authSignInAction),
              ),
              const Gap(AppSpacing.sm),
              TextButton(
                onPressed: _busy
                    ? null
                    : () => context.go(
                        SignUpRoute(professional: widget.professional).location),
                child: Text(l.authNoAccount),
              ),
              const Divider(height: AppSpacing.lg),
              TextButton(
                onPressed: _busy
                    ? null
                    : () => context.go(
                        SignInRoute(professional: !widget.professional)
                            .location),
                child: Text(widget.professional
                    ? l.authSignInAsUser
                    : l.authSignInAsProfessional),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
