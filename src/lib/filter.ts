import { DirectoryEntry, DirectoryFilterParams, PaginatedResult } from "./types";

export const DEFAULT_PAGE_SIZE = 24;

export function filterDirectoryEntries(
  entries: DirectoryEntry[],
  params: DirectoryFilterParams
): PaginatedResult<DirectoryEntry> {
  const {
    searchQuery = "",
    state = "ALL",
    status = "all",
    category = "all",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const normalizedState = state.toUpperCase().trim();

  const filtered = entries.filter((entry) => {
    if (normalizedState && normalizedState !== "ALL") {
      if (entry.stateCode.toUpperCase() !== normalizedState) {
        return false;
      }
    }

    if (status && status !== "all") {
      if (entry.status !== status) {
        return false;
      }
    }

    if (category && category !== "all") {
      if (entry.category !== category) {
        return false;
      }
    }

    if (normalizedQuery) {
      const nameMatch = entry.name.toLowerCase().includes(normalizedQuery);
      const jurisdictionMatch = entry.jurisdiction.toLowerCase().includes(normalizedQuery);
      const stateNameMatch = entry.stateName.toLowerCase().includes(normalizedQuery);
      const stateCodeMatch = entry.stateCode.toLowerCase() === normalizedQuery;
      const slugMatch = entry.portalSlug
        ? entry.portalSlug.toLowerCase().includes(normalizedQuery)
        : false;
      const fipsMatch = entry.fips ? entry.fips.includes(normalizedQuery) : false;

      const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
      let allTokensMatch = false;
      if (queryTokens.length > 1) {
        const searchableText = `${entry.name} ${entry.jurisdiction} ${entry.stateName} ${entry.stateCode} ${entry.portalSlug || ""}`.toLowerCase();
        allTokensMatch = queryTokens.every((t) => searchableText.includes(t));
      }

      if (
        !nameMatch &&
        !jurisdictionMatch &&
        !stateNameMatch &&
        !stateCodeMatch &&
        !slugMatch &&
        !fipsMatch &&
        !allTokensMatch
      ) {
        return false;
      }
    }

    return true;
  });

  const total = filtered.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;
  const items = filtered.slice(startIndex, endIndex);

  return {
    items,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}
