import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/sign_in_screen.dart';
import '../features/auth/presentation/sign_up_screen.dart';
import '../features/auth/presentation/email_verification_screen.dart';
import '../features/auth/presentation/forgot_password_screen.dart';
import '../features/auth/presentation/change_password_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/splash/presentation/splash_screen.dart';
import '../features/auth/state/auth_state.dart';
import '../features/auth/state/auth_intent.dart';
import '../features/instruments/presentation/instrument_detail_screen.dart';
import '../features/instruments/presentation/instruments_screen.dart';
import '../features/assessments/presentation/assigned_assessments_screen.dart';
import '../features/assessments/presentation/assigned_assessment_screen.dart';
import '../features/appointments/presentation/appointments_screen.dart';
import '../features/appointments/presentation/appointment_detail_screen.dart';
import '../features/clients/presentation/clients_screen.dart';
import '../features/clients/presentation/client_detail_screen.dart';
import '../features/clients/presentation/client_assessments_screen.dart';
import '../features/assessments/presentation/assessment_result_screen.dart';
import '../features/assessments/presentation/assessment_history_screen.dart';
import '../features/content/presentation/content_screen.dart';
import '../features/content/presentation/content_player_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';
import '../features/help/presentation/help_center_screen.dart';
import '../features/professionals/presentation/professionals_screen.dart';
import '../features/professionals/presentation/professional_detail_screen.dart';
import '../shared/models/professional.dart';
import '../shared/models/appointment.dart';
import '../shared/models/client.dart';
import '../shared/models/instrument.dart';
import '../shared/models/assessment.dart';
import '../features/professional/presentation/professional_home_screen.dart';
import '../features/professional/presentation/professional_onboarding_screen.dart';
import '../features/professional/presentation/professional_register_screen.dart';
import '../features/professional/presentation/professional_rejected_screen.dart';
import '../features/users/presentation/user_profile_completion_screen.dart';
import '../features/account/presentation/account_screen.dart';
import '../shared/api/api_client.dart';
import 'shell_scaffold.dart';

class AppSession {
  final String role; // USER | PROFESSIONAL | ADMIN
  final bool? isUserProfileComplete;
  final bool? hasAcceptedConsent;
  final bool? hasCompletedIntroScreening;
  final bool? isProfessionalOnboardingComplete;

  /// Latest professional verification status (PENDING/APPROVED/REJECTED/…).
  /// Drives the rejected-professional gate.
  final String? professionalVerificationStatus;

  const AppSession({
    required this.role,
    this.isUserProfileComplete,
    this.hasAcceptedConsent,
    this.hasCompletedIntroScreening,
    this.isProfessionalOnboardingComplete,
    this.professionalVerificationStatus,
  });
}

