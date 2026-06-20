import { RealtimeService } from './realtime.service';

describe('RealtimeService', () => {
  it('no-ops emitToAccount before a server is attached', () => {
    const service = new RealtimeService();
    expect(() =>
      service.emitToAccount('acc-1', 'notification', { hello: 'world' }),
    ).not.toThrow();
  });

  it('emits to the account room once a server is attached', () => {
    const service = new RealtimeService();
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    service.attachServer({ to } as never);

    service.emitToAccount('acc-1', 'notification', { id: 'n1' });

    expect(to).toHaveBeenCalledWith('acc-1');
    expect(emit).toHaveBeenCalledWith('notification', { id: 'n1' });
  });
});
