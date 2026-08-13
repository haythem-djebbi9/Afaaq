import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

function logLevelsFromEnv(): LogLevel[] {
  const configured = (process.env.LOG_LEVEL ?? 'log').toLowerCase() as LogLevel;
  const index = LOG_LEVELS.indexOf(configured);
  return LOG_LEVELS.slice(0, index === -1 ? LOG_LEVELS.indexOf('log') + 1 : index + 1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logLevelsFromEnv(),
  });

  app.use(helmet());

  const corsOrigin = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({ origin: corsOrigin, credentials: true });
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