final appSessionProvider = FutureProvider<AppSession?>((ref) async {
  final auth = ref.watch(authStateProvider);
  if (!auth.isAuthenticated) return null;

  final dio = ref.watch(apiClientProvider);
  final meRes = await dio.get('/v1/me');
  final meData = (meRes.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
  final account = meData['account'] as Map<String, dynamic>?;
  final role = account?['role']?.toString() ?? '';

  if (role == 'USER') {
    final userRes = await dio.get('/v1/users/me');
    final data = (userRes.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final complete = (data['isProfileComplete'] as bool?) ?? false;
    final consent = (data['hasAcceptedConsent'] as bool?) ?? false;
    final intro = (data['hasCompletedIntroScreening'] as bool?) ?? false;
    return AppSession(
      role: role,
      isUserProfileComplete: complete,
      hasAcceptedConsent: consent,
      hasCompletedIntroScreening: intro,
    );
  }

  if (role == 'PROFESSIONAL') {
    final proRes = await dio.get('/v1/professionals/me');
    final data = (proRes.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final professional = data['professional'] as Map<String, dynamic>;
    final complete = (professional['isOnboardingComplete'] as bool?) ?? false;
    final verifications =
        (professional['verifications'] as List<dynamic>?) ?? const [];
    final verificationStatus = verifications.isEmpty
        ? null
        : (verifications.first as Map<String, dynamic>)['status']?.toString();
    return AppSession(
      role: role,
      isProfessionalOnboardingComplete: complete,
      professionalVerificationStatus: verificationStatus,
    );
  }

  return AppSession(role: role);
});

// Keeps the GoRouter instance stable. Re-evaluates the redirect (without
// rebuilding the router) whenever auth or session state changes.
class _RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  _RouterNotifier(this._ref) {
    _ref.listen<AuthState>(authStateProvider, (_, __) => notifyListeners());
    _ref.listen<AsyncValue<AppSession?>>(appSessionProvider, (_, __) => notifyListeners());
    _ref.listen<bool>(pendingProfessionalRegistrationProvider, (_, __) => notifyListeners());
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final auth = _ref.read(authStateProvider);
    final session = _ref.read(appSessionProvider);

    final loc = state.matchedLocation;
    final isSplash = loc == const SplashRoute().location;
    final isSignIn = loc == const SignInRoute().location;
    // The unauthenticated-but-allowed screens: sign-in, sign-up, email
    // verification, and forgot-password.
    final isAuthRoute = isSignIn ||
        loc == const SignUpRoute().location ||
        loc == const VerifyEmailRoute().location ||
        loc == const ForgotPasswordRoute().location;

    if (!auth.isInitialized) return isSplash ? null : const SplashRoute().location;

    // Not authenticated → allow the auth screens; bounce everything else to
    // sign-in.
    if (!auth.isAuthenticated) return isAuthRoute ? null : const SignInRoute().location;

    // Authenticated. Hold on splash while the session resolves.
    if (session.isLoading) return isSplash ? null : const SplashRoute().location;

    final s = session.valueOrNull;
    // Authenticated but the session could not be resolved — e.g. expired/invalid
    // tokens or an unreachable backend. Land on sign-in so the user can
    // re-authenticate, and STAY there. Returning splash here instead would
    // bounce splash ↔ sign-in forever (the redirect loop). Still allow the
    // other unauthenticated auth screens (sign-up, forgot password, verify)
    // so those links work from the sign-in page.
    if (s == null) return isAuthRoute ? null : const SignInRoute().location;

    // True when the user chose the "professional" path on sign-in/up but their
    // account is still a plain USER — they go through registration first.
    final wantsPro = _ref.read(pendingProfessionalRegistrationProvider);

    // Session is ready — route away from the splash/auth screens to the correct
    // home for this role.
    if (isSplash || isAuthRoute) {
      if (s.role == 'USER') {
        if (wantsPro) return const ProfessionalRegisterRoute().location;
        if (s.isUserProfileComplete == false) return const ProfileRoute().location;
        return const HomeRoute().location;
      }
      if (s.role == 'PROFESSIONAL') {
        if (s.professionalVerificationStatus == 'REJECTED') {
          return const ProfessionalRejectedRoute().location;
        }
        return s.isProfessionalOnboardingComplete == false
            ? const ProfessionalOnboardingRoute().location
            : const ProfessionalDashboardRoute().location;
      }
      return const HomeRoute().location;
    }

    if (s.role == 'USER') {
      // Professional-path sign-in/up: keep the user in the registration flow
      // (register → onboarding) until the account is upgraded.
      if (wantsPro) {
        final atProReg = loc == const ProfessionalRegisterRoute().location ||
            loc == const ProfessionalOnboardingRoute().location;
        return atProReg ? null : const ProfessionalRegisterRoute().location;
      }
      if (s.isUserProfileComplete == false && loc != const ProfileRoute().location) {
        return const ProfileRoute().location;
      }
      if (loc == const ProfessionalDashboardRoute().location ||
          loc == const ProfessionalOnboardingRoute().location ||
          loc == const ClientsRoute().location) {
        return const HomeRoute().location;
      }
      return null;
    }

    if (s.role == 'PROFESSIONAL') {
      // A rejected professional never reaches the dashboard — they're held on a
      // dedicated, polite screen until they sign out.
      if (s.professionalVerificationStatus == 'REJECTED') {
        return loc == const ProfessionalRejectedRoute().location
            ? null
            : const ProfessionalRejectedRoute().location;
      }
      if (s.isProfessionalOnboardingComplete == false &&
          loc != const ProfessionalOnboardingRoute().location) {
        return const ProfessionalOnboardingRoute().location;
      }
      if (loc == const HomeRoute().location ||
          loc == const ProfileRoute().location ||
          loc == const ProfessionalsDirectoryRoute().location ||
          loc == const ProfessionalRejectedRoute().location) {
        return const ProfessionalDashboardRoute().location;
      }
      return null;
    }

    // ADMIN (or unknown): land on home for now.
    return loc == const HomeRoute().location ? null : const HomeRoute().location;
  }
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = _RouterNotifier(ref);
  ref.onDispose(notifier.dispose);

  return GoRouter(
    initialLocation: const SplashRoute().location,
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      // Full-screen routes outside the bottom-nav shell.
      GoRoute(
        path: const SplashRoute().location,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: SignInRoute.path,
        builder: (context, state) => SignInScreen(
          professional: state.uri.queryParameters['pro'] == 'true',
        ),
      ),
      GoRoute(
        path: SignUpRoute.path,
        builder: (context, state) => SignUpScreen(
          professional: state.uri.queryParameters['pro'] == 'true',
        ),
      ),
      GoRoute(
        path: const VerifyEmailRoute().location,
        builder: (context, state) {
          final args = state.extra as VerifyEmailArgs?;
          return EmailVerificationScreen(
            email: args?.email ?? '',
            password: args?.password,
          );
        },
      ),
      GoRoute(
        path: const ForgotPasswordRoute().location,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: const ChangePasswordRoute().location,
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: const ProfileRoute().location,
        builder: (context, state) => const UserProfileCompletionScreen(),
      ),
      GoRoute(
        path: ClientAssessmentsRoute.path,
        builder: (context, state) => ClientAssessmentsScreen(
          careRelationshipId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: AssessmentResultRoute.path,
        builder: (context, state) => AssessmentResultScreen(
          assessmentId: state.pathParameters['id']!,
          initial: state.extra as Map<String, dynamic>?,
        ),
      ),
      GoRoute(
        path: AssessmentHistoryRoute.path,
        builder: (context, state) => AssessmentHistoryScreen(
          slug: state.pathParameters['slug']!,
          title: state.uri.queryParameters['title'] ?? '',
        ),
      ),
      GoRoute(
        path: ProfessionalDetailRoute.path,
        builder: (context, state) => ProfessionalDetailScreen(
          id: state.pathParameters['id']!,
          initial: state.extra as Professional?,
        ),
      ),
      GoRoute(
        path: const ProfessionalRegisterRoute().location,
        builder: (context, state) => const ProfessionalRegisterScreen(),
      ),
      GoRoute(
        path: const ProfessionalOnboardingRoute().location,
        builder: (context, state) => const ProfessionalOnboardingScreen(),
      ),
      GoRoute(
        path: const ProfessionalRejectedRoute().location,
        builder: (context, state) => const ProfessionalRejectedScreen(),
      ),
      GoRoute(
        path: const NotificationsRoute().location,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: const ContentLibraryRoute().location,
        builder: (context, state) => const ContentScreen(),
      ),
      GoRoute(
        path: HelpCenterRoute.path,
        builder: (context, state) => HelpCenterScreen(
          urgent: state.uri.queryParameters['urgent'] == 'true',
          slug: state.uri.queryParameters['slug'],
        ),
      ),
      GoRoute(
        path: AssignedAssessmentsRoute.path,
        builder: (context, state) => const AssignedAssessmentsScreen(),
      ),
      GoRoute(
        path: AssignedAssessmentRoute.path,
        builder: (context, state) => AssignedAssessmentScreen(
          assessmentId: state.pathParameters['id']!,
          initial: state.extra as AssessmentTakeDetail?,
        ),
      ),
      GoRoute(
        path: const ContentPlayerRoute().location,
        builder: (context, state) {
          final args = state.extra as ContentPlayerArgs?;
          // Reached without args (e.g. deep link) → fall back to the library.
          if (args == null) return const ContentScreen();
          return ContentPlayerScreen(args: args);
        },
      ),

      // Main app — persistent bottom navigation. Branch order MUST match the
      // indices in ShellBranch (shell_scaffold.dart).
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            ShellScaffold(navigationShell: navigationShell),
        branches: [
          // 0 — home dashboard
          StatefulShellBranch(routes: [
            GoRoute(
              path: const HomeRoute().location,
              builder: (context, state) => const HomeScreen(),
            ),
          ]),
          // 1 — self-checks (+ detail)
          StatefulShellBranch(routes: [
            GoRoute(
              path: const InstrumentsRoute().location,
              builder: (context, state) => const InstrumentsScreen(),
              routes: [
                GoRoute(
                  path: ':slug',
                  builder: (context, state) => InstrumentDetailScreen(
                    slug: state.pathParameters['slug']!,
                    initial: state.extra as InstrumentDetail?,
                  ),
                ),
              ],
            ),
          ]),
          // 2 — professionals directory
          StatefulShellBranch(routes: [
            GoRoute(
              path: const ProfessionalsDirectoryRoute().location,
              builder: (context, state) => const ProfessionalsScreen(),
            ),
          ]),
          // 3 — appointments (+ detail)
          StatefulShellBranch(routes: [
            GoRoute(
              path: const AppointmentsRoute().location,
              builder: (context, state) => const AppointmentsScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) => AppointmentDetailScreen(
                    appointmentId: state.pathParameters['id']!,
                    initial: state.extra as AppointmentDetail?,
                  ),
                ),
              ],
            ),
          ]),
          // 4 — clients (professional, + detail)
          StatefulShellBranch(routes: [
            GoRoute(
              path: const ClientsRoute().location,
              builder: (context, state) => const ClientsScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) => ClientDetailScreen(
                    careRelationshipId: state.pathParameters['id']!,
                    initial: state.extra as Client?,
                  ),
                ),
              ],
            ),
          ]),
          // 5 — account / more
          StatefulShellBranch(routes: [
            GoRoute(
              path: const AccountRoute().location,
              builder: (context, state) => const AccountScreen(),
            ),
          ]),
          // 6 — professional dashboard
          StatefulShellBranch(routes: [
            GoRoute(
              path: const ProfessionalDashboardRoute().location,
              builder: (context, state) => const ProfessionalHomeScreen(),
            ),
          ]),
        ],
      ),
    ],
  );
});

