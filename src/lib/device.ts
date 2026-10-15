// Anonymous per-browser id used only for the daily analysis limit.
// Not tied to any personal data; clearing site data resets it.
const KEY = "poocheck_device_id";

export function getDeviceId(): string | null {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Fire-and-forget usage event; sendBeacon survives navigating to a map app.
export function trackEvent(name: "vet_map_click" | "share_summary") {
  const body = JSON.stringify({ name });
  try {
    if (navigator.sendBeacon?.("/api/event", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
  } catch {
    // ignore
  }
}

// Remaining analyses today (KST), remembered so the home page can show it.
const QUOTA_KEY = "poocheck_quota";

function kstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function saveRemaining(remaining: number) {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ day: kstToday(), remaining }));
  } catch {}
}

export function loadRemaining(): number | null {
  try {
    const saved = JSON.parse(localStorage.getItem(QUOTA_KEY) ?? "null");
    return saved?.day === kstToday() && typeof saved.remaining === "number" ? saved.remaining : null;
  } catch {
    return null;
  }
}
