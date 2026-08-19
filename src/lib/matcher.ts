import { CountyRecord, DirectoryEntry, PortalRecord } from "./types";
import { parsePortalRecordFromUrl } from "./parser";
import { getStateByCode } from "../data/states";

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function buildDirectoryEntries(
  counties: CountyRecord[],
  portalUrls: string[]
): {
  entries: DirectoryEntry[];
  stats: {
    totalCounties: number;
    verifiedCounties: number;
    unverifiedCounties: number;
    totalAgencies: number;
    totalVerifiedPortals: number;
  };
} {
  const portalRecords: PortalRecord[] = [];
  for (const url of portalUrls) {
    const record = parsePortalRecordFromUrl(url);
    if (record) {
      portalRecords.push(record);
    }
  }

  const stateCountyMap = new Map<string, CountyRecord[]>();
  for (const county of counties) {
    const list = stateCountyMap.get(county.stateCode) || [];
    list.push(county);
    stateCountyMap.set(county.stateCode, list);
  }

  const countyPortalsMap = new Map<string, PortalRecord[]>();
  const unmatchedPortals: PortalRecord[] = [];

  for (const portal of portalRecords) {
    let matched = false;

    if (portal.stateCode && stateCountyMap.has(portal.stateCode)) {
      const stateCounties = stateCountyMap.get(portal.stateCode)!;
      const slugNorm = normalizeName(portal.slug);

      const isCountySlug =
        portal.isCountyLevel ||
        slugNorm.includes("county") ||
        slugNorm.includes("parish") ||
        slugNorm.includes("borough");

      if (isCountySlug) {
        for (const county of stateCounties) {
          const countyNorm = normalizeName(county.rawName);

          const hasCountyToken =
            slugNorm.includes(`${countyNorm}county`) ||
            slugNorm.includes(`county${countyNorm}`) ||
            (slugNorm.includes(countyNorm) && (slugNorm.includes("so") || slugNorm.includes("sheriff")));

          if (hasCountyToken) {
            const list = countyPortalsMap.get(county.fips) || [];
            list.push(portal);
            countyPortalsMap.set(county.fips, list);
            portal.matchedCountyFips = county.fips;
            portal.matchedCountyName = county.name;
            matched = true;
            break;
          }
        }
      }
    }

    if (!matched) {
      unmatchedPortals.push(portal);
    }
  }

  const countyEntries: DirectoryEntry[] = [];
  let verifiedCountiesCount = 0;

  for (const county of counties) {
    const matchedPortals = countyPortalsMap.get(county.fips);
    const isVerified = Boolean(matchedPortals && matchedPortals.length > 0);

    if (isVerified) {
      verifiedCountiesCount++;
      const primaryPortal = matchedPortals![0];
      countyEntries.push({
        id: `county-${county.fips}`,
        name: county.name,
        jurisdiction: county.name,
        stateCode: county.stateCode,
        stateName: county.stateName,
        category: "county",
        agencyType: primaryPortal.agencyType || "county-sheriff",
        status: "verified",
        portalUrl: primaryPortal.url,
        portalSlug: primaryPortal.slug,
        portalCount: matchedPortals!.length,
        allPortals: matchedPortals!.map((p) => ({
          url: p.url,
          slug: p.slug,
          name: p.agencyName,
        })),
        fips: county.fips,
      });
    } else {
      countyEntries.push({
        id: `county-${county.fips}`,
        name: county.name,
        jurisdiction: county.name,
        stateCode: county.stateCode,
        stateName: county.stateName,
        category: "county",
        agencyType: "county-sheriff",
        status: "unverified",
        fips: county.fips,
      });
    }
  }

  const agencyEntries: DirectoryEntry[] = [];
  for (const portal of unmatchedPortals) {
    const stateInfo = portal.stateCode ? getStateByCode(portal.stateCode) : undefined;
    const stateName = stateInfo ? stateInfo.name : portal.stateName || "United States";
    const stateCode = portal.stateCode || "US";

    const jurisdiction = portal.agencyName
      .replace(/ Police Department$/i, "")
      .replace(/ Sheriff's Office$/i, "")
      .replace(/ Dept of Public Safety$/i, "")
      .trim();

    agencyEntries.push({
      id: `agency-${portal.slug}`,
      name: portal.agencyName,
      jurisdiction: jurisdiction || portal.agencyName,
      stateCode: stateCode,
      stateName: stateName,
      category: "agency",
      agencyType: portal.agencyType,
      status: "verified",
      portalUrl: portal.url,
      portalSlug: portal.slug,
      portalCount: 1,
      allPortals: [{ url: portal.url, slug: portal.slug, name: portal.agencyName }],
    });
  }

  const allEntries = [...countyEntries, ...agencyEntries].sort((a, b) => {
    if (a.stateName !== b.stateName) {
      return a.stateName.localeCompare(b.stateName);
    }
    if (a.category !== b.category) {
      return a.category === "county" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    entries: allEntries,
    stats: {
      totalCounties: counties.length,
      verifiedCounties: verifiedCountiesCount,
      unverifiedCounties: counties.length - verifiedCountiesCount,
      totalAgencies: agencyEntries.length,
      totalVerifiedPortals: portalRecords.length,
    },
  };
}
