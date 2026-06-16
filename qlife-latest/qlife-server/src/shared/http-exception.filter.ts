import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

@Catch()
export class HttpExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const fallbackBody: ErrorBody = {
      error: {
        code: 'INTERNAL',
        message: 'Internal server error',
      },
    };

    if (!(exception instanceof HttpException)) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(fallbackBody);
      return;
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();

    const body: ErrorBody = {
      error: {
        code: status >= 500 ? 'INTERNAL' : 'REQUEST',
        message: exception.message,
        details: payload,
      },
    };

    response.status(status).json({
      ...body,
      meta: {
        path: request.path,
        method: request.method,
      },
    });
  }
}

