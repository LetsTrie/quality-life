import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/app/app.dart';
import 'package:qlife/src/app/router.dart';
import 'package:qlife/src/features/auth/data/auth_repository.dart';
import 'package:qlife/src/features/auth/data/auth_tokens.dart';
import 'package:qlife/src/features/auth/presentation/forgot_password_screen.dart';
import 'package:qlife/src/features/auth/presentation/sign_in_screen.dart';
import 'package:qlife/src/features/auth/presentation/sign_up_screen.dart';
import 'package:qlife/src/features/auth/presentation/email_verification_screen.dart';
import 'package:qlife/src/features/auth/state/auth_intent.dart';
import 'package:qlife/src/features/home/presentation/home_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_home_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_onboarding_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_register_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_rejected_screen.dart';
import 'package:qlife/src/features/users/presentation/user_profile_completion_screen.dart';
import 'package:qlife/src/shared/api/api_client.dart';
import 'package:qlife/src/shared/push/push_notification_service.dart';
import 'package:qlife/src/shared/realtime/realtime_service.dart';

// ─── Fakes ────────────────────────────────────────────────────────────────────

class _FakeAuthRepo implements AuthRepository {
  final AuthTokens? _stored;
  _FakeAuthRepo({AuthTokens? stored}) : _stored = stored;

  @override
  Future<AuthTokens?> loadTokens() async => _stored;

  @override
  Future<void> saveTokens(AuthTokens tokens) async {}

  @override
  Future<void> clearTokens() async {}

  @override
  Future<SignUpOutcome> signUp({required String email, required String password}) async =>
      const SignUpOutcome(userConfirmed: false);

  @override
  Future<AuthTokens> confirmSignUp({
    required String pendingAuthenticationToken,
    required String code,
  }) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<String?> resendConfirmationCode({
    required String email,
    required String password,
  }) async =>
      null;

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<AuthTokens> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r');

  @override
  Future<AuthTokens?> refreshSession() async => _stored;

  @override
  Future<void> changePassword(
      {required String oldPassword, required String newPassword}) async {}

  @override
  Future<void> deleteAccount() async {}
}

// No-op session services so init/logout don't touch Firebase or open sockets
// (which would leave pending timers in the test environment).
class _NoopPush extends PushNotificationService {
  _NoopPush(super.ref);
  @override
  Future<void> initialize() async {}
  @override
  Future<void> syncToken() async {}
  @override
  Future<void> teardown({bool deregisterRemote = true}) async {}
}

class _NoopRealtime extends RealtimeService {
  _NoopRealtime(super.ref);
  @override
  Future<void> connect() async {}
  @override
  Future<void> disconnect() async {}
}

// Returns a Dio that always throws — ensures no real HTTP calls escape in tests.
Dio _noopDio() => Dio()
  ..interceptors.add(InterceptorsWrapper(
    onRequest: (_, handler) => handler.reject(
      DioException(requestOptions: RequestOptions(path: ''), message: 'no-http-in-tests'),
    ),
  ));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/// Pumps the full [QLifeApp] with the given provider overrides and waits for
/// navigation to settle. Pass [extraOverrides] to add test-specific overrides.
Future<void> _bootApp(
  WidgetTester tester, {
  required AuthTokens? storedTokens,
  required AppSession? session,
  List<Override> extra = const [],
}) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(_FakeAuthRepo(stored: storedTokens)),
        apiClientProvider.overrideWithValue(_noopDio()),
        pushNotificationServiceProvider.overrideWith((ref) => _NoopPush(ref)),
        realtimeServiceProvider.overrideWith((ref) => _NoopRealtime(ref)),
        if (session != null)
          appSessionProvider.overrideWith((_) async => session)
        else
          appSessionProvider.overrideWith((_) async => null),
        ...extra,
      ],
      child: const QLifeApp(),
    ),
  );

  // Let SplashScreen mount and call initialize(), then let the router redirect.
  await tester.pump();        // build
  await tester.pump();        // initialize() microtask
  await tester.pumpAndSettle(); // router redirect + screen build
}

// ─── Tests ────────────────────────────────────────────────────────────────────

