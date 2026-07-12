import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../app/tab_refresh.dart';
import '../../features/auth/data/auth_repository.dart';

final realtimeServiceProvider = Provider<RealtimeService>((ref) {
  return RealtimeService(ref);
});

/// Maintains an authenticated Socket.io connection to the backend and reacts to
/// server-pushed events (currently `notification`) by refreshing live UI. The
/// connection is session-driven: [connect] on login/init, [disconnect] on
/// logout (before tokens are cleared). Each (re)connect reads the freshest token
/// from secure storage, so token refresh is handled by reconnecting.
class RealtimeService {
  RealtimeService(this._ref);

  final Ref _ref;
  io.Socket? _socket;

  static const _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );

  Future<void> connect() async {
    if (_socket != null) return; // already connected

    final tokens = await _ref.read(authRepositoryProvider).loadTokens();
    final token = tokens?.accessToken;
    if (token == null) return; // not authenticated → nothing to connect

    final socket = io.io(
      _baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .enableReconnection()
          .setAuth({'token': token})
          .build(),
    );

    socket.on('notification', (_) => _onServerEvent());
    socket.onDisconnect((reason) {
      // The server disconnects sockets at token expiry. If we're still
      // authenticated, drop this socket and reconnect with a fresh token.
      if (reason == 'io server disconnect') {
        unawaited(_reconnectWithFreshToken());
      }
    });

    _socket = socket;
    socket.connect();
  }

  void _onServerEvent() {
    // Bump the shared refresh signal so unread badges / lists refetch. The
    // home + pro unread providers and tab data providers all watch this.
    final notifier = _ref.read(tabRefreshProvider.notifier);
    notifier.state = notifier.state + 1;
  }

  Future<void> _reconnectWithFreshToken() async {
    try {
      await disconnect();
      // Only reconnect if a session still exists (avoids loops after logout).
      final tokens = await _ref.read(authRepositoryProvider).loadTokens();
      if (tokens?.accessToken == null) return;
      await connect();
    } catch (e) {
      debugPrint('Socket reconnect failed: $e');
    }
  }

  Future<void> disconnect() async {
    final socket = _socket;
    _socket = null;
    if (socket == null) return;
    try {
      socket.dispose();
    } catch (e) {
      debugPrint('Socket dispose failed: $e');
    }
  }
}