/// Maps a notification (its [type] plus any linked entity) to the most useful
/// destination. An *assigned* scale opens the take-flow so the user can complete
/// it; a *completed* one opens its result; appointment notifications open the
/// appointment. Shared by the in-app list and push taps so both behave alike.
String notificationRouteLocation({
  required String type,
  String? appointmentId,
  String? assessmentId,
}) {
  if (assessmentId != null && assessmentId.isNotEmpty) {
    return type == 'ASSESSMENT_ASSIGNED'
        ? AssignedAssessmentRoute(id: assessmentId).location
        : AssessmentResultRoute(id: assessmentId).location;
  }
  if (appointmentId != null && appointmentId.isNotEmpty) {
    return AppointmentDetailRoute(id: appointmentId).location;
  }
  return const NotificationsRoute().location;
}

class SplashRoute {
  const SplashRoute();
  String get location => '/';
}

class SignInRoute {
  final bool professional;
  const SignInRoute({this.professional = false});
  static String get path => '/sign-in';
  String get location => professional ? '/sign-in?pro=true' : '/sign-in';
}

class SignUpRoute {
  final bool professional;
  const SignUpRoute({this.professional = false});
  static String get path => '/sign-up';
  String get location => professional ? '/sign-up?pro=true' : '/sign-up';
}

