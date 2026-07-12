// On-device integration tests. Run with:
//   flutter test integration_test/ -d <device-id>
//
// These mirror the widget tests in test/router_redirect_test.dart but run on a
// real device or emulator so the full Flutter engine and platform channels are
// exercised. Auth is bypassed via provider overrides — no real WorkOS calls.

import 'package:integration_test/integration_test.dart';

// Re-use the same test bodies from the widget test suite.
import '../test/router_redirect_test.dart' as router_tests;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  // Run all router redirect tests on-device.
  router_tests.main();
}
