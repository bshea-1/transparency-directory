import { describe, it, expect } from "vitest";
import { filterDirectoryEntries } from "../lib/filter";
import { DirectoryEntry } from "../lib/types";

describe("filter and pagination", () => {
  const sampleEntries: DirectoryEntry[] = [
    {
      id: "county-06001",
      name: "Alameda County",
      jurisdiction: "Alameda County",
      stateCode: "CA",
      stateName: "California",
      category: "county",
      agencyType: "county-sheriff",
      status: "verified",
      portalUrl: "https://transparency.flocksafety.com/alameda-county-ca-so/",
      portalSlug: "alameda-county-ca-so",
    },
    {
      id: "county-01001",
      name: "Autauga County",
      jurisdiction: "Autauga County",
      stateCode: "AL",
      stateName: "Alabama",
      category: "county",
      agencyType: "county-sheriff",
      status: "unverified",
    },
    {
      id: "agency-akron-oh-pd",
      name: "Akron Police Department",
      jurisdiction: "Akron",
      stateCode: "OH",
      stateName: "Ohio",
      category: "agency",
      agencyType: "municipal-police",
      status: "verified",
      portalUrl: "https://transparency.flocksafety.com/akron-oh-pd/",
      portalSlug: "akron-oh-pd",
    },
    {
      id: "agency-austin-tx-pd",
      name: "Austin Police Department",
      jurisdiction: "Austin",
      stateCode: "TX",
      stateName: "Texas",
      category: "agency",
      agencyType: "municipal-police",
      status: "verified",
      portalUrl: "https://transparency.flocksafety.com/austin-tx-pd/",
      portalSlug: "austin-tx-pd",
    },
  ];

  it("filters by state correctly", () => {
    const resultCA = filterDirectoryEntries(sampleEntries, { state: "CA" });
    expect(resultCA.total).toBe(1);
    expect(resultCA.items[0].stateCode).toBe("CA");

    const resultOH = filterDirectoryEntries(sampleEntries, { state: "OH" });
    expect(resultOH.total).toBe(1);
    expect(resultOH.items[0].name).toBe("Akron Police Department");
  });

  it("filters by status correctly", () => {
    const verified = filterDirectoryEntries(sampleEntries, { status: "verified" });
    expect(verified.total).toBe(3);

    const unverified = filterDirectoryEntries(sampleEntries, { status: "unverified" });
    expect(unverified.total).toBe(1);
    expect(unverified.items[0].name).toBe("Autauga County");
  });

  it("searches across name, jurisdiction, state name, state code, and slug", () => {
    const resState = filterDirectoryEntries(sampleEntries, { searchQuery: "TX" });
    expect(resState.total).toBe(1);
    expect(resState.items[0].name).toBe("Austin Police Department");

    const resCity = filterDirectoryEntries(sampleEntries, { searchQuery: "Akron" });
    expect(resCity.total).toBe(1);
    expect(resCity.items[0].portalSlug).toBe("akron-oh-pd");

    const resSlug = filterDirectoryEntries(sampleEntries, { searchQuery: "alameda-county" });
    expect(resSlug.total).toBe(1);
  });

  it("paginates entries correctly at specified page size", () => {
    const res = filterDirectoryEntries(sampleEntries, { page: 1, pageSize: 2 });
    expect(res.total).toBe(4);
    expect(res.totalPages).toBe(2);
    expect(res.items).toHaveLength(2);
    expect(res.hasNext).toBe(true);
    expect(res.hasPrev).toBe(false);

    const page2 = filterDirectoryEntries(sampleEntries, { page: 2, pageSize: 2 });
    expect(page2.items).toHaveLength(2);
    expect(page2.page).toBe(2);
    expect(page2.hasPrev).toBe(true);
    expect(page2.hasNext).toBe(false);
  });
});
