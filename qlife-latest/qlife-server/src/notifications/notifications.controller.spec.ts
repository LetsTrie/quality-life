import { Test } from '@nestjs/testing';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  it('unread-count returns number', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            unreadCount: async () => 7,
            list: async () => ({ numberOfNotifications: 0, notifications: [] }),
            markSeen: async () => {},
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(NotificationsController);

    const req = { auth: { account: { id: 'acc-1' } } } as any;
    const res = await controller.unreadCount(req);
    expect(res).toEqual({ data: { unreadNotificationCount: 7 } });
  });
});

