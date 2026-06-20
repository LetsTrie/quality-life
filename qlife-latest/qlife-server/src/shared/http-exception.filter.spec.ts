import {
  BadRequestException,
  InternalServerErrorException,
  type ArgumentsHost,
} from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

// Captures whatever the filter writes to the response.
function host(): { host: ArgumentsHost; status: jest.Mock; json: jest.Mock } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const argHost = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ path: '/v1/things', method: 'POST' }),
    }),
  } as unknown as ArgumentsHost;
  return { host: argHost, status, json };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('maps a 4xx HttpException to a REQUEST error envelope with meta', () => {
    const { host: h, status, json } = host();
    filter.catch(new BadRequestException('Invalid payload'), h);

    expect(status).toHaveBeenCalledWith(400);
    const body = json.mock.calls[0][0];
    expect(body.error.code).toBe('REQUEST');
    expect(body.error.message).toBe('Invalid payload');
    expect(body.meta).toEqual({ path: '/v1/things', method: 'POST' });
  });

  it('maps a 5xx HttpException to an INTERNAL code', () => {
    const { host: h, status, json } = host();
    filter.catch(new InternalServerErrorException('boom'), h);

    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].error.code).toBe('INTERNAL');
  });

  it('maps an unknown (non-HttpException) error to a 500 INTERNAL fallback', () => {
    const { host: h, status, json } = host();
    filter.catch(new Error('unexpected'), h);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body).toEqual({ error: { code: 'INTERNAL', message: 'Internal server error' } });
    // The fallback must not leak internal details or request meta.
    expect(body.meta).toBeUndefined();
  });

  it('includes exception details in the error envelope for HttpExceptions', () => {
    const { host: h, json } = host();
    filter.catch(new BadRequestException({ message: 'bad', error: 'Bad Request', statusCode: 400 }), h);
    const body = json.mock.calls[0][0];
    expect(body.error.details).toBeDefined();
    expect(body.meta).toEqual({ path: '/v1/things', method: 'POST' });
  });
});
