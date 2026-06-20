import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

/// WebSocket realtime layer. Imports AuthModule for the shared
/// [AuthContextResolver] (which already pulls in AccountsModule), so HTTP and
/// socket auth share one canonical implementation.
@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
