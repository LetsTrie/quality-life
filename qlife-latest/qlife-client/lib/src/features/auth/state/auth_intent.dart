import 'package:flutter_riverpod/flutter_riverpod.dart';

/// True when the user picked the "professional" path but their account is still
/// a plain USER (every new account starts as USER). The router reads this to
/// send them into the "become a professional" registration flow instead of the
/// user home. Cleared when professional registration completes or on sign-out.
final pendingProfessionalRegistrationProvider = StateProvider<bool>((_) => false);
