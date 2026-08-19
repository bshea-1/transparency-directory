export type AgencyType =
  | "county-sheriff"
  | "county-police"
  | "municipal-police"
  | "university-police"
  | "tribal-police"
  | "state-agency"
  | "special-district"
  | "other";

export interface PortalRecord {
  url: string;
  slug: string;
  agencyName: string;
  stateCode: string;
  stateName: string;
  agencyType: AgencyType;
  isCountyLevel: boolean;
  matchedCountyFips?: string;
  matchedCountyName?: string;
}

export interface CountyRecord {
  fips: string;
  name: string;
  rawName: string;
  stateCode: string;
  stateName: string;
  population?: number;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  jurisdiction: string;
  stateCode: string;
  stateName: string;
  category: "county" | "agency";
  agencyType: AgencyType;
  status: "verified" | "unverified";
  portalUrl?: string;
  portalSlug?: string;
  portalCount?: number;
  allPortals?: Array<{ url: string; slug: string; name: string }>;
  fips?: string;
}

export interface StateInfo {
  code: string;
  name: string;
  fips: string;
}

export interface DirectoryFilterParams {
  searchQuery?: string;
  state?: string;
  status?: "all" | "verified" | "unverified";
  category?: "all" | "county" | "agency";
  page?: number;
  pageSize?: number;
}

export interface DirectoryStats {
  totalCounties: number;
  totalVerifiedPortals: number;
  totalAgencies: number;
  verifiedCountiesCount: number;
  unverifiedCountiesCount: number;
  statesCount: number;
  lastUpdated: string;
  isLiveSource: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}