void main() {
  group('Router redirects', () {
    testWidgets('unauthenticated user lands on SignInScreen', (tester) async {
      await _bootApp(tester, storedTokens: null, session: null);
      expect(find.byType(SignInScreen), findsOneWidget);
    });

    testWidgets(
        'authenticated user whose session cannot resolve lands on SignInScreen without a redirect loop',
        (tester) async {
      // Tokens exist locally (authenticated) but the session resolves to null —
      // e.g. expired tokens or an unreachable backend. This previously bounced
      // splash ↔ sign-in forever ("redirect loop detected"). It must instead
      // settle on the sign-in screen.
      await _bootApp(
        tester,
        storedTokens:
            const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: null,
      );
      expect(find.byType(SignInScreen), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
        'authenticated user with unresolved session can open sign-up and forgot-password',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens:
            const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: null,
      );
      expect(find.byType(SignInScreen), findsOneWidget);

      await tester.tap(find.text('New here? Create an account'));
      await tester.pumpAndSettle();
      expect(find.byType(SignUpScreen), findsOneWidget);

      await tester.tap(find.text('Already have an account? Sign in'));
      await tester.pumpAndSettle();
      expect(find.byType(SignInScreen), findsOneWidget);

      await tester.tap(find.text('Forgot password?'));
      await tester.pumpAndSettle();
      expect(find.byType(ForgotPasswordScreen), findsOneWidget);
    });

    testWidgets(
        'authenticated user with unresolved session can reach email verification without a loop',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens:
            const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: null,
      );
      expect(find.byType(SignInScreen), findsOneWidget);

      // Simulate navigation to /verify (e.g. after sign-up) — must not bounce.
      final router = ProviderScope.containerOf(tester.element(find.byType(QLifeApp)))
          .read(appRouterProvider);
      router.go(const VerifyEmailRoute().location);
      await tester.pumpAndSettle();

      expect(find.byType(EmailVerificationScreen), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
        'USER on the professional path is redirected to ProfessionalRegisterScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'USER', isUserProfileComplete: true),
        extra: [pendingProfessionalRegistrationProvider.overrideWith((_) => true)],
      );
      expect(find.byType(ProfessionalRegisterScreen), findsOneWidget);
    });

    testWidgets('USER with incomplete profile is redirected to UserProfileCompletionScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'USER', isUserProfileComplete: false),
      );
      expect(find.byType(UserProfileCompletionScreen), findsOneWidget);
    });

    testWidgets('USER with complete profile lands on HomeScreen', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'USER', isUserProfileComplete: true),
      );
      expect(find.byType(HomeScreen), findsOneWidget);
    });

    testWidgets(
        'PROFESSIONAL with incomplete onboarding is redirected to ProfessionalOnboardingScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'PROFESSIONAL', isProfessionalOnboardingComplete: false),
      );
      expect(find.byType(ProfessionalOnboardingScreen), findsOneWidget);
    });

    testWidgets('PROFESSIONAL with completed onboarding lands on ProfessionalHomeScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'PROFESSIONAL', isProfessionalOnboardingComplete: true),
      );
      expect(find.byType(ProfessionalHomeScreen), findsOneWidget);
    });

    testWidgets(
        'PROFESSIONAL whose verification was REJECTED lands on ProfessionalRejectedScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(
          role: 'PROFESSIONAL',
          isProfessionalOnboardingComplete: true,
          professionalVerificationStatus: 'REJECTED',
        ),
      );
      expect(find.byType(ProfessionalRejectedScreen), findsOneWidget);
      expect(find.byType(ProfessionalHomeScreen), findsNothing);
    });

    testWidgets('rejected PROFESSIONAL cannot reach the dashboard', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(
          role: 'PROFESSIONAL',
          isProfessionalOnboardingComplete: true,
          professionalVerificationStatus: 'REJECTED',
        ),
      );
      expect(find.byType(ProfessionalRejectedScreen), findsOneWidget);

      final router = ProviderScope.containerOf(tester.element(find.byType(QLifeApp)))
          .read(appRouterProvider);
      router.go(const ProfessionalDashboardRoute().location);
      await tester.pumpAndSettle();
      expect(find.byType(ProfessionalRejectedScreen), findsOneWidget);
      expect(find.byType(ProfessionalHomeScreen), findsNothing);
    });

    testWidgets('ADMIN lands on HomeScreen', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'ADMIN'),
      );
      expect(find.byType(HomeScreen), findsOneWidget);
    });

    testWidgets('PROFESSIONAL with incomplete onboarding cannot reach HomeScreen', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null),
        session: const AppSession(role: 'PROFESSIONAL', isProfessionalOnboardingComplete: false),
      );
      expect(find.byType(ProfessionalOnboardingScreen), findsOneWidget);

      final router = ProviderScope.containerOf(tester.element(find.byType(QLifeApp)))
          .read(appRouterProvider);
      router.go(const HomeRoute().location);
      await tester.pumpAndSettle();
      expect(find.byType(ProfessionalOnboardingScreen), findsOneWidget);
      expect(find.byType(HomeScreen), findsNothing);
    });
  });
}
