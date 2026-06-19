import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qlife/src/app/app.dart';
import 'package:qlife/src/app/router.dart';
import 'package:qlife/src/features/auth/data/auth_repository.dart';
import 'package:qlife/src/features/auth/data/auth_tokens.dart';
import 'package:qlife/src/features/auth/presentation/sign_in_screen.dart';
import 'package:qlife/src/features/home/presentation/home_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_home_screen.dart';
import 'package:qlife/src/features/professional/presentation/professional_onboarding_screen.dart';
import 'package:qlife/src/features/users/presentation/user_profile_completion_screen.dart';
import 'package:qlife/src/shared/api/api_client.dart';

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
  Future<void> confirmSignUp({required String email, required String code}) async {}

  @override
  Future<void> resendConfirmationCode(String email) async {}

  @override
  Future<AuthTokens> signIn({required String email, required String password}) async =>
      const AuthTokens(accessToken: 'a', refreshToken: 'r', idToken: 'i');

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<void> confirmForgotPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {}

  @override
  Future<AuthTokens?> refreshSession() async => _stored;

  @override
  Future<void> changePassword(
      {required String oldPassword, required String newPassword}) async {}

  @override
  Future<void> deleteCognitoUser() async {}
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
            const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: null,
      );
      expect(find.byType(SignInScreen), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('USER with incomplete profile is redirected to UserProfileCompletionScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: const AppSession(role: 'USER', isUserProfileComplete: false),
      );
      expect(find.byType(UserProfileCompletionScreen), findsOneWidget);
    });

    testWidgets('USER with complete profile lands on HomeScreen', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: const AppSession(role: 'USER', isUserProfileComplete: true),
      );
      expect(find.byType(HomeScreen), findsOneWidget);
    });

    testWidgets(
        'PROFESSIONAL with incomplete onboarding is redirected to ProfessionalOnboardingScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: const AppSession(role: 'PROFESSIONAL', isProfessionalOnboardingComplete: false),
      );
      expect(find.byType(ProfessionalOnboardingScreen), findsOneWidget);
    });

    testWidgets('PROFESSIONAL with completed onboarding lands on ProfessionalHomeScreen',
        (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: const AppSession(role: 'PROFESSIONAL', isProfessionalOnboardingComplete: true),
      );
      expect(find.byType(ProfessionalHomeScreen), findsOneWidget);
    });

    testWidgets('ADMIN lands on HomeScreen', (tester) async {
      await _bootApp(
        tester,
        storedTokens: const AuthTokens(accessToken: 'tok', refreshToken: null, idToken: null),
        session: const AppSession(role: 'ADMIN'),
      );
      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}
