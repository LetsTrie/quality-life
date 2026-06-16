import 'package:flutter/widgets.dart';

/// Spacing scale for QLife. Use these instead of raw numbers so padding and
/// gaps stay consistent across every screen.
///
/// A single 4pt-based scale: xs(4) sm(8) md(12) lg(16) xl(24) xxl(32).
/// [page] is the standard screen edge padding.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;

  /// Standard screen edge inset.
  static const double page = lg;
}

/// Corner-radius scale, matching the component themes in `app_theme.dart`.
abstract final class AppRadius {
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
}

/// Vertical spacing between widgets in a [Column] or [ListView].
///
/// Prefer this over ad-hoc `SizedBox(height: ...)` so spacing reads from the
/// shared [AppSpacing] scale. For horizontal gaps in a [Row], use [Gap.horizontal].
class Gap extends StatelessWidget {
  const Gap(this.size, {super.key}) : _horizontal = false;

  /// A horizontal gap, for spacing between children of a [Row].
  const Gap.horizontal(this.size, {super.key}) : _horizontal = true;

  final double size;
  final bool _horizontal;

  @override
  Widget build(BuildContext context) =>
      _horizontal ? SizedBox(width: size) : SizedBox(height: size);
}
