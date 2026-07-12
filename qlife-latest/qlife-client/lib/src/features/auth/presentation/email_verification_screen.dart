import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../shared/api/health_repository.dart';
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
  // WorkOS pending-authentication token that the OTP code is verified against.
  final String? pendingAuthenticationToken;
  const VerifyEmailArgs({
    required this.email,
    this.password,
    this.pendingAuthenticationToken,
  });
}

class EmailVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final String? password;
  final String? pendingAuthenticationToken;

  const EmailVerificationScreen({
    super.key,
    required this.email,
    this.password,
    this.pendingAuthenticationToken,
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
  // Refreshed by _resend (the pending token is short-lived).
  late String? _pendingToken = widget.pendingAuthenticationToken;

  Future<void> _verify() async {
    final l = context.l10n;
    if (_otpValue.length < 6) {
      setState(() => _error = l.authErrCodeRequired);
      return;
    }
    if (_pendingToken == null) {
      setState(() => _error = l.authErrGeneric);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final repo = ref.read(authRepositoryProvider);
      // Verifying returns the session tokens directly (auto sign-in).
      final tokens = await repo.confirmSignUp(
        pendingAuthenticationToken: _pendingToken!,
        code: _otpValue,
      );
      await ref.read(authStateProvider.notifier).onAuthenticated(tokens);

      // Silent server health check — not shown in UI, only surfaces on failure.
      try {
        await ref.read(healthRepositoryProvider).check();
      } catch (_) {
        if (mounted) setState(() => _error = l.serverUnavailable);
        return;
      }

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

  Future<void> _resend() async {
    final l = context.l10n;
    final password = widget.password;
    if (password == null) return; // can't re-auth without the password
    try {
      final token = await ref
          .read(authRepositoryProvider)
          .resendConfirmationCode(email: widget.email, password: password);
      if (token != null) _pendingToken = token;
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
/// Backed by a SINGLE hidden text field so the OS paste action fills every box
/// at once and backspace deletes smoothly (one digit per tap, hold to repeat).
/// The six boxes are purely visual and reflect the field's current value.
class _OtpInput extends StatefulWidget {
  final ValueChanged<String> onChanged;
  final ValueChanged<String>? onCompleted;

  const _OtpInput({required this.onChanged, this.onCompleted});

  @override
  State<_OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<_OtpInput> {
  static const _length = 6;
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    widget.onChanged(value);
    if (value.length == _length) {
      _focusNode.unfocus();
      widget.onCompleted?.call(value);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () => _focusNode.requestFocus(),
      behavior: HitTestBehavior.opaque,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Boxes render the value; they don't intercept taps.
          IgnorePointer(
            child: AnimatedBuilder(
              animation: Listenable.merge([_controller, _focusNode]),
              builder: (context, _) => Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children:
                    List.generate(_length, (i) => _box(theme, i)),
              ),
            ),
          ),
          // The real, invisible input sits on top and captures all editing,
          // including multi-character paste and continuous backspace.
          Positioned.fill(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              keyboardType: TextInputType.number,
              autofocus: true,
              showCursor: false,
              maxLength: _length,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(_length),
              ],
              style: const TextStyle(
                color: Colors.transparent,
                height: 1,
                fontSize: 1,
              ),
              cursorColor: Colors.transparent,
              decoration: const InputDecoration(
                counterText: '',
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                fillColor: Colors.transparent,
                filled: true,
              ),
              onChanged: _onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _box(ThemeData theme, int i) {
    final cs = theme.colorScheme;
    final text = _controller.text;
    final char = i < text.length ? text[i] : '';
    // Highlight the box the next digit will land in.
    final isActive = _focusNode.hasFocus &&
        (i == text.length || (text.length == _length && i == _length - 1));

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 5),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        width: 46,
        height: 58,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isActive ? cs.primary : cs.outline.withValues(alpha: 0.5),
            width: isActive ? 2 : 1,
          ),
        ),
        child: Text(
          char,
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
