import { PrismaClient } from "@prisma/client";

// Serverless (Vercel) roda muitas instâncias concorrentes; sem isso cada uma
// abre seu próprio pool de conexões e estoura o max_connections do Postgres,
// causando "Server has closed the connection".
function buildDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "15");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: buildDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// "Server has closed the connection" acontece quando a conexão fica idle numa
// lambda "quente" e o proxy do Postgres derruba o socket. Esse erro chega como
// PrismaClientUnknownRequestError (sem `.code`), então detectamos pelo texto
// da mensagem em vez de um código de erro.
function isClosedConnectionError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return /server has closed the connection|econnreset|connection.*(closed|terminated)/i.test(
    message
  );
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (retries <= 0 || !isClosedConnectionError(e)) throw e;

    await prisma.$disconnect();
    return withRetry(fn, retries - 1);
  }
}
