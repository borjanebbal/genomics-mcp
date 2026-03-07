import { describe, expect, it } from "bun:test";
import type { PaginationMetadata } from "../../src/types/common.js";
import type {
  GenotypeInterpretation,
  SnpRecord,
  SnpSummary,
  TraitSummary,
} from "../../src/types/snp.js";
import {
  formatGenotypeInterpretationMarkdown,
  formatSearchResultsMarkdown,
  formatSnpDetailsMarkdown,
  formatTraitListMarkdown,
  truncateIfNeeded,
} from "../../src/utils/formatting.js";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const SUMMARY: SnpSummary = {
  rsid: "rs53576",
  genes: ["OXTR"],
  traits: ["social_behavior", "empathy"],
  description: "Oxytocin receptor variant",
  source_count: 2,
  genotype_count: 3,
};

const PAGINATION_SINGLE: PaginationMetadata = {
  total: 1,
  count: 1,
  offset: 0,
  has_more: false,
};

const PAGINATION_EMPTY: PaginationMetadata = {
  total: 0,
  count: 0,
  offset: 0,
  has_more: false,
};

const PAGINATION_HAS_MORE: PaginationMetadata = {
  total: 10,
  count: 5,
  offset: 0,
  has_more: true,
  next_offset: 5,
};

const SNP_RECORD: SnpRecord = {
  rsid: "rs53576",
  genes: ["OXTR"],
  traits: ["social_behavior", "empathy"],
  description: "Oxytocin receptor variant",
  chromosome: "3",
  position: 8762685,
  reference_allele: "G",
  risk_allele: "A",
  effects_by_genotype: {
    GG: { summary: "Enhanced empathy", detail: "High empathy.", risk_level: "protective" },
    AG: { summary: "Moderate", detail: "Average.", risk_level: "informational" },
    AA: { summary: "Lower empathy", detail: "Reduced empathy.", risk_level: "increased_risk" },
  },
  sources: [
    { name: "SNPedia", url: "https://www.snpedia.com/index.php/Rs53576", study_type: "database" },
  ],
  population_frequency: { global_maf: 0.35 },
  last_updated: "2025-01-15",
};

const INTERPRETATION: GenotypeInterpretation = {
  rsid: "rs53576",
  genotype: "AG",
  normalized_genotype: "AG",
  effect: { summary: "Moderate", detail: "Average.", risk_level: "informational" },
  genes: ["OXTR"],
  traits: ["social_behavior"],
};

// ---------------------------------------------------------------------------
// formatSearchResultsMarkdown
// ---------------------------------------------------------------------------

describe("formatSearchResultsMarkdown", () => {
  it("includes the searched trait names in the heading", () => {
    const result = formatSearchResultsMarkdown([SUMMARY], PAGINATION_SINGLE, ["social_behavior"]);
    expect(result).toContain("social_behavior");
  });

  it("shows the rsID for each SNP in results", () => {
    const result = formatSearchResultsMarkdown([SUMMARY], PAGINATION_SINGLE, ["empathy"]);
    expect(result).toContain("rs53576");
  });

  it("shows total and count from pagination", () => {
    const result = formatSearchResultsMarkdown([SUMMARY], PAGINATION_SINGLE, ["empathy"]);
    expect(result).toContain("1");
  });

  it("shows 'no SNPs found' message when result list is empty", () => {
    const result = formatSearchResultsMarkdown([], PAGINATION_EMPTY, ["unknown_trait"]);
    expect(result).toContain("No SNPs found");
  });

  it("shows pagination hint when has_more is true", () => {
    const snps = Array(5).fill(SUMMARY) as SnpSummary[];
    const result = formatSearchResultsMarkdown(snps, PAGINATION_HAS_MORE, ["empathy"]);
    expect(result).toContain("offset=5");
  });

  it("does not show pagination hint when has_more is false", () => {
    const result = formatSearchResultsMarkdown([SUMMARY], PAGINATION_SINGLE, ["empathy"]);
    expect(result).not.toContain("offset=");
  });
});

// ---------------------------------------------------------------------------
// formatSnpDetailsMarkdown
// ---------------------------------------------------------------------------

describe("formatSnpDetailsMarkdown", () => {
  it("includes the rsID as the top-level heading", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    expect(result).toContain("# rs53576");
  });

  it("includes chromosome and position", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    expect(result).toContain("3");
    expect(result).toContain("8,762,685");
  });

  it("includes all genotype keys", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    expect(result).toContain("GG");
    expect(result).toContain("AG");
    expect(result).toContain("AA");
  });

  it("includes source names", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    expect(result).toContain("SNPedia");
  });

  it("shows population frequency when present", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    // 0.35 global MAF → "35.0%"
    expect(result).toContain("35.0%");
  });

  it("omits population frequency section when absent", () => {
    const snpNoFreq: SnpRecord = { ...SNP_RECORD, population_frequency: undefined };
    const result = formatSnpDetailsMarkdown(snpNoFreq);
    expect(result).not.toContain("Population Frequency");
  });

  it("shows risk allele when present", () => {
    const result = formatSnpDetailsMarkdown(SNP_RECORD);
    expect(result).toContain("Risk allele");
  });

  it("omits risk allele line when absent", () => {
    const snpNoRisk: SnpRecord = { ...SNP_RECORD, risk_allele: undefined };
    const result = formatSnpDetailsMarkdown(snpNoRisk);
    expect(result).not.toContain("Risk allele");
  });
});

