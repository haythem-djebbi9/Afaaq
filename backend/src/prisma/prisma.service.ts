import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const CONNECT_RETRIES = 5;
const CONNECT_RETRY_DELAY_MS = 3000;

function isLocalDatabase(connectionString: string | undefined): boolean {
  if (!connectionString) return false;
  try {
    const { hostname } = new URL(connectionString);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    const adapter = new PrismaPg({
      connectionString,
      // Local Docker/dev Postgres has no TLS listener — only enable SSL for remote hosts
      // (Neon and friends require it). rejectUnauthorized: false because Neon's pooled
      // connection sits behind a proxy that free-tier setups don't verify a CA chain for.
      ssl: isLocalDatabase(connectionString)
        ? undefined
        : { rejectUnauthorized: false },
      // Neon's free tier scales the compute to zero after inactivity — the first query
      // after a pause has to wait for it to spin back up, which can take several seconds
      // on top of Render's own cold start. A short default timeout would abort that wait
      // and crash the app on boot, so this is deliberately generous.
      connectionTimeoutMillis: 15000,
      max: 10,
    });
    super({ adapter });
  }

  async onModuleInit() {
    // Retries so a Neon cold-start (compute scaling back up from zero) doesn't take the
    // whole app down with it — the DB may simply not be ready yet on the first attempt.
    for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (attempt === CONNECT_RETRIES) throw error;
        this.logger.warn(
          `Database connection attempt ${attempt}/${CONNECT_RETRIES} failed, retrying in ${CONNECT_RETRY_DELAY_MS}ms…`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONNECT_RETRY_DELAY_MS),
        );
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
