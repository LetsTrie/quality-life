import 'package:flutter/material.dart';

/// Typography for QLife.
///
/// The app serves a Bangla-speaking audience, so the type system uses
/// **Hind Siliguri** — a typeface designed for Bengali UI with high legibility
/// at small sizes and matching Latin glyphs, so mixed Bangla/English content
/// (status labels, profession types, etc.) stays visually consistent.
///
/// The font is **bundled** in `assets/fonts/` (registered in pubspec.yaml under
/// the `HindSiliguri` family), so it renders fully offline from first launch —
/// no runtime download. Sizes/weights are inherited from the Material 3
/// baseline; only the font family is swapped.
abstract final class AppTypography {
  /// The bundled font family name (must match the `family:` in pubspec.yaml).
  static const String fontFamily = 'HindSiliguri';

  /// Applies Hind Siliguri to an existing [TextTheme] (preserving sizes and
  /// colors), then firms up the weight of the prominent roles for a calmer,
  /// clinical feel.
  static TextTheme textTheme(TextTheme base) {
    final themed = base.apply(fontFamily: fontFamily);
    return themed.copyWith(
      headlineSmall: themed.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
      titleLarge: themed.titleLarge?.copyWith(fontWeight: FontWeight.w600),
      titleMedium: themed.titleMedium?.copyWith(fontWeight: FontWeight.w600),
    );
  }
}
