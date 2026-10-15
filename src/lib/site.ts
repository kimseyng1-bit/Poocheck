// Canonical site URL for metadata, sitemap and structured data.
// Set NEXT_PUBLIC_SITE_URL when moving to a custom domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://poocheck.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "포푸체크";
