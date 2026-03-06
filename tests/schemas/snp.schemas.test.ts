import { describe, expect, it } from "bun:test";
import { SnpArraySchema, SnpRecordSchema } from "../../src/schemas/snp.schemas.js";

// ---------------------------------------------------------------------------
// Minimal valid SNP fixture — reused across tests
// ---------------------------------------------------------------------------

const VALID_SNP = {
  rsid: "rs53576",
  genes: ["OXTR"],
  traits: ["social_behavior"],
  description: "Test SNP",
  chromosome: "3",
  position: 8762685,
  reference_allele: "G",
  effects_by_genotype: {
    GG: { summary: "Good", detail: "Detail text.", risk_level: "protective" },
    AG: { summary: "Neutral", detail: "Detail text.", risk_level: "informational" },
  },
  sources: [
    { name: "SNPedia", url: "https://www.snpedia.com/index.php/Rs53576", study_type: "database" },
  ],
  last_updated: "2025-01-15",
};

// ---------------------------------------------------------------------------
// SnpRecordSchema — valid input
// ---------------------------------------------------------------------------

describe("SnpRecordSchema — valid input", () => {
  it("parses a minimal valid SNP without error", () => {
    expect(() => SnpRecordSchema.parse(VALID_SNP)).not.toThrow();
  });

  it("accepts an optional risk_allele field", () => {
    const snp = { ...VALID_SNP, risk_allele: "A" };
    const parsed = SnpRecordSchema.parse(snp);
    expect(parsed.risk_allele).toBe("A");
  });

  it("accepts an optional population_frequency field", () => {
    const snp = { ...VALID_SNP, population_frequency: { global_maf: 0.35 } };
    const parsed = SnpRecordSchema.parse(snp);
    expect(parsed.population_frequency?.global_maf).toBe(0.35);
  });

  it("accepts a full ISO datetime string for last_updated", () => {
    const snp = { ...VALID_SNP, last_updated: "2025-01-15T00:00:00.000Z" };
    expect(() => SnpRecordSchema.parse(snp)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// SnpRecordSchema — invalid input
// ---------------------------------------------------------------------------

describe("SnpRecordSchema — invalid input", () => {
  it("rejects an rsID without the 'rs' prefix", () => {
    const snp = { ...VALID_SNP, rsid: "1234567" };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an rsID with letters after the prefix", () => {
    const snp = { ...VALID_SNP, rsid: "rsABC" };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an empty genes array", () => {
    const snp = { ...VALID_SNP, genes: [] };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an empty traits array", () => {
    const snp = { ...VALID_SNP, traits: [] };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an empty effects_by_genotype object", () => {
    const snp = { ...VALID_SNP, effects_by_genotype: {} };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects a genotype key that is not exactly two ACGT characters", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        XY: { summary: "Bad", detail: "Detail.", risk_level: "informational" },
      },
    };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an invalid risk_level value", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        GG: { summary: "Good", detail: "Detail.", risk_level: "unknown_risk" },
      },
    };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects a source with a non-URL string", () => {
    const snp = {
      ...VALID_SNP,
      sources: [{ name: "Bad", url: "not-a-url", study_type: "database" }],
    };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects an empty sources array", () => {
    const snp = { ...VALID_SNP, sources: [] };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects a non-integer position", () => {
    const snp = { ...VALID_SNP, position: 1.5 };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects position 0 (must be >= 1)", () => {
    const snp = { ...VALID_SNP, position: 0 };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SnpRecordSchema — genotype key canonicalisation transform
// ---------------------------------------------------------------------------

describe("SnpRecordSchema — effects_by_genotype key canonicalisation", () => {
  it("sorts an already-canonical key unchanged (AG stays AG)", () => {
    const parsed = SnpRecordSchema.parse(VALID_SNP);
    expect(Object.keys(parsed.effects_by_genotype)).toContain("AG");
  });

  it("canonicalises a reversed key (GA → AG)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        GA: { summary: "Test", detail: "Detail.", risk_level: "informational" as const },
      },
    };
    const parsed = SnpRecordSchema.parse(snp);
    expect(Object.keys(parsed.effects_by_genotype)).toContain("AG");
    expect(Object.keys(parsed.effects_by_genotype)).not.toContain("GA");
  });

  it("uppercases a lowercase key (ag → AG)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        ag: { summary: "Test", detail: "Detail.", risk_level: "informational" as const },
      },
    };
    const parsed = SnpRecordSchema.parse(snp);
    expect(Object.keys(parsed.effects_by_genotype)).toContain("AG");
    expect(Object.keys(parsed.effects_by_genotype)).not.toContain("ag");
  });

  it("preserves the genotype effect value after key canonicalisation", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        GA: {
          summary: "Preserved summary",
          detail: "Preserved detail.",
          risk_level: "protective" as const,
        },
      },
    };
    const parsed = SnpRecordSchema.parse(snp);
    expect(parsed.effects_by_genotype.AG?.summary).toBe("Preserved summary");
  });

  it("canonicalises CG (from IL6-style data) to CG (already sorted)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        CG: { summary: "Test", detail: "Detail.", risk_level: "informational" as const },
      },
    };
    const parsed = SnpRecordSchema.parse(snp);
    // C < G alphabetically → CG is already canonical
    expect(Object.keys(parsed.effects_by_genotype)).toContain("CG");
  });

  it("canonicalises GC to CG", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        GC: { summary: "Test", detail: "Detail.", risk_level: "informational" as const },
      },
    };
    const parsed = SnpRecordSchema.parse(snp);
    expect(Object.keys(parsed.effects_by_genotype)).toContain("CG");
    expect(Object.keys(parsed.effects_by_genotype)).not.toContain("GC");
  });
});

