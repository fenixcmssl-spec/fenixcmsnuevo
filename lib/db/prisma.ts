import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __fenixPrisma: PrismaClient | undefined;
}

export class DatabaseUnavailableError extends Error {
  public readonly code = 'DATABASE_UNAVAILABLE';
  constructor(message = 'El servicio de base de datos PostgreSQL no está disponible.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = global.__fenixPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__fenixPrisma = prisma;
}

/**
 * Checks if PostgreSQL connection is alive.
 */
export async function checkDatabaseHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return {
      isHealthy: false,
      error: 'DATABASE_URL no configurada en el entorno.',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { isHealthy: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { isHealthy: false, error: message };
  }
}

/**
 * Ensures database is connected before executing an operation.
 * Throws DatabaseUnavailableError if not connected.
 */
export async function assertDatabaseAvailable(): Promise<void> {
  const health = await checkDatabaseHealth();
  if (!health.isHealthy) {
    throw new DatabaseUnavailableError(health.error);
  }
}
