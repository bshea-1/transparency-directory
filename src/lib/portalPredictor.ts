import { extractPortalSlug } from "./urlValidator";

const STATE_CODES = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga",
  "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md",
  "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
  "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc",
  "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy",
  "dc",
]);

export const INVALID_OR_DECOMMISSIONED_SLUGS = new Set([
  "flagstaff-az-pd",
  "flock-pd",
  "flock-safety-admins",
  "flock-safety-le-training",
  "flock-safety-marketing",
  "flock-safety-sales",
  "florida-le-flock-training",
  "test",
  "demo",
  "sample",
]);

const resolvedUrlCache = new Map<string, string | null>();

export function predictPortalUrls(rawUrlOrSlug: string): string[] {
  if (!rawUrlOrSlug) return [];

  let slug = rawUrlOrSlug.trim();
  if (slug.startsWith("http://") || slug.startsWith("https://")) {
    slug = extractPortalSlug(slug) || "";
  }

  slug = slug.toLowerCase().replace(/^\/+|\/+$/g, "").replace(/^[-_]+|[-_]+$/g, "");
  if (!slug) return [];

  if (
    INVALID_OR_DECOMMISSIONED_SLUGS.has(slug) ||
    slug.startsWith("flock-safety-") ||
    slug.includes("-le-flock-training")
  ) {
    return [];
  }

  const candidates = new Set<string>();

  const addCandidate = (s: string) => {
    const clean = s.toLowerCase().replace(/^[-_]+|[-_]+$/g, "");
    if (!clean) return;
    candidates.add(`https://transparency.flocksafety.com/${clean}/`);
    candidates.add(`https://transparency.flocksafety.com/${clean}`);
  };

  addCandidate(slug);

  const tokens = slug.split(/[-_]+/).filter(Boolean);
  let stateCode = "";
  let stateIndex = -1;

  for (let i = tokens.length - 1; i >= 0; i--) {
    if (STATE_CODES.has(tokens[i])) {
      stateCode = tokens[i];
      stateIndex = i;
      break;
    }
  }

  if (!stateCode && tokens.length > 0 && STATE_CODES.has(tokens[0])) {
    stateCode = tokens[0];
    stateIndex = 0;
  }

  const isSheriff =
    slug.includes("so") ||
    slug.includes("sheriff") ||
    slug.includes("sheriffs-office");

  const isPolice =
    slug.includes("pd") ||
    slug.includes("police") ||
    slug.includes("police-department");

  const isCounty = slug.includes("county");

  const nonStateTokens = tokens.filter((_, idx) => idx !== stateIndex);
  const nameTokens = nonStateTokens.filter(
    (t) =>
      !["so", "pd", "sheriff", "sheriffs", "office", "police", "department", "dept", "county", "dps", "le"].includes(
        t
      )
  );

  const baseName = nameTokens.join("-");

  if (baseName && stateCode) {
    if (isSheriff || isCounty) {
      addCandidate(`${baseName}-county-${stateCode}-so`);
      addCandidate(`${baseName}-county-so-${stateCode}`);
      addCandidate(`${baseName}-${stateCode}-so`);
      addCandidate(`${baseName}-so-${stateCode}`);
      addCandidate(`${baseName}-county-sheriff-${stateCode}`);
      addCandidate(`${baseName}-county-sheriffs-office-${stateCode}`);
      addCandidate(`${baseName}-county-${stateCode}`);
      addCandidate(`${baseName}-${stateCode}-county-so`);
      addCandidate(`${baseName}-county-so`);
      addCandidate(`${baseName}-so`);
    }

    if (isPolice || !isSheriff) {
      addCandidate(`${baseName}-${stateCode}-pd`);
      addCandidate(`${baseName}-pd-${stateCode}`);
      addCandidate(`${baseName}-${stateCode}`);
      addCandidate(`${baseName}-police-department-${stateCode}`);
      addCandidate(`${baseName}-${stateCode}-police-department`);
      addCandidate(`${baseName}-pd`);
      addCandidate(`${baseName}-police`);
    }
  }

  if (tokens.length >= 2) {
    if (tokens[tokens.length - 1] === "pd" && STATE_CODES.has(tokens[tokens.length - 2])) {
      const state = tokens[tokens.length - 2];
      const rest = tokens.slice(0, tokens.length - 2).join("-");
      addCandidate(`${rest}-pd-${state}`);
      addCandidate(`${rest}-${state}`);
    } else if (STATE_CODES.has(tokens[tokens.length - 1]) && tokens[tokens.length - 2] === "pd") {
      const state = tokens[tokens.length - 1];
      const rest = tokens.slice(0, tokens.length - 2).join("-");
      addCandidate(`${rest}-${state}-pd`);
      addCandidate(`${rest}-${state}`);
    } else if (tokens[tokens.length - 1] === "so" && STATE_CODES.has(tokens[tokens.length - 2])) {
      const state = tokens[tokens.length - 2];
      const rest = tokens.slice(0, tokens.length - 2).join("-");
      addCandidate(`${rest}-so-${state}`);
      addCandidate(`${rest}-${state}`);
    } else if (STATE_CODES.has(tokens[tokens.length - 1]) && tokens[tokens.length - 2] === "so") {
      const state = tokens[tokens.length - 1];
      const rest = tokens.slice(0, tokens.length - 2).join("-");
      addCandidate(`${rest}-${state}-so`);
      addCandidate(`${rest}-${state}`);
    }
  }

  return Array.from(candidates);
}

async function testPortalUrl(url: string, timeoutMs: number = 1800): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
      return true;
    }

    if (res.status === 403) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function resolveWorkingPortalUrl(rawUrlOrSlug: string): Promise<string | null> {
  const cacheKey = rawUrlOrSlug.trim().toLowerCase();
  if (resolvedUrlCache.has(cacheKey)) {
    return resolvedUrlCache.get(cacheKey)!;
  }

  const candidates = predictPortalUrls(rawUrlOrSlug);
  if (candidates.length === 0) {
    resolvedUrlCache.set(cacheKey, null);
    return null;
  }

  for (const candidate of candidates) {
    const isOk = await testPortalUrl(candidate, 1200);
    if (isOk) {
      resolvedUrlCache.set(cacheKey, candidate);
      return candidate;
    }
  }

  const fallback = candidates[0];
  resolvedUrlCache.set(cacheKey, fallback);
  return fallback;
}
