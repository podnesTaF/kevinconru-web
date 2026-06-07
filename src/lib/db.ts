import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Prisma 7 runs on a driver adapter. PrismaNeon takes a neon Pool config
// (`{ connectionString }`) — the pooled DATABASE_URL for runtime queries.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

// ── Transient-failure retry ─────────────────────────────────────────────────
// Neon's compute auto-suspends when idle and Vercel freezes lambdas between
// invocations, so the first query after a quiet spell can hit a waking
// database or a dead pooled socket. Those one-off connection errors are
// retried (reads only — a write could have committed before the connection
// dropped, so retrying it risks double-applying).

const READ_OPS = new Set([
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

// Connection-class failures only — never query/constraint errors.
const TRANSIENT = [
  /connection .*(terminated|closed|reset|refused)/i,
  /timed? ?out/i,
  /ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT/,
  /fetch failed/i,
  /socket/i,
  /\bP1001\b|\bP1002\b|\bP2024\b/,
];

function isTransient(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const text = `${(e as { code?: string }).code ?? ""} ${e.message}`;
  return TRANSIENT.some((re) => re.test(text));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Backoff covers Neon's wake-up (~1–3s): attempt, +1s, +2s.
const RETRY_DELAYS_MS = [1000, 2000];

function makeClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations: async ({ operation, query, args }) => {
        if (!READ_OPS.has(operation)) return query(args);
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
          try {
            return await query(args);
          } catch (e) {
            if (!isTransient(e)) throw e;
            lastError = e;
          }
        }
        throw lastError;
      },
    },
  });
}

type DbClient = ReturnType<typeof makeClient>;

const globalForPrisma = globalThis as unknown as { prisma?: DbClient };

export const db = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
