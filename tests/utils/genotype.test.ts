import { describe, expect, it } from "bun:test";
import { normalizeGenotype } from "../../src/utils/genotype.js";

describe("normalizeGenotype", () => {
  it("returns an already-sorted pair unchanged", () => {
    expect(normalizeGenotype("AG")).toBe("AG");
  });

  it("sorts alleles alphabetically (GA → AG)", () => {
    expect(normalizeGenotype("GA")).toBe("AG");
  });

  it("handles homozygous genotypes (AA, CC, GG, TT)", () => {
    expect(normalizeGenotype("AA")).toBe("AA");
    expect(normalizeGenotype("CC")).toBe("CC");
    expect(normalizeGenotype("GG")).toBe("GG");
    expect(normalizeGenotype("TT")).toBe("TT");
  });

  it("normalises all four heterozygous combos to canonical form", () => {
    expect(normalizeGenotype("AC")).toBe("AC");
    expect(normalizeGenotype("CA")).toBe("AC");
    expect(normalizeGenotype("AT")).toBe("AT");
    expect(normalizeGenotype("TA")).toBe("AT");
    expect(normalizeGenotype("CG")).toBe("CG");
    expect(normalizeGenotype("GC")).toBe("CG");
    expect(normalizeGenotype("CT")).toBe("CT");
    expect(normalizeGenotype("TC")).toBe("CT");
    expect(normalizeGenotype("GT")).toBe("GT");
    expect(normalizeGenotype("TG")).toBe("GT");
  });

  it("uppercases lowercase input (ga → AG)", () => {
    expect(normalizeGenotype("ga")).toBe("AG");
    expect(normalizeGenotype("ag")).toBe("AG");
    expect(normalizeGenotype("aa")).toBe("AA");
  });

  it("uppercases mixed-case input", () => {
    expect(normalizeGenotype("Ag")).toBe("AG");
    expect(normalizeGenotype("gA")).toBe("AG");
  });
});
