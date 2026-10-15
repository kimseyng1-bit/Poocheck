import { store } from "@/lib/store";
import { LIMITS } from "@/lib/limits";

export { LIMITS };

// Daily analysis limits and usage counters. Days roll over at midnight KST.

const DAY_TTL = 60 * 60 * 26; // a little over a day so late requests still count
const STATS_TTL = 60 * 60 * 24 * 120; // keep daily stats ~4 months

export function kstDay(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export type LimitReason = "device" | "ip" | "global";

// Counts this attempt and reports whether it is over any limit. Counted before
// calling Claude, since rejected photos ("not stool") still cost an API call.
export async function consumeAnalysis(deviceId: string | null, ip: string | null) {
  const day = kstDay();
  const checks: Array<[LimitReason, string, number]> = [["global", `rl:global:${day}`, LIMITS.global]];
  if (ip) checks.push(["ip", `rl:ip:${ip}:${day}`, LIMITS.perIp]);
  if (deviceId) checks.push(["device", `rl:dev:${deviceId}:${day}`, LIMITS.perDevice]);

  const counts = await Promise.all(checks.map(([, key]) => store.incr(key, DAY_TTL)));
  // Report the narrowest limit first so the message matches what the user did.
  for (let i = checks.length - 1; i >= 0; i--) {
    if (counts[i] > checks[i][2]) return { ok: false as const, reason: checks[i][0] };
  }
  const deviceIdx = checks.findIndex(([r]) => r === "device");
  const remaining = deviceIdx >= 0 ? Math.max(0, LIMITS.perDevice - counts[deviceIdx]) : undefined;
  return { ok: true as const, remaining };
}

// Server-side outcomes plus a few client events; anything else is rejected.
export const STAT_FIELDS = [
  "analyzed",
  "green",
  "yellow",
  "red",
  "not_stool",
  "unclear",
  "error",
  "limited_device",
  "limited_ip",
  "limited_global",
  "vet_map_click",
  "share_summary",
] as const;
export type StatField = (typeof STAT_FIELDS)[number];

export const CLIENT_EVENTS: StatField[] = ["vet_map_click", "share_summary"];

export async function recordStat(field: StatField) {
  try {
    await store.hincr(`stats:${kstDay()}`, field, STATS_TTL);
  } catch (err) {
    // Stats must never break an analysis.
    console.error("[usage] failed to record stat", field, err);
  }
}

export async function readStats(days: number) {
  const out: Array<{ day: string } & Partial<Record<StatField, number>>> = [];
  for (let i = 0; i < days; i++) {
    const day = kstDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    out.push({ day, ...(await store.hgetall(`stats:${day}`)) });
  }
  return out;
}
