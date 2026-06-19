import 'package:flutter/material.dart';

/// Typography for QLife.
///
/// The app serves a Bangla-speaking audience, so the type system uses
/// **Noto Sans Bengali** — Google's flagship Bengali typeface, chosen for its
/// clean, modern letterforms, excellent on-screen legibility at small sizes,
/// and complete Latin glyph coverage so mixed Bangla/English content (scale
/// codes like GHQ-12, status labels, etc.) stays visually consistent.
///
/// The font is **bundled** as a single variable TTF in `assets/fonts/`
/// (registered in pubspec.yaml under the `NotoSansBengali` family), so it
/// renders fully offline from first launch — no runtime download. Sizes are
/// inherited from the Material 3 baseline; only the family is swapped and the
/// prominent roles are firmed up.
abstract final class AppTypography {
  /// The bundled font family name (must match the `family:` in pubspec.yaml).
  static const String fontFamily = 'NotoSansBengali';

  /// Applies Noto Sans Bengali to an existing [TextTheme] (preserving sizes and
  /// colors), firms up the weight of the prominent roles, and gives body text a
  /// little extra line height — Bengali conjuncts and matras read more
  /// comfortably with slightly looser leading.
  static TextTheme textTheme(TextTheme base) {
    final themed = base.apply(fontFamily: fontFamily);
    return themed.copyWith(
      headlineMedium:
          themed.headlineMedium?.copyWith(fontWeight: FontWeight.w700, height: 1.25),
      headlineSmall:
          themed.headlineSmall?.copyWith(fontWeight: FontWeight.w700, height: 1.25),
      titleLarge: themed.titleLarge?.copyWith(fontWeight: FontWeight.w600, height: 1.3),
      titleMedium: themed.titleMedium?.copyWith(fontWeight: FontWeight.w600, height: 1.3),
      titleSmall: themed.titleSmall?.copyWith(fontWeight: FontWeight.w600, height: 1.35),
      bodyLarge: themed.bodyLarge?.copyWith(height: 1.45),
      bodyMedium: themed.bodyMedium?.copyWith(height: 1.45),
      bodySmall: themed.bodySmall?.copyWith(height: 1.4),
    );
  }
}
