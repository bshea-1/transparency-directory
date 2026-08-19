import zipToCountyData from "../data/zipToCounty.json";
import countiesData from "../data/counties.json";
import { getDirectoryData } from "./dataSource";
import { CountyRecord } from "./types";

export interface ZipLookupResult {
  success: boolean;
  zip: string;
  fips?: string;
  countyName?: string;
  stateCode?: string;
  stateName?: string;
  isVerified: boolean;
  portalUrl?: string;
  portalSlug?: string;
  agencyName?: string;
  contactUrl?: string;
  error?: string;
}

const zipMap = zipToCountyData as Record<string, string>;
const countiesList = countiesData as CountyRecord[];
const countyMapByFips = new Map<string, CountyRecord>();
for (const county of countiesList) {
  countyMapByFips.set(county.fips, county);
}

export async function lookupByZip(rawZip: string): Promise<ZipLookupResult> {
  const cleanZip = String(rawZip || "").trim().replace(/[^0-9]/g, "");

  if (cleanZip.length !== 5) {
    return {
      success: false,
      zip: cleanZip,
      isVerified: false,
      error: "Please enter a valid 5-digit US ZIP code.",
    };
  }

  const fips = zipMap[cleanZip];
  if (!fips) {
    return {
      success: false,
      zip: cleanZip,
      isVerified: false,
      error: `ZIP code ${cleanZip} could not be matched to a US county.`,
    };
  }

  const county = countyMapByFips.get(fips);
  if (!county) {
    return {
      success: false,
      zip: cleanZip,
      fips,
      isVerified: false,
      error: `County data for FIPS ${fips} was not found.`,
    };
  }

  const { entries } = await getDirectoryData();
  const matchedEntry = entries.find((e) => e.fips === fips && e.category === "county");

  const isVerified = Boolean(matchedEntry && matchedEntry.status === "verified" && matchedEntry.portalUrl);

  return {
    success: true,
    zip: cleanZip,
    fips,
    countyName: county.name,
    stateCode: county.stateCode,
    stateName: county.stateName,
    isVerified,
    portalUrl: matchedEntry?.portalUrl,
    portalSlug: matchedEntry?.portalSlug,
    agencyName: matchedEntry?.name || county.name,
    contactUrl: `/county/${fips}`,
  };
}
