import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// The bundled calming vector illustrations used across QLife.
///
/// Centralized so screens reference a named [AppArt] value instead of a raw
/// asset path string.
enum AppArt {
  brandMark('assets/illustrations/brand_mark.svg'),
  welcome('assets/illustrations/welcome.svg'),
  meditation('assets/illustrations/meditation.svg'),
  empty('assets/illustrations/empty.svg');

  const AppArt(this.asset);
  final String asset;
}

/// Renders one of the bundled [AppArt] SVGs at a given size.
class AppIllustration extends StatelessWidget {
  const AppIllustration(this.art, {super.key, this.width, this.height});

  final AppArt art;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      art.asset,
      width: width,
      height: height,
      fit: BoxFit.contain,
    );
  }
}
