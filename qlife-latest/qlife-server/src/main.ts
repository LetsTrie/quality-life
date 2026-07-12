import 'reflect-metadata';

import * as http from 'node:http';
import * as https from 'node:https';

// firebase-admin / google-auth fetch OAuth2 access tokens through node-fetch,
// which uses Node's default *global* HTTP(S) agent. On Node 19+ that agent
// keeps sockets alive, and node-fetch 2.x reuses a pooled socket the server has
// already half-closed — aborting the googleapis.com/oauth2 response mid-body
// with "Premature close" (node-fetch#1735 / nodejs/node#47130). This surfaces
// as `app/invalid-credential` and breaks all FCM push sends. Forcing a fresh
// socket per request avoids the stale-socket reuse entirely. globalAgent is
// read-only, so mutate keep-alive on the existing instances in place.
const disableKeepAlive = (agent: http.Agent) => {
  const a = agent as unknown as {
    keepAlive: boolean;
    options?: { keepAlive?: boolean };
  };
  a.keepAlive = false;
  if (a.options) a.options.keepAlive = false;
};
disableKeepAlive(http.globalAgent);
disableKeepAlive(https.globalAgent);

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';

async function bootstrap() {
  // Note: `ConfigModule.forRoot()` loads `.env` during app bootstrap, so we
  // must read CORS_ORIGINS *after* creating the Nest app (otherwise it's empty).
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsEnv = (config.get<string>('CORS_ORIGINS') ?? '').trim();
  const allowAllOrigins = corsEnv === '*';
  const allowedOrigins = !corsEnv || allowAllOrigins
    ? []
    : corsEnv.split(',').map((o) => o.trim()).filter(Boolean);

  app.enableCors({
    // Local-dev escape hatch: CORS_ORIGINS=* allows any Origin (reflects request origin)
    origin: allowAllOrigins ? true : allowedOrigins.length ? allowedOrigins : false,
    credentials: true,
  });

  // Security headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();

