import { PrismaClient, Prisma } from "@prisma/client";

// Serverless (Vercel) roda muitas instâncias concorrentes; sem isso cada uma
// abre seu próprio pool de conexões e estoura o max_connections do Postgres,
// causando "Server has closed the connection" (Prisma P1017).
function buildDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
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

// P1017: "Server has closed the connection" — acontece quando a conexão fica
// idle numa lambda "quente" e o Postgres/proxy derruba o socket. Um retry
// único (reconectando) resolve sem precisar propagar erro pro usuário.
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const isClosedConnection =
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P1017";
    if (!isClosedConnection) throw e;

    await prisma.$disconnect();
    return fn();
  }
}
