import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { AuthContextResolver } from '../auth/auth-context-resolver';
import { RealtimeService } from './realtime.service';

/// Mirrors main.ts CORS parsing so browser clients are governed by the same
/// CORS_ORIGINS allow-list. Mobile socket.io clients send no Origin, so this is
/// only relevant to web clients. Evaluated at decoration time (before
/// ConfigModule loads .env), so it reads OS env vars; falls back to reflecting
/// any origin when unset.
function socketCorsOrigin(): true | string[] {
  const corsEnv = (process.env.CORS_ORIGINS ?? '').trim();
  if (!corsEnv || corsEnv === '*') return true;
  return corsEnv.split(',').map((o) => o.trim()).filter(Boolean);
}

@WebSocketGateway({ cors: { origin: socketCorsOrigin(), credentials: true } })
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly resolver: AuthContextResolver,
    private readonly realtime: RealtimeService,
  ) {}

  afterInit(server: Server) {
    // Hand the Socket.io server to the injectable service so other services can
    // emit outside the gateway.
    this.realtime.attachServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        this.bearerFromHeader(client.handshake.headers?.authorization);

      const ctx = await this.resolver.resolve(token);

      // Only ACTIVE accounts may receive realtime events.
      if (ctx.account.status !== 'ACTIVE') {
        client.disconnect(true);
        return;
      }

      client.data.accountId = ctx.account.id;
      client.join(ctx.account.id);

      // Disconnect at/near token expiry; the client reconnects with a fresh
      // token while still authenticated.
      if (ctx.expiresAt) {
        const msUntilExpiry = ctx.expiresAt * 1000 - Date.now();
        if (msUntilExpiry <= 0) {
          client.disconnect(true);
          return;
        }
        const timer = setTimeout(() => client.disconnect(true), msUntilExpiry);
        client.on('disconnect', () => clearTimeout(timer));
      }
    } catch {
      // Invalid / missing token → reject the socket.
      client.disconnect(true);
    }
  }

  private bearerFromHeader(header?: string): string | undefined {
    if (!header?.startsWith('Bearer ')) return undefined;
    return header.slice('Bearer '.length).trim();
  }
}
