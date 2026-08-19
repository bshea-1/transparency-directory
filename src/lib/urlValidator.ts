export function isValidFlockPortalUrl(urlStr: string | null | undefined): boolean {
  if (!urlStr || typeof urlStr !== "string") {
    return false;
  }

  const trimmed = urlStr.trim();
  if (!trimmed.startsWith("https://")) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.hostname.toLowerCase() !== "transparency.flocksafety.com") {
      return false;
    }
    const path = parsed.pathname.trim();
    if (!path || path === "/" || path === "//") {
      return false;
    }

    const slug = path.replace(/^\/+|\/+$/g, "").replace(/^[-_]+|[-_]+$/g, "").toLowerCase();
    const INVALID_SLUGS = new Set([
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

    if (INVALID_SLUGS.has(slug) || slug.startsWith("flock-safety-") || slug.includes("-le-flock-training")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function normalizeFlockPortalUrl(urlStr: string): string | null {
  if (!isValidFlockPortalUrl(urlStr)) {
    return null;
  }

  try {
    const parsed = new URL(urlStr.trim());
    let pathname = parsed.pathname.replace(/\/+/g, "/");
    if (!pathname.endsWith("/")) {
      pathname += "/";
    }
    return `https://transparency.flocksafety.com${pathname.toLowerCase()}`;
  } catch {
    return null;
  }
}

export function deduplicatePortalUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const raw of urls) {
    const normalized = normalizeFlockPortalUrl(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      results.push(normalized);
    }
  }

  return results;
}

export function extractPortalSlug(urlStr: string): string | null {
  const normalized = normalizeFlockPortalUrl(urlStr);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    const slug = parsed.pathname.replace(/^\/+|\/+$/g, "");
    return slug || null;
  } catch {
    return null;
  }
}
