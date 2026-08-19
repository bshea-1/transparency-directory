import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTransparencyPortalUrls, getDirectoryData } from "../lib/dataSource";

describe("dataSource", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back gracefully to static fallback dataset if fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network Error"));

    const result = await getTransparencyPortalUrls();
    expect(result.isLive).toBe(false);
    expect(result.urls.length).toBeGreaterThan(800);
    expect(result.urls[0]).toContain("transparency.flocksafety.com");
  });

  it("returns comprehensive directory data with stats and entries", async () => {
    const data = await getDirectoryData();
    expect(data.entries.length).toBeGreaterThan(3143);
    expect(data.stats.totalCounties).toBe(3143);
    expect(data.stats.totalVerifiedPortals).toBeGreaterThan(800);
    expect(data.stats.statesCount).toBe(51);
  });
});
