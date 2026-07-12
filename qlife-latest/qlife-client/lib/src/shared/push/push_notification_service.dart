import 'dart:async';
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../firebase_options.dart';
import '../../app/router.dart';
import '../../features/notifications/data/notifications_repository.dart';

// Secure-storage key — MUST match HttpAuthRepository so the background isolate
// (which has no Riverpod) can read the session directly.
const _kAccessTokenKey = 'auth.access_token';

// The Android channel created in MainActivity.kt. The client supplies it when
// rendering local notifications (push is data-only; nothing is built server-side).
const _channelId = 'qlife_default';
const _channelName = 'QLife notifications';
const _channelDescription = 'Appointment and account updates';

/// True when a session token is present in secure storage. Used to gate display
/// in BOTH isolates — a logged-out device shows nothing, even if a stale server
/// token still delivers a message (offline-logout race).
Future<bool> _hasSession() async {
  const storage = FlutterSecureStorage();
  final access = await storage.read(key: _kAccessTokenKey);
  return access != null;
}

/// Renders a data-only FCM message as a visible local notification on the
/// `qlife_default` channel. Shared by foreground and background paths.
Future<void> _displayMessage(
  FlutterLocalNotificationsPlugin plugin,
  RemoteMessage message,
) async {
  final data = message.data;
  final title = data['title']?.toString() ?? 'QLife';
  final body = data['body']?.toString() ?? '';

  const androidDetails = AndroidNotificationDetails(
    _channelId,
    _channelName,
    channelDescription: _channelDescription,
    importance: Importance.high,
    priority: Priority.high,
  );

  // Stable id from the server notificationId so re-delivery doesn't stack.
  final notifId =
      (data['notificationId']?.toString().hashCode ?? message.hashCode) &
          0x7fffffff;

  await plugin.show(
    notifId,
    title,
    body,
    const NotificationDetails(android: androidDetails),
    payload: jsonEncode(data),
  );
}

/// Top-level background/killed-app FCM handler. Runs in its own isolate (no
/// Riverpod), so it reads tokens straight from secure storage and only displays
/// when a session exists; otherwise the message is dropped silently.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  if (!await _hasSession()) return; // logged out → show nothing
  final plugin = FlutterLocalNotificationsPlugin();
  await plugin.initialize(
    const InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    ),
  );
  await _displayMessage(plugin, message);
}

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService(ref);
});

/// Registers the device FCM token with the backend and renders incoming pushes.
///
/// Delivery is session-gated end to end: registration/display only happen while
/// [_active] (logged in), and [teardown] removes the server token row and
/// invalidates the OS token on logout so a logged-out device receives/shows
/// nothing.
class PushNotificationService {
  PushNotificationService(this._ref);

  final Ref _ref;
  // `late` so merely constructing the service (e.g. in tests) doesn't touch the
  // Firebase platform channel — the handle is resolved on first real use.
  late final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  bool _listenersAttached = false;

  /// True between [initialize] (login/app-start) and [teardown] (logout). Guards
  /// registration and display so nothing happens while logged out.
  bool _active = false;

  Future<void> initialize() async {
    _active = true;

    if (!_listenersAttached) {
      await _localNotifications.initialize(
        const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        ),
        onDidReceiveNotificationResponse: _onLocalNotificationTap,
      );

      FirebaseMessaging.onMessage.listen(_onForegroundMessage);
      FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpened);
      _messaging.onTokenRefresh.listen((token) {
        if (!_active) return; // don't re-register a logged-out device
        unawaited(_registerToken(token));
      });
      _listenersAttached = true;

      // App launched by tapping a local notification (terminated state).
      final launch = await _localNotifications.getNotificationAppLaunchDetails();
      final payload = launch?.notificationResponse?.payload;
      if (launch?.didNotificationLaunchApp == true && payload != null) {
        _routeFromPayload(payload);
      }
    }

    await _messaging.requestPermission();
    await syncToken();
  }

  Future<void> syncToken() async {
    if (!_active) return;
    final token = await _messaging.getToken();
    if (token != null) {
      await _registerToken(token);
    }
  }

  Future<void> _registerToken(String token) async {
    if (!_active) return;
    try {
      await _ref.read(notificationsRepositoryProvider).registerDeviceToken(token);
    } catch (e, st) {
      debugPrint('FCM token registration failed: $e\n$st');
    }
  }

  /// Logout teardown. Sets [_active] = false FIRST (closing the logout race),
  /// then best-effort removes the server token row and invalidates the OS token
  /// so even a failed DELETE is cleaned up by the server's stale-token pruning.
  ///
  /// [deregisterRemote] is false on the 401 path: the token is already invalid,
  /// so the server DELETE would just 401 — skip it and rely on local
  /// [deleteToken] + server-side stale pruning.
  Future<void> teardown({bool deregisterRemote = true}) async {
    _active = false;

    String? currentToken;
    try {
      currentToken = await _messaging.getToken();
    } catch (_) {}

    if (deregisterRemote && currentToken != null) {
      try {
        await _ref
            .read(notificationsRepositoryProvider)
            .unregisterDeviceToken(currentToken);
      } catch (e) {
        debugPrint('FCM token deregistration failed: $e');
      }
    }

    try {
      await _messaging.deleteToken();
    } catch (e) {
      debugPrint('FCM deleteToken failed: $e');
    }
  }

  Future<void> _onForegroundMessage(RemoteMessage message) async {
    // Display only while logged in (and a session token actually exists).
    if (!_active) return;
    if (!await _hasSession()) return;
    await _displayMessage(_localNotifications, message);
  }

  void _onMessageOpened(RemoteMessage message) {
    _routeFromData(message.data);
  }

  void _onLocalNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) _routeFromPayload(payload);
  }

  void _routeFromPayload(String payload) {
    try {
      final data = (jsonDecode(payload) as Map).cast<String, dynamic>();
      _routeFromData(data);
    } catch (_) {}
  }

  /// Routes a notification tap to the most specific screen its data describes.
  void _routeFromData(Map<String, dynamic> data) {
    _ref.read(appRouterProvider).go(notificationRouteLocation(
          type: data['type']?.toString() ?? '',
          appointmentId: data['appointmentId']?.toString(),
          assessmentId: data['assessmentId']?.toString(),
        ));
  }
}
