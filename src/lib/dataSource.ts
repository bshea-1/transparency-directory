import fallbackPortals from "../data/fallbackPortals.json";
import countiesData from "../data/counties.json";
import { CountyRecord, DirectoryEntry, DirectoryStats } from "./types";
import { parseFlockPortalUrlsFromHtml } from "./parser";
import { buildDirectoryEntries } from "./matcher";
import { US_STATES } from "../data/states";

const FOOTNOTE4A_URL = "https://footnote4a.org/news/transparency-portals";
const FETCH_TIMEOUT_MS = 6000;

export interface DirectoryDataPayload {
  entries: DirectoryEntry[];
  stats: DirectoryStats;
}

export async function getTransparencyPortalUrls(): Promise<{
  urls: string[];
  isLive: boolean;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(FOOTNOTE4A_URL, {
      signal: controller.signal,
      next: {
        revalidate: 3600,
      },
      headers: {
        "User-Agent": "FlockTransparency-DirectoryBot/1.0 (+https://flocktransparency.org)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const liveUrls = parseFlockPortalUrlsFromHtml(html);
      if (liveUrls.length > 0) {
        return { urls: liveUrls, isLive: true };
      }
    }
  } catch {
  }

  return {
    urls: fallbackPortals as string[],
    isLive: false,
  };
}

export async function getDirectoryData(): Promise<DirectoryDataPayload> {
  const { urls, isLive } = await getTransparencyPortalUrls();
  const counties = countiesData as CountyRecord[];

  const { entries, stats } = buildDirectoryEntries(counties, urls);

  const validStateCodes = new Set(US_STATES.map((s) => s.code));
  const coveredStates = new Set(
    entries.filter((e) => validStateCodes.has(e.stateCode)).map((e) => e.stateCode)
  );

  const fullStats: DirectoryStats = {
    totalCounties: stats.totalCounties,
    totalVerifiedPortals: stats.totalVerifiedPortals,
    totalAgencies: stats.totalAgencies,
    verifiedCountiesCount: stats.verifiedCounties,
    unverifiedCountiesCount: stats.unverifiedCounties,
    statesCount: coveredStates.size,
    lastUpdated: new Date().toISOString(),
    isLiveSource: isLive,
  };

  return {
    entries,
    stats: fullStats,
  };
}