class VerifyEmailRoute {
  const VerifyEmailRoute();
  String get location => '/verify';
}

class ForgotPasswordRoute {
  const ForgotPasswordRoute();
  String get location => '/forgot-password';
}

class ChangePasswordRoute {
  const ChangePasswordRoute();
  String get location => '/change-password';
}

class HomeRoute {
  const HomeRoute();
  String get location => '/home';
}

class ProfileRoute {
  const ProfileRoute();
  String get location => '/profile';
}

class AccountRoute {
  const AccountRoute();
  String get location => '/account';
}

class ProfessionalDashboardRoute {
  const ProfessionalDashboardRoute();
  String get location => '/professional';
}

class ProfessionalRegisterRoute {
  const ProfessionalRegisterRoute();
  String get location => '/professional/register';
}

class ProfessionalOnboardingRoute {
  const ProfessionalOnboardingRoute();
  String get location => '/professional/onboarding';
}

class ProfessionalRejectedRoute {
  const ProfessionalRejectedRoute();
  String get location => '/professional/rejected';
}

class InstrumentsRoute {
  const InstrumentsRoute();
  String get location => '/instruments';
}

class InstrumentDetailRoute {
  final String slug;
  const InstrumentDetailRoute({required this.slug});
  String get location => '/instruments/$slug';
  static String get path => '/instruments/:slug';
}

