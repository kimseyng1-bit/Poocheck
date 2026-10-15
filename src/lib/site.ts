// Canonical site URL for metadata, sitemap and structured data.
// Set NEXT_PUBLIC_SITE_URL when moving to a custom domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://poocheck.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "포푸체크";

// Shown on the privacy policy and terms as the operator / privacy officer.
export const OPERATOR_NAME = "포푸체크 운영자";
export const CONTACT_EMAIL = "kimseyng1@gmail.com";
// Effective date of the current privacy policy and terms.
export const LEGAL_EFFECTIVE_DATE = "2026년 10월 15일";
