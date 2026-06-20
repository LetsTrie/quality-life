import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

/// Emits server→client realtime events into per-account rooms. The Socket.io
/// server instance is injected by [RealtimeGateway.afterInit] so other
/// injectable services (e.g. NotificationsService) can emit without depending
/// on the gateway directly.
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  attachServer(server: Server) {
    this.server = server;
  }

  /// Emits to the room keyed by [accountId]. Only authenticated sockets join
  /// their own account room (see the gateway), so logged-out devices get
  /// nothing. No-op before the gateway has attached the server, so it can never
  /// crash notification creation.
  emitToAccount(accountId: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.debug(`emitToAccount(${event}) skipped — server not attached yet`);
      return;
    }
    this.server.to(accountId).emit(event, payload);
  }
}
