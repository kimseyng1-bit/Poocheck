import { Redis } from "@upstash/redis";

// Tiny counter store shared by rate limiting and usage stats.
// Uses Upstash Redis when configured (Vercel Marketplace sets KV_REST_API_*),
// otherwise an in-memory fallback that only lives as long as one server
// instance — fine for local dev, not a real limit in production.

interface CounterStore {
  incr(key: string, ttlSeconds: number): Promise<number>;
  hincr(key: string, field: string, ttlSeconds: number): Promise<void>;
  hgetall(key: string): Promise<Record<string, number>>;
}

function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

class RedisStore implements CounterStore {
  constructor(private redis: Redis) {}

  async incr(key: string, ttlSeconds: number) {
    const [count] = await this.redis.pipeline().incr(key).expire(key, ttlSeconds).exec<[number, number]>();
    return count;
  }

  async hincr(key: string, field: string, ttlSeconds: number) {
    await this.redis.pipeline().hincrby(key, field, 1).expire(key, ttlSeconds).exec();
  }

  async hgetall(key: string) {
    const raw = (await this.redis.hgetall<Record<string, number | string>>(key)) ?? {};
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

  async hincr(key: string, field: string, ttlSeconds: number) {
    const now = Date.now();
    const cur = this.hashes.get(key);
    const fields = cur && cur.expiresAt > now ? cur.fields : {};
    fields[field] = (fields[field] ?? 0) + 1;
    this.hashes.set(key, { fields, expiresAt: now + ttlSeconds * 1000 });
  }

  async hgetall(key: string) {
    const cur = this.hashes.get(key);
    return cur && cur.expiresAt > Date.now() ? { ...cur.fields } : {};
  }
}

const redis = redisFromEnv();
if (!redis) {
  console.warn("[store] Redis not configured — using in-memory counters (per instance only).");
}

export const store: CounterStore = redis ? new RedisStore(redis) : new MemoryStore();
export const storeKind: "redis" | "memory" = redis ? "redis" : "memory";
