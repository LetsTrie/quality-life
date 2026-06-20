import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { UnregisterDeviceTokenDto } from './dto/unregister-device-token.dto';
import { NotificationsService } from './notifications.service';

@Controller('/v1/notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('/unread-count')
  async unreadCount(@Req() req: Request) {
    const recipientAccountId = req.auth!.account.id;
    const unreadNotificationCount = await this.notifications.unreadCount(recipientAccountId);
    return { data: { unreadNotificationCount } };
  }

  @Get()
  async list(@Req() req: Request, @Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    const recipientAccountId = req.auth!.account.id;
    const result = await this.notifications.list(recipientAccountId, page ?? 1);
    return { data: result };
  }

  @Patch('/:id/seen')
  async seen(@Req() req: Request, @Param('id') id: string) {
    const recipientAccountId = req.auth!.account.id;
    await this.notifications.markSeen(id, recipientAccountId);
    return { data: {} };
  }

  @Put('/device-token')
  async registerDeviceToken(@Req() req: Request, @Body() body: RegisterDeviceTokenDto) {
    await this.notifications.upsertDeviceToken(req.auth!.account.id, body.token, body.platform);
    return { data: {} };
  }

  @Delete('/device-token')
  async unregisterDeviceToken(@Req() req: Request, @Body() body: UnregisterDeviceTokenDto) {
    await this.notifications.removeDeviceToken(req.auth!.account.id, body.token);
    return { data: {} };
  }
}
