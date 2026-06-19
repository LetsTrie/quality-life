import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_spacing.dart';
import '../data/auth_repository.dart';
import '../state/auth_state.dart';
import 'widgets/auth_form_scaffold.dart';

/// Arguments passed to the verification screen via GoRouter `extra`. [password]
/// is carried so we can sign the user in automatically once the email is
/// confirmed; it may be null if the screen is reached without it.
class VerifyEmailArgs {
  final String email;
  final String? password;
  const VerifyEmailArgs({required this.email, this.password});
}

class EmailVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final String? password;

  const EmailVerificationScreen({
    super.key,
    required this.email,
    this.password,
  });

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  String _otpValue = '';
  bool _busy = false;
  String? _error;

  Future<void> _verify() async {
    final l = context.l10n;
    if (_otpValue.length < 6) {
      setState(() => _error = l.authErrCodeRequired);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final repo = ref.read(authRepositoryProvider);
      await repo.confirmSignUp(email: widget.email, code: _otpValue);

      // Auto sign-in when we still hold the password from the sign-up step.
      if (widget.password != null) {
        await ref
            .read(authStateProvider.notifier)
            .signInWithPassword(widget.email, widget.password!);
        ref.invalidate(appSessionProvider);
        if (mounted) context.go(const SplashRoute().location);
      } else if (mounted) {
        context.go(const SignInRoute().location);
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = l.authErrGeneric);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resend() async {
    final l = context.l10n;
    try {
      await ref.read(authRepositoryProvider).resendConfirmationCode(widget.email);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l.authCodeResent)),
        );
      }
    } on AuthException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final ready = _otpValue.length == 6;

    return AuthFormScaffold(
      title: l.authVerifyTitle,
      subtitle: l.authVerifySubtitle(widget.email),
      onBack: () => context.pop(),
      children: [
        _OtpInput(
          onChanged: (v) => setState(() {
            _otpValue = v;
            _error = null;
          }),
          onCompleted: _busy ? null : (_) => _verify(),
        ),
        if (_error != null) ...[
          const Gap(AppSpacing.sm),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: TextStyle(color: Theme.of(context).colorScheme.error),
          ),
        ],
        const Gap(AppSpacing.lg),
        FilledButton(
          onPressed: (_busy || !ready) ? null : _verify,
          child: _busy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation(Colors.white),
                  ),
                )
              : Text(l.authVerifyAction),
        ),
        const Gap(AppSpacing.sm),
        TextButton(
          onPressed: _busy ? null : _resend,
          child: Text(l.authResendCode),
        ),
      ],
    );
  }
}

/// Industry-standard 6-box OTP input.
///
/// Each box accepts one digit. Focus auto-advances on entry and retreats on
/// backspace. [onCompleted] fires when all six digits are filled.
class _OtpInput extends StatefulWidget {
  final ValueChanged<String> onChanged;
  final ValueChanged<String>? onCompleted;

  const _OtpInput({required this.onChanged, this.onCompleted});

  @override
  State<_OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<_OtpInput> {
  static const _length = 6;
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _nodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(_length, (_) => TextEditingController());
    _nodes = List.generate(_length, (_) => FocusNode());
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  String get _value => _controllers.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    if (value.isEmpty) {
      widget.onChanged(_value);
      return;
    }
    if (index < _length - 1) {
      _nodes[index + 1].requestFocus();
    } else {
      _nodes[index].unfocus();
    }
    final current = _value;
    widget.onChanged(current);
    if (current.length == _length) widget.onCompleted?.call(current);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_length, (i) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5),
          child: Focus(
            onKeyEvent: (_, event) {
              if (event is KeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace &&
                  _controllers[i].text.isEmpty &&
                  i > 0) {
                _nodes[i - 1].requestFocus();
                return KeyEventResult.handled;
              }
              return KeyEventResult.ignored;
            },
            child: SizedBox(
              width: 46,
              height: 58,
              child: TextFormField(
                controller: _controllers[i],
                focusNode: _nodes[i],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  contentPadding: EdgeInsets.zero,
                  filled: true,
                  fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: cs.outline.withValues(alpha: 0.5),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: cs.outline.withValues(alpha: 0.5),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: cs.primary, width: 2),
                  ),
                ),
                onChanged: (v) => _onChanged(i, v),
                onTap: () => _controllers[i].selection =
                    TextSelection.fromPosition(
                  TextPosition(offset: _controllers[i].text.length),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
