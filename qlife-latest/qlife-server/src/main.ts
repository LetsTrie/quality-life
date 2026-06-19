import 'reflect-metadata';

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