// ---------------------------------------------------------------------------
// SnpRecordSchema — canonical key collision detection
// ---------------------------------------------------------------------------

describe("SnpRecordSchema — canonical key collision detection", () => {
  it("rejects seed data where two keys canonicalise to the same genotype (AG and GA)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        AG: { summary: "First", detail: "Detail.", risk_level: "informational" as const },
        GA: { summary: "Second", detail: "Detail.", risk_level: "protective" as const },
      },
    };
    // Both AG and GA canonicalise to "AG" — the second would silently overwrite the first.
    // The schema must reject this as a data-integrity error rather than silently dropping data.
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects when a lowercase key collides with an uppercase key after canonicalisation (ag and AG)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        ag: { summary: "Lowercase", detail: "Detail.", risk_level: "informational" as const },
        AG: { summary: "Uppercase", detail: "Detail.", risk_level: "protective" as const },
      },
    };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("rejects when a reversed key collides with its canonical form (GC and CG)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        GC: { summary: "Reversed", detail: "Detail.", risk_level: "informational" as const },
        CG: { summary: "Canonical", detail: "Detail.", risk_level: "protective" as const },
      },
    };
    expect(() => SnpRecordSchema.parse(snp)).toThrow();
  });

  it("accepts keys that are distinct after canonicalisation (AG and CC are different)", () => {
    const snp = {
      ...VALID_SNP,
      effects_by_genotype: {
        AG: { summary: "Heterozygous", detail: "Detail.", risk_level: "informational" as const },
        CC: { summary: "Homozygous", detail: "Detail.", risk_level: "protective" as const },
      },
    };
    expect(() => SnpRecordSchema.parse(snp)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// SnpArraySchema
// ---------------------------------------------------------------------------

describe("SnpArraySchema", () => {
  it("parses an array of valid SNPs", () => {
    const parsed = SnpArraySchema.parse([VALID_SNP]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.rsid).toBe("rs53576");
  });

  it("parses an empty array without error", () => {
    expect(() => SnpArraySchema.parse([])).not.toThrow();
  });

  it("fails when any element in the array is invalid", () => {
    const invalid = { ...VALID_SNP, rsid: "bad-id" };
    expect(() => SnpArraySchema.parse([VALID_SNP, invalid])).toThrow();
  });
});