class ProfessionalsDirectoryRoute {
  const ProfessionalsDirectoryRoute();
  String get location => '/professionals';
}

class ProfessionalDetailRoute {
  final String id;
  const ProfessionalDetailRoute({required this.id});
  static String get path => '/professional-detail/:id';
  String get location => '/professional-detail/$id';
}

class AppointmentsRoute {
  const AppointmentsRoute();
  String get location => '/appointments';
}

class AppointmentDetailRoute {
  final String id;
  const AppointmentDetailRoute({required this.id});
  String get location => '/appointments/$id';
  static String get path => '/appointments/:id';
}

class NotificationsRoute {
  const NotificationsRoute();
  String get location => '/notifications';
}

class ContentLibraryRoute {
  const ContentLibraryRoute();
  String get location => '/library';
}

class HelpCenterRoute {
  final bool urgent;
  final String? slug;
  const HelpCenterRoute({this.urgent = false, this.slug});
  static String get path => '/help';
  String get location {
    final q = <String>[
      if (urgent) 'urgent=true',
      if (slug != null && slug!.isNotEmpty) 'slug=${Uri.encodeComponent(slug!)}',
    ];
    return q.isEmpty ? '/help' : '/help?${q.join('&')}';
  }
}

class AssignedAssessmentsRoute {
  const AssignedAssessmentsRoute();
  static String get path => '/assigned';
  String get location => '/assigned';
}

class AssignedAssessmentRoute {
  final String id;
  const AssignedAssessmentRoute({required this.id});
  static String get path => '/assigned/:id';
  String get location => '/assigned/$id';
}

class ContentPlayerRoute {
  const ContentPlayerRoute();
  String get location => '/watch';
}

class ClientsRoute {
  const ClientsRoute();
  String get location => '/clients';
}

class ClientDetailRoute {
  final String id;
  const ClientDetailRoute({required this.id});
  String get location => '/clients/$id';
  static String get path => '/clients/:id';
}

class ClientAssessmentsRoute {
  final String id; // careRelationshipId
  const ClientAssessmentsRoute({required this.id});
  static String get path => '/client-assessments/:id';
  String get location => '/client-assessments/$id';
}

class AssessmentResultRoute {
  final String id; // assessmentId
  const AssessmentResultRoute({required this.id});
  static String get path => '/assessment-result/:id';
  String get location => '/assessment-result/$id';
}

class AssessmentHistoryRoute {
  final String slug;
  final String? title;
  const AssessmentHistoryRoute({required this.slug, this.title});
  static String get path => '/assessment-history/:slug';
  String get location {
    final t = title;
    return (t == null || t.isEmpty)
        ? '/assessment-history/$slug'
        : '/assessment-history/$slug?title=${Uri.encodeComponent(t)}';
  }
}
