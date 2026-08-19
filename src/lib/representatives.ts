import counties from "../data/counties.json";
import representativeData from "../data/representatives.json";
import { parse } from "yaml";
import type { CountyRecord } from "./types";

export interface Representative {
  id: string;
  name: string;
  party: string;
  chamber: string;
  district: string;
  stateCode: string;
  email: string;
  phone: string;
  address: string;
  officialUrl: string;
  sourcePath?: string;
}

interface RepresentativeDataset {
  generatedAt: string;
  legislativeDistrictVintage: string;
  people: Record<string, Representative>;
  counties: Record<string, string[]>;
}

const data = representativeData as RepresentativeDataset;
const REPRESENTATIVE_REFRESH_TIMEOUT_MS = 1800;
const countyByFips = new Map(
  (counties as CountyRecord[]).map((county) => [county.fips, county]),
);

export function getCountyByFips(fips: string): CountyRecord | undefined {
  return countyByFips.get(fips);
}

export function getCountyRepresentatives(fips: string): Representative[] {
  const ids = data.counties[fips] ?? [];

  return ids
    .map((id) => data.people[id])
    .filter((person): person is Representative => Boolean(person))
    .sort((a, b) => {
      const chamberOrder = a.chamber.localeCompare(b.chamber);
      if (chamberOrder !== 0) return chamberOrder;
      return a.district.localeCompare(b.district, undefined, { numeric: true });
    });
}

function pickOfficialUrl(links: Array<{ url?: string }> | undefined): string {
  const urls = (links ?? []).map((link) => link?.url).filter((url): url is string => Boolean(url));
  return urls.find((url) => !/(ballotpedia|wikipedia|facebook|instagram|twitter|x\.com|linkedin|votesmart)/i.test(url)) ?? urls[0] ?? "";
}

function getCurrentRole(person: { roles?: Array<{ type?: string; end_date?: string; district?: string }> }) {
  const roles = (person.roles ?? []).filter((role) => ["lower", "upper", "legislature"].includes(role.type ?? ""));
  return roles.find((role) => !role.end_date) ?? roles.at(-1);
}

export async function getCurrentCountyRepresentatives(fips: string): Promise<Representative[]> {
  const fallbackRepresentatives = getCountyRepresentatives(fips);

  const currentRepresentatives = await Promise.all(
    fallbackRepresentatives.map(async (representative) => {
      if (!representative.sourcePath) return representative;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REPRESENTATIVE_REFRESH_TIMEOUT_MS);
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/openstates/people/main/${representative.sourcePath}`,
          { next: { revalidate: 86400 }, signal: controller.signal },
        );
        if (!response.ok) return representative;

        const person = parse(await response.text()) as {
          name?: string;
          email?: string;
          party?: Array<{ name?: string }> | { name?: string };
          links?: Array<{ url?: string }>;
          offices?: Array<{ classification?: string; address?: string; voice?: string }>;
          roles?: Array<{ type?: string; end_date?: string; district?: string }>;
        };
        const role = getCurrentRole(person);
        const office = person.offices?.find((item) => item.classification === "district")
          ?? person.offices?.find((item) => item.classification === "capitol")
          ?? person.offices?.[0];
        const party = Array.isArray(person.party) ? person.party.at(-1)?.name : person.party?.name;

        return {
          ...representative,
          name: person.name ?? representative.name,
          party: party ?? representative.party,
          chamber: role?.type === "lower" ? "State House" : role?.type === "upper" ? "State Senate" : representative.chamber,
          district: role?.district ?? representative.district,
          email: person.email ?? representative.email,
          phone: office?.voice ?? representative.phone,
          address: office?.address ?? representative.address,
          officialUrl: pickOfficialUrl(person.links) || representative.officialUrl,
        };
      } catch {
        return representative;
      } finally {
        clearTimeout(timeoutId);
      }
    }),
  );

  return currentRepresentatives.sort((a, b) => {
    const chamberOrder = a.chamber.localeCompare(b.chamber);
    if (chamberOrder !== 0) return chamberOrder;
    return a.district.localeCompare(b.district, undefined, { numeric: true });
  });
}

export const legislativeDistrictVintage = data.legislativeDistrictVintage;
