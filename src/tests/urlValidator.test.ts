import { describe, it, expect } from "vitest";
import {
  isValidFlockPortalUrl,
  normalizeFlockPortalUrl,
  deduplicatePortalUrls,
  extractPortalSlug,
} from "../lib/urlValidator";

describe("urlValidator", () => {
  it("validates correct HTTPS transparency.flocksafety.com URLs", () => {
    expect(
      isValidFlockPortalUrl("https://transparency.flocksafety.com/alameda-county-ca-so/")
    ).toBe(true);
    expect(
      isValidFlockPortalUrl("https://transparency.flocksafety.com/akron-oh-pd")
    ).toBe(true);
  });

  it("rejects non-HTTPS URLs", () => {
    expect(
      isValidFlockPortalUrl("http://transparency.flocksafety.com/alameda-county-ca-so/")
    ).toBe(false);
  });

  it("rejects different hostnames", () => {
    expect(isValidFlockPortalUrl("https://flocksafety.com/about")).toBe(false);
    expect(
      isValidFlockPortalUrl("https://fake-transparency.flocksafety.com/portal")
    ).toBe(false);
    expect(isValidFlockPortalUrl("https://google.com")).toBe(false);
  });

  it("rejects root or empty paths", () => {
    expect(isValidFlockPortalUrl("https://transparency.flocksafety.com/")).toBe(false);
    expect(isValidFlockPortalUrl("https://transparency.flocksafety.com")).toBe(false);
    expect(isValidFlockPortalUrl(null)).toBe(false);
    expect(isValidFlockPortalUrl(undefined)).toBe(false);
  });

  it("normalizes URLs with trailing slash and lowercase", () => {
    expect(
      normalizeFlockPortalUrl("https://transparency.flocksafety.com/Akron-OH-PD")
    ).toBe("https://transparency.flocksafety.com/akron-oh-pd/");
  });

  it("deduplicates redundant URLs correctly", () => {
    const raw = [
      "https://transparency.flocksafety.com/akron-oh-pd",
      "https://transparency.flocksafety.com/akron-oh-pd/",
      "https://transparency.flocksafety.com/AKRON-OH-PD/",
      "https://transparency.flocksafety.com/alameda-ca-pd/",
      "http://invalid.com/akron",
    ];
    const deduped = deduplicatePortalUrls(raw);
    expect(deduped).toHaveLength(2);
    expect(deduped).toEqual([
      "https://transparency.flocksafety.com/akron-oh-pd/",
      "https://transparency.flocksafety.com/alameda-ca-pd/",
    ]);
  });

  it("extracts portal slug cleanly", () => {
    expect(
      extractPortalSlug("https://transparency.flocksafety.com/spokane-county-wa-so/")
    ).toBe("spokane-county-wa-so");
    expect(
      extractPortalSlug("https://transparency.flocksafety.com/-el-cajon-pd-ca/")
    ).toBe("-el-cajon-pd-ca");
  });
});
