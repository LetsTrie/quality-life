import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/sign_in_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/splash/presentation/splash_screen.dart';
import '../features/auth/state/auth_state.dart';
import '../features/instruments/presentation/instrument_detail_screen.dart';
import '../features/instruments/presentation/instruments_screen.dart';
import '../features/appointments/presentation/appointments_screen.dart';
import '../features/appointments/presentation/appointment_detail_screen.dart';
import '../features/clients/presentation/clients_screen.dart';
import '../features/clients/presentation/client_detail_screen.dart';
import '../features/content/presentation/content_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';
import '../features/professionals/presentation/professionals_screen.dart';
import '../features/professional/presentation/professional_home_screen.dart';
import '../features/professional/presentation/professional_onboarding_screen.dart';
import '../features/professional/presentation/professional_register_screen.dart';
import '../features/users/presentation/user_profile_completion_screen.dart';
import '../shared/api/api_client.dart';

class AppSession {
  final String role; // USER | PROFESSIONAL | ADMIN
  final bool? isUserProfileComplete;
  final bool? isProfessionalOnboardingComplete;

  const AppSession({
    required this.role,
    this.isUserProfileComplete,
    this.isProfessionalOnboardingComplete,
  });
}

final appSessionProvider = FutureProvider<AppSession?>((ref) async {
  final auth = ref.watch(authStateProvider);
  if (!auth.isAuthenticated) return null;

  final dio = ref.watch(apiClientProvider);
  final meRes = await dio.get('/v1/me');
  final account = (meRes.data as Map<String, dynamic>)['account'] as Map<String, dynamic>?;
  final role = account?['role']?.toString() ?? '';

  if (role == 'USER') {
    final userRes = await dio.get('/v1/users/me');
    final data = (userRes.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final complete = (data['isProfileComplete'] as bool?) ?? false;
    return AppSession(role: role, isUserProfileComplete: complete);
  }

  if (role == 'PROFESSIONAL') {
    final proRes = await dio.get('/v1/professionals/me');
    final data = (proRes.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final professional = data['professional'] as Map<String, dynamic>;
    final complete = (professional['isOnboardingComplete'] as bool?) ?? false;
    return AppSession(role: role, isProfessionalOnboardingComplete: complete);
  }

  return AppSession(role: role);
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);
  final session = ref.watch(appSessionProvider);

  return GoRouter(
    initialLocation: const SplashRoute().location,
    routes: [
      GoRoute(
        path: const SplashRoute().location,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: const SignInRoute().location,
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: const ProfileRoute().location,
        builder: (context, state) => const UserProfileCompletionScreen(),
      ),
      GoRoute(
        path: const HomeRoute().location,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: const ProfessionalDashboardRoute().location,
        builder: (context, state) => const ProfessionalHomeScreen(),
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
        path: const InstrumentsRoute().location,
        builder: (context, state) => const InstrumentsScreen(),
      ),
      GoRoute(
        path: InstrumentDetailRoute.path,
        builder: (context, state) => InstrumentDetailScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
      GoRoute(
        path: const ProfessionalsDirectoryRoute().location,
        builder: (context, state) => const ProfessionalsScreen(),
      ),
      GoRoute(
        path: const AppointmentsRoute().location,
        builder: (context, state) => const AppointmentsScreen(),
      ),
      GoRoute(
        path: AppointmentDetailRoute.path,
        builder: (context, state) => AppointmentDetailScreen(
          appointmentId: state.pathParameters['id']!,
        ),
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
        path: const ClientsRoute().location,
        builder: (context, state) => const ClientsScreen(),
      ),
      GoRoute(
        path: ClientDetailRoute.path,
        builder: (context, state) => ClientDetailScreen(
          careRelationshipId: state.pathParameters['id']!,
        ),
      ),
    ],
    redirect: (context, state) {
      final isSplash = state.matchedLocation == const SplashRoute().location;
      final isSignIn = state.matchedLocation == const SignInRoute().location;

      if (!auth.isInitialized) return isSplash ? null : const SplashRoute().location;
      if (isSplash) return null;

      if (!auth.isAuthenticated) return isSignIn ? null : const SignInRoute().location;
      if (isSignIn) return const SplashRoute().location;

      // While session is loading, keep user on splash to avoid flicker.
      if (session.isLoading) return const SplashRoute().location;
      final s = session.valueOrNull;
      if (s == null) return const SignInRoute().location;

      if (s.role == 'USER') {
        if (s.isUserProfileComplete == false &&
            state.matchedLocation != const ProfileRoute().location) {
          return const ProfileRoute().location;
        }
        if (state.matchedLocation == const ProfessionalDashboardRoute().location ||
            state.matchedLocation == const ProfessionalOnboardingRoute().location ||
            state.matchedLocation == const ClientsRoute().location) {
          return const HomeRoute().location;
        }
        return null;
      }

      if (s.role == 'PROFESSIONAL') {
        if (s.isProfessionalOnboardingComplete == false &&
            state.matchedLocation != const ProfessionalOnboardingRoute().location) {
          return const ProfessionalOnboardingRoute().location;
        }
        if (state.matchedLocation == const HomeRoute().location ||
            state.matchedLocation == const ProfileRoute().location ||
            state.matchedLocation == const ProfessionalsDirectoryRoute().location) {
          return const ProfessionalDashboardRoute().location;
        }
        return null;
      }

      // ADMIN (or unknown): land on home for now.
      return state.matchedLocation == const HomeRoute().location ? null : const HomeRoute().location;
    },
  );
});

class SplashRoute {
  const SplashRoute();
  String get location => '/';
}

class SignInRoute {
  const SignInRoute();
  String get location => '/sign-in';
}

class HomeRoute {
  const HomeRoute();
  String get location => '/home';
}

class ProfileRoute {
  const ProfileRoute();
  String get location => '/profile';
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
