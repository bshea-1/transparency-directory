import { AgencyType, PortalRecord } from "./types";
import { deduplicatePortalUrls, extractPortalSlug, isValidFlockPortalUrl } from "./urlValidator";
import { getStateByCode } from "../data/states";

export function parseFlockPortalUrlsFromHtml(html: string): string[] {
  if (!html || typeof html !== "string") {
    return [];
  }

  const rawUrls: string[] = [];

  const hrefRegex = /href=["'](https?:\/\/[^"'>]+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1];
    if (isValidFlockPortalUrl(url)) {
      rawUrls.push(url);
    }
  }

  const textRegex = /https:\/\/transparency\.flocksafety\.com\/[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-]*)*/gi;
  while ((match = textRegex.exec(html)) !== null) {
    const url = match[0];
    if (isValidFlockPortalUrl(url)) {
      rawUrls.push(url);
    }
  }

  return deduplicatePortalUrls(rawUrls);
}

export function inferAgencyType(tokens: string[]): AgencyType {
  const tokenStr = tokens.join("-").toLowerCase();

  if (tokenStr.includes("tribal") || tokenStr.includes("nation")) {
    return "tribal-police";
  }
  if (
    tokenStr.includes("university") ||
    tokenStr.includes("college") ||
    tokenStr.includes("campus") ||
    tokenStr.includes("school")
  ) {
    return "university-police";
  }
  if (
    tokenStr.includes("airport") ||
    tokenStr.includes("transit") ||
    tokenStr.includes("park-police") ||
    tokenStr.includes("authority")
  ) {
    return "special-district";
  }
  if (
    tokenStr.includes("state-police") ||
    tokenStr.includes("highway-patrol") ||
    tokenStr.includes("dps") ||
    tokenStr.includes("state-patrol")
  ) {
    return "state-agency";
  }
  if (
    tokenStr.includes("county-so") ||
    tokenStr.includes("so-") ||
    tokenStr.endsWith("-so") ||
    tokenStr.includes("sheriff")
  ) {
    return "county-sheriff";
  }
  if (tokenStr.includes("county-pd") || (tokenStr.includes("county") && tokenStr.includes("pd"))) {
    return "county-police";
  }
  if (tokenStr.includes("pd") || tokenStr.includes("police")) {
    return "municipal-police";
  }

  return "other";
}

export function parsePortalRecordFromUrl(url: string): PortalRecord | null {
  const slug = extractPortalSlug(url);
  if (!slug) return null;

  const cleanSlug = slug.replace(/^[-_]+|[-_]+$/g, "");
  const parts = cleanSlug.split(/[-_]+/).filter(Boolean);

  let stateCode = "";
  let agencyType: AgencyType = "other";
  let isCountyLevel = false;

  const STATE_CODES = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
  ]);

  for (let i = parts.length - 1; i >= 0; i--) {
    const upper = parts[i].toUpperCase();
    if (STATE_CODES.has(upper)) {
      stateCode = upper;
      break;
    }
  }

  if (!stateCode && parts.length > 0) {
    const firstUpper = parts[0].toUpperCase();
    if (STATE_CODES.has(firstUpper)) {
      stateCode = firstUpper;
    }
  }

  agencyType = inferAgencyType(parts);
  const slugLower = cleanSlug.toLowerCase();

  if (slugLower.includes("county") || agencyType === "county-sheriff" || agencyType === "county-police") {
    isCountyLevel = true;
  }

  const agencyName = formatAgencyNameFromSlug(cleanSlug, stateCode, agencyType);
  const stateInfo = stateCode ? getStateByCode(stateCode) : undefined;
  const stateName = stateInfo ? stateInfo.name : "";

  return {
    url,
    slug,
    agencyName,
    stateCode,
    stateName,
    agencyType,
    isCountyLevel,
  };
}

export function formatAgencyNameFromSlug(
  slug: string,
  stateCode: string,
  agencyType: AgencyType
): string {
  const tokens = slug
    .replace(/^[-_]+|[-_]+$/g, "")
    .split(/[-_]+/)
    .filter(Boolean);

  const formatWord = (w: string): string => {
    const lower = w.toLowerCase();
    if (lower === "pd") return "Police Department";
    if (lower === "so") return "Sheriff's Office";
    if (lower === "dps") return "Dept of Public Safety";
    if (lower === "le") return "Law Enforcement";
    if (lower === "abc") return "ABC";
    if (lower === "co") return "CO";
    if (lower === "ca") return "CA";
    if (lower === "tx") return "TX";
    if (lower === "va") return "VA";
    if (lower === "wa") return "WA";
    if (lower === "oh") return "OH";
    if (lower === "wi") return "WI";
    if (lower === "mn") return "MN";
    if (lower === "ia") return "IA";
    if (lower === "fl") return "FL";
    if (lower === "nc") return "NC";
    if (lower === "ga") return "GA";
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const readableTokens: string[] = [];
  let hasSuffix = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toLowerCase();
    if (token === stateCode.toLowerCase() && (i === tokens.length - 1 || i === 0 || i === tokens.length - 2)) {
      continue;
    }
    if (token === "pd") {
      readableTokens.push("Police Department");
      hasSuffix = true;
    } else if (token === "so") {
      readableTokens.push("Sheriff's Office");
      hasSuffix = true;
    } else {
      readableTokens.push(formatWord(tokens[i]));
    }
  }

  let name = readableTokens.join(" ");

  name = name.replace(/Police Department Police Department/g, "Police Department");
  name = name.replace(/Sheriff's Office Sheriff's Office/g, "Sheriff's Office");
  name = name.replace(/County County/g, "County");

  if (!hasSuffix) {
    if (agencyType === "county-sheriff" && !name.includes("Sheriff")) {
      name += " Sheriff's Office";
    } else if (agencyType === "municipal-police" && !name.includes("Police")) {
      name += " Police Department";
    }
  }

  return name.trim();
}
