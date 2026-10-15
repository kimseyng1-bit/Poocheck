// Daily analysis limits, configurable via env. Kept separate from usage.ts so
// pages (e.g. the terms) can show them without pulling in the Redis store.

function envInt(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const LIMITS = {
  // One phone/browser. The main limit users will notice.
  perDevice: envInt("RATE_LIMIT_PER_DEVICE_DAILY", 10),
  // Looser, because mobile carriers put many phones behind one IP.
  perIp: envInt("RATE_LIMIT_PER_IP_DAILY", 30),
  // Hard budget cap for the whole service.
  global: envInt("RATE_LIMIT_GLOBAL_DAILY", 1000),
};
