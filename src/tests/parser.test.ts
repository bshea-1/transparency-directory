import { describe, it, expect } from "vitest";
import {
  parseFlockPortalUrlsFromHtml,
  inferAgencyType,
  parsePortalRecordFromUrl,
} from "../lib/parser";

describe("parser", () => {
  it("extracts valid URLs from anchor tags and plain text in HTML", () => {
    const html = `
      <div>
        <p>Check these portals:</p>
        <a href="https://transparency.flocksafety.com/alameda-county-ca-so/">Alameda</a>
        <a href="https://transparency.flocksafety.com/akron-oh-pd">Akron</a>
        <a href="https://other.com/link">Invalid</a>
        <span>https://transparency.flocksafety.com/austin-tx-pd/</span>
      </div>
    `;

    const extracted = parseFlockPortalUrlsFromHtml(html);
    expect(extracted).toHaveLength(3);
    expect(extracted).toContain("https://transparency.flocksafety.com/alameda-county-ca-so/");
    expect(extracted).toContain("https://transparency.flocksafety.com/akron-oh-pd/");
    expect(extracted).toContain("https://transparency.flocksafety.com/austin-tx-pd/");
  });

  it("infers agency types correctly", () => {
    expect(inferAgencyType(["alameda", "county", "ca", "so"])).toBe("county-sheriff");
    expect(inferAgencyType(["arlington", "county", "va", "pd"])).toBe("county-police");
    expect(inferAgencyType(["akron", "oh", "pd"])).toBe("municipal-police");
    expect(inferAgencyType(["case", "western", "university", "oh", "pd"])).toBe("university-police");
    expect(inferAgencyType(["catawba", "nation", "tribal", "sc", "pd"])).toBe("tribal-police");
    expect(inferAgencyType(["columbus", "regional", "airport", "authority", "oh", "pd"])).toBe("special-district");
  });

  it("parses portal records with state, type, and human-readable names", () => {
    const record1 = parsePortalRecordFromUrl(
      "https://transparency.flocksafety.com/alameda-county-ca-so/"
    );
    expect(record1).not.toBeNull();
    expect(record1?.stateCode).toBe("CA");
    expect(record1?.stateName).toBe("California");
    expect(record1?.agencyType).toBe("county-sheriff");
    expect(record1?.isCountyLevel).toBe(true);

    const record2 = parsePortalRecordFromUrl(
      "https://transparency.flocksafety.com/austin-tx-pd/"
    );
    expect(record2).not.toBeNull();
    expect(record2?.stateCode).toBe("TX");
    expect(record2?.stateName).toBe("Texas");
    expect(record2?.agencyType).toBe("municipal-police");
    expect(record2?.agencyName).toContain("Austin");
  });
});
