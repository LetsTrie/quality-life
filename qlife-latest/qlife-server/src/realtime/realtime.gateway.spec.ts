import { UnauthorizedException } from '@nestjs/common';

import { RealtimeGateway } from './realtime.gateway';

function makeSocket(token?: string) {
  return {
    handshake: { auth: token ? { token } : {}, headers: {} },
    data: {} as Record<string, unknown>,
    join: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  };
}

describe('RealtimeGateway', () => {
  it('attaches the server to RealtimeService on init', () => {
    const realtime = { attachServer: jest.fn() };
    const gateway = new RealtimeGateway({} as never, realtime as never);
    const server = { to: jest.fn() };

    gateway.afterInit(server as never);

    expect(realtime.attachServer).toHaveBeenCalledWith(server);
  });

  it('disconnects a socket with an invalid token', async () => {
    const resolver = { resolve: jest.fn().mockRejectedValue(new UnauthorizedException()) };
    const gateway = new RealtimeGateway(resolver as never, { attachServer: jest.fn() } as never);
    const client = makeSocket('bad-token');

    await gateway.handleConnection(client as never);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(client.join).not.toHaveBeenCalled();
  });

  it('joins the account room for a valid ACTIVE account', async () => {
    const resolver = {
      resolve: jest.fn().mockResolvedValue({
        account: { id: 'acc-1', role: 'USER', status: 'ACTIVE' },
        identity: null,
      }),
    };
    const gateway = new RealtimeGateway(resolver as never, { attachServer: jest.fn() } as never);
    const client = makeSocket('good-token');

    await gateway.handleConnection(client as never);

    expect(client.join).toHaveBeenCalledWith('acc-1');
    expect(client.data.accountId).toBe('acc-1');
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('rejects a non-ACTIVE account', async () => {
    const resolver = {
      resolve: jest.fn().mockResolvedValue({
        account: { id: 'acc-1', role: 'USER', status: 'SUSPENDED' },
        identity: null,
      }),
    };
    const gateway = new RealtimeGateway(resolver as never, { attachServer: jest.fn() } as never);
    const client = makeSocket('good-token');

    await gateway.handleConnection(client as never);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(client.join).not.toHaveBeenCalled();
  });
});
