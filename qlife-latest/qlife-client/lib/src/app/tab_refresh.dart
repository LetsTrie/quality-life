import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Bumped every time a bottom-navigation tab is tapped. Tab data providers
/// `ref.watch` this so each tap refetches from the backend instead of showing
/// cached/stale data. Cheap at this app's scale (a handful of active users).
final tabRefreshProvider = StateProvider<int>((ref) => 0);
