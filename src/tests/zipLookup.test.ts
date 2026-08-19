import { describe, it, expect } from "vitest";
import { lookupByZip } from "../lib/zipLookup";

describe("zipLookup", () => {
  it("resolves verified ZIP code correctly (Alameda County, CA: 94612)", async () => {
    const res = await lookupByZip("94612");
    expect(res.success).toBe(true);
    expect(res.stateCode).toBe("CA");
    expect(res.countyName).toContain("Alameda");
    expect(res.fips).toBe("06001");
    expect(res.isVerified).toBe(true);
    expect(res.portalUrl).toContain("transparency.flocksafety.com");
  });

  it("resolves verified ZIP code correctly (Spokane County, WA: 99201)", async () => {
    const res = await lookupByZip("99201");
    expect(res.success).toBe(true);
    expect(res.stateCode).toBe("WA");
    expect(res.countyName).toContain("Spokane");
    expect(res.fips).toBe("53063");
    expect(res.isVerified).toBe(true);
    expect(res.portalUrl).toContain("transparency.flocksafety.com");
  });

  it("resolves unverified ZIP code correctly (Autauga County, AL: 36003)", async () => {
    const res = await lookupByZip("36003");
    expect(res.success).toBe(true);
    expect(res.stateCode).toBe("AL");
    expect(res.countyName).toContain("Autauga");
    expect(res.fips).toBe("01001");
    expect(res.isVerified).toBe(false);
    expect(res.contactUrl).toBe("/county/01001");
  });

  it("handles invalid or non-existent ZIP codes gracefully", async () => {
    const shortZip = await lookupByZip("123");
    expect(shortZip.success).toBe(false);
    expect(shortZip.error).toBeDefined();

    const invalidZip = await lookupByZip("99999");
    expect(invalidZip.success).toBe(false);
    expect(invalidZip.error).toBeDefined();
  });
});
