import { Redis } from "@upstash/redis";

// Tiny counter store shared by rate limiting and usage stats.
// Uses Upstash Redis when configured (Vercel Marketplace sets KV_REST_API_*),
// otherwise an in-memory fallback that only lives as long as one server
// instance — fine for local dev, not a real limit in production.
// The Redis database may be shared with other projects, so every key is
// namespaced with "poocheck:".

interface CounterStore {
  incr(key: string, ttlSeconds: number): Promise<number>;
  hincr(key: string, field: string, ttlSeconds: number, by?: number): Promise<void>;
  hgetall(key: string): Promise<Record<string, number>>;
}

function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // Fail fast: a slow or unreachable Redis must not hold up an analysis.
  return new Redis({
    url,
    token,
    retry: { retries: 1, backoff: () => 100 },
    signal: () => AbortSignal.timeout(1500),
  });
}

const KEY_PREFIX = "poocheck:";

class RedisStore implements CounterStore {
  constructor(private redis: Redis) {}

  async incr(key: string, ttlSeconds: number) {
    const k = KEY_PREFIX + key;
    const [count] = await this.redis.pipeline().incr(k).expire(k, ttlSeconds).exec<[number, number]>();
    return count;
  }

  async hincr(key: string, field: string, ttlSeconds: number, by = 1) {
    const k = KEY_PREFIX + key;
    await this.redis.pipeline().hincrby(k, field, by).expire(k, ttlSeconds).exec();
  }

  async hgetall(key: string) {
    const raw = (await this.redis.hgetall<Record<string, number | string>>(KEY_PREFIX + key)) ?? {};
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
  }
}

class MemoryStore implements CounterStore {
  private counters = new Map<string, { value: number; expiresAt: number }>();
  private hashes = new Map<string, { fields: Record<string, number>; expiresAt: number }>();

  async incr(key: string, ttlSeconds: number) {
    const now = Date.now();
    const cur = this.counters.get(key);
    const value = cur && cur.expiresAt > now ? cur.value + 1 : 1;
    this.counters.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
    return value;
  }

  async hincr(key: string, field: string, ttlSeconds: number, by = 1) {
    const now = Date.now();
    const cur = this.hashes.get(key);
    const fields = cur && cur.expiresAt > now ? cur.fields : {};
    fields[field] = (fields[field] ?? 0) + by;
    this.hashes.set(key, { fields, expiresAt: now + ttlSeconds * 1000 });
  }

  async hgetall(key: string) {
    const cur = this.hashes.get(key);
    return cur && cur.expiresAt > Date.now() ? { ...cur.fields } : {};
  }
}

// If Redis errors (outage, free quota used up), fall back to memory for writes
// so analyses keep working; limits then only apply per server instance.
// Reads (the stats endpoint) still surface the error instead of showing
// misleading in-memory numbers.
class FallbackStore implements CounterStore {
  private memory = new MemoryStore();
  constructor(private primary: CounterStore) {}

  async incr(key: string, ttlSeconds: number) {
    try {
      return await this.primary.incr(key, ttlSeconds);
    } catch (err) {
      console.error("[store] Redis incr failed, using memory:", err);
      return this.memory.incr(key, ttlSeconds);
    }
  }

  async hincr(key: string, field: string, ttlSeconds: number, by = 1) {
    try {
      await this.primary.hincr(key, field, ttlSeconds, by);
    } catch (err) {
      console.error("[store] Redis hincr failed, using memory:", err);
      await this.memory.hincr(key, field, ttlSeconds, by);
    }
  }

  hgetall(key: string) {
    return this.primary.hgetall(key);
  }
}

const redis = redisFromEnv();
if (!redis) {
  console.warn("[store] Redis not configured — using in-memory counters (per instance only).");
}

export const store: CounterStore = redis ? new FallbackStore(new RedisStore(redis)) : new MemoryStore();
export const storeKind: "redis" | "memory" = redis ? "redis" : "memory";
