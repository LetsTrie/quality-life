import 'package:flutter/material.dart';

/// Central brand palette for QLife.
///
/// Colors follow the conventions of clinical psychology / mental-health design:
/// a calming healing teal-green as the primary, a serene soft blue as the
/// secondary, warm neutral surfaces, and gentle, low-arousal semantic colors.
/// These tones are widely used in therapy and counseling contexts because they
/// communicate calm, trust, balance, and safety rather than urgency.
///
/// Do not hardcode colors in widgets. Reference them through
/// `Theme.of(context).colorScheme` (preferred) or [AppSemanticColors] for the
/// few roles Material's [ColorScheme] does not cover.
abstract final class AppColors {
  // --- Primary: healing teal-green (calm, balance, growth) ---
  static const Color primary = Color(0xFF2A8C7D);
  static const Color primaryDark = Color(0xFF1F6E62);
  static const Color primaryLight = Color(0xFF5FB3A4);

  // --- Secondary: serene soft blue (trust, serenity, clarity) ---
  static const Color secondary = Color(0xFF4F86C6);
  static const Color secondaryLight = Color(0xFF8FB4DE);

  // --- Tertiary: gentle lavender (reflection, warmth) ---
  static const Color tertiary = Color(0xFF8C7BB8);

  // --- Neutral surfaces (warm off-white, easy on the eyes) ---
  static const Color background = Color(0xFFF6F8F7);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFE6EDEB);

  // --- Text / ink ---
  static const Color ink = Color(0xFF1B2A27);
  static const Color inkMuted = Color(0xFF5A6B67);

  // --- Semantic (soft, non-alarming) ---
  static const Color success = Color(0xFF3E9D6E);
  static const Color warning = Color(0xFFE0A458);
  static const Color error = Color(0xFFC5604E);
  static const Color rating = Color(0xFFE9B949); // calm gold for star ratings

  // --- Dark theme surfaces ---
  static const Color darkBackground = Color(0xFF101716);
  static const Color darkSurface = Color(0xFF18211F);
}

/// Semantic colors not covered by Material's [ColorScheme]
/// (e.g. success, warning, content ratings). Exposed as a [ThemeExtension] so
/// they adapt to light/dark and are still resolved centrally via the theme.
@immutable
class AppSemanticColors extends ThemeExtension<AppSemanticColors> {
  const AppSemanticColors({
    required this.success,
    required this.warning,
    required this.rating,
  });

  final Color success;
  final Color warning;
  final Color rating;

  static const light = AppSemanticColors(
    success: AppColors.success,
    warning: AppColors.warning,
    rating: AppColors.rating,
  );

  static const dark = AppSemanticColors(
    success: Color(0xFF5CC08C),
    warning: Color(0xFFEBB877),
    rating: Color(0xFFF1C75E),
  );

  /// Convenience accessor: `AppSemanticColors.of(context).rating`.
  static AppSemanticColors of(BuildContext context) =>
      Theme.of(context).extension<AppSemanticColors>() ?? light;

  @override
  AppSemanticColors copyWith({Color? success, Color? warning, Color? rating}) {
    return AppSemanticColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      rating: rating ?? this.rating,
    );
  }

  @override
  AppSemanticColors lerp(ThemeExtension<AppSemanticColors>? other, double t) {
    if (other is! AppSemanticColors) return this;
    return AppSemanticColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      rating: Color.lerp(rating, other.rating, t)!,
    );
  }
}
