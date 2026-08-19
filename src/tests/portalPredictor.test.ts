import { describe, it, expect } from "vitest";
import { predictPortalUrls, resolveWorkingPortalUrl } from "../lib/portalPredictor";

describe("portalPredictor", () => {
  it("predicts variations for municipal police portals", () => {
    const predictions = predictPortalUrls("https://transparency.flocksafety.com/mesa-az-pd/");
    expect(predictions).toContain("https://transparency.flocksafety.com/mesa-az-pd/");
    expect(predictions).toContain("https://transparency.flocksafety.com/mesa-pd-az/");
    expect(predictions).toContain("https://transparency.flocksafety.com/mesa-az/");
    expect(predictions).toContain("https://transparency.flocksafety.com/mesa-police-department-az/");
  });

  it("handles malformed leading and trailing hyphens in slugs", () => {
    const predictions = predictPortalUrls("-el-cajon-pd-ca/");
    expect(predictions).toContain("https://transparency.flocksafety.com/el-cajon-pd-ca/");
    expect(predictions).toContain("https://transparency.flocksafety.com/el-cajon-ca-pd/");
  });

  it("predicts county sheriff variations", () => {
    const predictions = predictPortalUrls("https://transparency.flocksafety.com/fulton-county-ga-so/");
    expect(predictions).toContain("https://transparency.flocksafety.com/fulton-county-ga-so/");
    expect(predictions).toContain("https://transparency.flocksafety.com/fulton-county-so-ga/");
    expect(predictions).toContain("https://transparency.flocksafety.com/fulton-ga-so/");
  });

  it("filters out known decommissioned portals (e.g. Flagstaff contract cancellation)", () => {
    const predictions = predictPortalUrls("https://transparency.flocksafety.com/flagstaff-az-pd/");
    expect(predictions).toHaveLength(0);
  });

  it("resolves a URL gracefully for active portals", async () => {
    const resolved = await resolveWorkingPortalUrl("https://transparency.flocksafety.com/mesa-az-pd/");
    expect(resolved).toBeTruthy();
    expect(resolved?.startsWith("https://transparency.flocksafety.com/")).toBe(true);
  });
});
