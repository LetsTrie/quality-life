import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Calming gradients and soft elevation used across QLife.
///
/// Mental-wellbeing design leans on gentle, low-contrast gradients and soft,
/// diffuse shadows rather than hard edges and flat fills. Centralizing them
/// here keeps that mood consistent — never hand-roll a [LinearGradient] or
/// [BoxShadow] in a widget.
abstract final class AppGradients {
  /// Primary brand gradient — healing teal flowing into serene blue.
  /// Used for hero headers and the sign-in / welcome surfaces.
  static const LinearGradient brand = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primary, Color(0xFF3C9AA6), AppColors.secondary],
  );

  /// A softer wash of the brand gradient for large calm backgrounds.
  static const LinearGradient brandSoft = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFEAF4F1), Color(0xFFF6F8F7)],
  );

  /// A softer wash tinted toward the secondary blue — distinguishes the
  /// professional auth surfaces from the user (teal) ones.
  static const LinearGradient professionalSoft = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFEAF1F9), Color(0xFFF6F8F7)],
  );

  /// Warm lavender → blue, for the "resources" / reflective surfaces.
  static const LinearGradient calm = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.tertiary, AppColors.secondary],
  );

  /// Returns a header gradient tuned for the current brightness.
  static LinearGradient header(Brightness brightness) {
    if (brightness == Brightness.dark) {
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF1F6E62), Color(0xFF2A5E78)],
      );
    }
    return brand;
  }
}

/// Soft, diffuse shadows — gentler than Material's default elevation.
abstract final class AppShadows {
  static List<BoxShadow> get card => const [
        BoxShadow(
          color: Color(0x14000000),
          blurRadius: 18,
          offset: Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get soft => const [
        BoxShadow(
          color: Color(0x0F000000),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ];
}