// ---------------------------------------------------------------------------
// formatGenotypeInterpretationMarkdown
// ---------------------------------------------------------------------------

describe("formatGenotypeInterpretationMarkdown", () => {
  it("includes the rsID in the heading", () => {
    const result = formatGenotypeInterpretationMarkdown(INTERPRETATION);
    expect(result).toContain("rs53576");
  });

  it("shows the raw genotype", () => {
    const result = formatGenotypeInterpretationMarkdown(INTERPRETATION);
    expect(result).toContain("AG");
  });

  it("does not show normalization note when genotype equals normalized_genotype", () => {
    const result = formatGenotypeInterpretationMarkdown(INTERPRETATION);
    expect(result).not.toContain("Normalized to");
  });

  it("shows normalization note when genotype differs from normalized_genotype", () => {
    const interp: GenotypeInterpretation = {
      ...INTERPRETATION,
      genotype: "GA",
      normalized_genotype: "AG",
    };
    const result = formatGenotypeInterpretationMarkdown(interp);
    expect(result).toContain("Normalized to");
    expect(result).toContain("AG");
  });

  it("includes the effect summary", () => {
    const result = formatGenotypeInterpretationMarkdown(INTERPRETATION);
    expect(result).toContain("Moderate");
  });

  it("includes associated traits", () => {
    const result = formatGenotypeInterpretationMarkdown(INTERPRETATION);
    expect(result).toContain("social_behavior");
  });
});

// ---------------------------------------------------------------------------
// formatTraitListMarkdown
// ---------------------------------------------------------------------------

describe("formatTraitListMarkdown", () => {
  it("includes total trait count", () => {
    const traits: TraitSummary[] = [
      { slug: "alzheimer_risk", display_name: "Alzheimer Risk", snp_count: 2 },
      { slug: "empathy", display_name: "Empathy", snp_count: 1 },
    ];
    const result = formatTraitListMarkdown(traits);
    expect(result).toContain("2");
  });

  it("includes each trait slug", () => {
    const traits: TraitSummary[] = [
      { slug: "alzheimer_risk", display_name: "Alzheimer Risk", snp_count: 2 },
    ];
    const result = formatTraitListMarkdown(traits);
    expect(result).toContain("alzheimer_risk");
  });

  it("groups categorised traits under their category heading", () => {
    const traits: TraitSummary[] = [
      {
        slug: "alzheimer_risk",
        display_name: "Alzheimer Risk",
        snp_count: 2,
        category: "Neurological",
      },
      { slug: "empathy", display_name: "Empathy", snp_count: 1, category: "Neurological" },
    ];
    const result = formatTraitListMarkdown(traits);
    expect(result).toContain("## Neurological");
  });

  it("renders uncategorised traits without a category heading when all are uncategorised", () => {
    const traits: TraitSummary[] = [{ slug: "empathy", display_name: "Empathy", snp_count: 1 }];
    const result = formatTraitListMarkdown(traits);
    expect(result).not.toContain("## Other");
  });

  it("renders an 'Other' section for uncategorised traits when some are categorised", () => {
    const traits: TraitSummary[] = [
      {
        slug: "alzheimer_risk",
        display_name: "Alzheimer Risk",
        snp_count: 2,
        category: "Neurological",
      },
      { slug: "empathy", display_name: "Empathy", snp_count: 1 },
    ];
    const result = formatTraitListMarkdown(traits);
    expect(result).toContain("## Other");
    expect(result).toContain("empathy");
  });

  it("handles an empty trait list gracefully", () => {
    const result = formatTraitListMarkdown([]);
    expect(result).toContain("0");
  });
});

// ---------------------------------------------------------------------------
// truncateIfNeeded
// ---------------------------------------------------------------------------

describe("truncateIfNeeded", () => {
  it("returns content unchanged when it is within the limit", () => {
    const content = "short text";
    expect(truncateIfNeeded(content, 100)).toBe(content);
  });

  it("returns content unchanged when it exactly equals the limit", () => {
    const content = "a".repeat(100);
    expect(truncateIfNeeded(content, 100)).toBe(content);
  });

  it("truncates and appends a notice when content exceeds the limit", () => {
    const content = "a".repeat(500);
    const result = truncateIfNeeded(content, 300);
    expect(result.length).toBeLessThan(content.length);
    expect(result).toContain("truncated");
  });

  it("the truncated output is shorter than the original", () => {
    const content = "x".repeat(1000);
    const result = truncateIfNeeded(content, 400);
    expect(result.length).toBeLessThan(1000);
  });
});
