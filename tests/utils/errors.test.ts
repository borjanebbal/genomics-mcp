import { describe, expect, it } from "bun:test";
import { createGenotypeNotFoundMessage, createSnpNotFoundMessage } from "../../src/utils/errors.js";

describe("createSnpNotFoundMessage", () => {
  it("includes the rsID in the message", () => {
    const msg = createSnpNotFoundMessage("rs1234567", 12);
    expect(msg).toContain("rs1234567");
  });

  it("includes the total SNP count", () => {
    const msg = createSnpNotFoundMessage("rs1234567", 42);
    expect(msg).toContain("42");
  });

  it("mentions how to discover available data", () => {
    const msg = createSnpNotFoundMessage("rs1234567", 12);
    expect(msg).toContain("list_traits");
  });

  it("produces a non-empty string for any valid inputs", () => {
    expect(createSnpNotFoundMessage("rs1", 0).length).toBeGreaterThan(0);
  });
});

describe("createGenotypeNotFoundMessage", () => {
  it("includes the rsID", () => {
    const msg = createGenotypeNotFoundMessage("rs53576", "XY", ["AA", "AG", "GG"]);
    expect(msg).toContain("rs53576");
  });

  it("includes the invalid genotype that was requested", () => {
    const msg = createGenotypeNotFoundMessage("rs53576", "XY", ["AA", "AG", "GG"]);
    expect(msg).toContain("XY");
  });

  it("lists all available genotypes", () => {
    const msg = createGenotypeNotFoundMessage("rs53576", "XY", ["AA", "AG", "GG"]);
    expect(msg).toContain("AA");
    expect(msg).toContain("AG");
    expect(msg).toContain("GG");
  });

  it("handles a single available genotype", () => {
    const msg = createGenotypeNotFoundMessage("rs001", "TT", ["AA"]);
    expect(msg).toContain("AA");
  });

  it("handles an empty available genotype list gracefully", () => {
    const msg = createGenotypeNotFoundMessage("rs001", "TT", []);
    expect(msg.length).toBeGreaterThan(0);
  });
});
