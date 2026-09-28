import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy-initialized Drizzle client.
 *
 * Vercel builds (and local typechecks) may evaluate route modules before env
 * vars are present. Throwing at import time breaks `next build` during
 * "collecting page data", so instead we create a Proxy that only constructs
 * the real client on first actual query.
 */
const config = {
  url: process.env.DATABASE_URL,
};

let _client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
  if (!_client) {
    if (!config.url) {
      throw new Error(
        "DATABASE_URL is not set. See SETUP.md for instructions.",
      );
    }
    // Pooled connection — required for Neon/Vercel serverless environments.
    _client = postgres(config.url, { prepare: false });
  }
  return _client;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

export type Database = ReturnType<typeof getDb>;

// Proxy so `import { db } from "@/db"` stays ergonomic but construction
// (and the env-var check) only happens on first real use.
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
