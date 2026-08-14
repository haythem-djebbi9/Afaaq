import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

function logLevelsFromEnv(): LogLevel[] {
  const configured = (process.env.LOG_LEVEL ?? 'log').toLowerCase() as LogLevel;
  const index = LOG_LEVELS.indexOf(configured);
  return LOG_LEVELS.slice(
    0,
    index === -1 ? LOG_LEVELS.indexOf('log') + 1 : index + 1,
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logLevelsFromEnv(),
    // Keeps the raw request body available on req.rawBody, needed to verify the
    // Stripe webhook signature (backend/src/payments/payments.controller.ts).
    rawBody: true,
  });

  app.use(helmet());

  const allowedOrigins = (
    process.env.FRONTEND_URL ?? 'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  // Vercel preview deployments get a unique *.vercel.app subdomain per build/branch, so a
  // fixed list can never enumerate them — always trust that pattern in addition to whatever
  // exact origins (production Vercel URL, afaaq.de) are configured in FRONTEND_URL.
  const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // non-browser clients (curl, health checks)
      if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`AFAAQ Connect API listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
