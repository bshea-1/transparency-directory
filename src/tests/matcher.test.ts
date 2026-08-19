import { describe, it, expect } from "vitest";
import { buildDirectoryEntries, normalizeName } from "../lib/matcher";
import { CountyRecord } from "../lib/types";

describe("matcher", () => {
  const sampleCounties: CountyRecord[] = [
    {
      fips: "06001",
      name: "Alameda County",
      rawName: "Alameda",
      stateCode: "CA",
      stateName: "California",
    },
    {
      fips: "53063",
      name: "Spokane County",
      rawName: "Spokane",
      stateCode: "WA",
      stateName: "Washington",
    },
    {
      fips: "01001",
      name: "Autauga County",
      rawName: "Autauga",
      stateCode: "AL",
      stateName: "Alabama",
    },
  ];

  it("normalizes names correctly", () => {
    expect(normalizeName("Alameda County")).toBe("alamedacounty");
    expect(normalizeName("St. Louis City")).toBe("stlouiscity");
  });

  it("marks counties with verified portals as verified and assigns portalUrl", () => {
    const urls = [
      "https://transparency.flocksafety.com/alameda-county-ca-so/",
      "https://transparency.flocksafety.com/-spokane-county-wa-so/",
    ];

    const { entries, stats } = buildDirectoryEntries(sampleCounties, urls);

    expect(stats.totalCounties).toBe(3);
    expect(stats.verifiedCounties).toBe(2);
    expect(stats.unverifiedCounties).toBe(1);

    const alameda = entries.find((e) => e.fips === "06001");
    expect(alameda).toBeDefined();
    expect(alameda?.status).toBe("verified");
    expect(alameda?.portalUrl).toBe(
      "https://transparency.flocksafety.com/alameda-county-ca-so/"
    );

    const spokane = entries.find((e) => e.fips === "53063");
    expect(spokane).toBeDefined();
    expect(spokane?.status).toBe("verified");

    const autauga = entries.find((e) => e.fips === "01001");
    expect(autauga).toBeDefined();
    expect(autauga?.status).toBe("unverified");
    expect(autauga?.portalUrl).toBeUndefined();
  });

  it("preserves non-county municipal agencies as distinct verified directory entries", () => {
    const urls = [
      "https://transparency.flocksafety.com/akron-oh-pd/",
      "https://transparency.flocksafety.com/case-western-reserve-university-oh-pd/",
    ];

    const { entries, stats } = buildDirectoryEntries(sampleCounties, urls);

    expect(stats.totalAgencies).toBe(2);
    const akron = entries.find((e) => e.portalSlug === "akron-oh-pd");
    expect(akron).toBeDefined();
    expect(akron?.category).toBe("agency");
    expect(akron?.status).toBe("verified");
    expect(akron?.stateCode).toBe("OH");
    expect(akron?.stateName).toBe("Ohio");
  });
});
