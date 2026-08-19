import { describe, expect, it } from "vitest";
import {
  getCountyByFips,
  getCountyRepresentatives,
} from "../lib/representatives";

describe("county representative directory", () => {
  it("returns the county associated with an exact five-digit FIPS code", () => {
    expect(getCountyByFips("06003")?.name).toBe("Alpine County");
    expect(getCountyByFips("6003")).toBeUndefined();
  });

  it("lists every matched state legislative district without duplicate people", () => {
    const representatives = getCountyRepresentatives("06001");
    const ids = representatives.map((person) => person.id);

    expect(representatives.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
    expect(representatives.every((person) => person.stateCode === "CA")).toBe(true);
    expect(representatives.some((person) => person.chamber === "State House")).toBe(true);
    expect(representatives.some((person) => person.chamber === "State Senate")).toBe(true);
  });

  it("includes actionable public contact details when available", () => {
    const representatives = getCountyRepresentatives("06003");

    expect(representatives.length).toBeGreaterThan(0);
    expect(representatives.every((person) => person.officialUrl.startsWith("https://"))).toBe(true);
    expect(representatives.some((person) => Boolean(person.email))).toBe(true);
    expect(representatives.some((person) => Boolean(person.phone))).toBe(true);
  });

  it("matches states whose districts use named rather than numeric labels", () => {
    expect(getCountyRepresentatives("25001").length).toBeGreaterThan(0);
    expect(getCountyRepresentatives("50001").length).toBeGreaterThan(0);
  });
});
