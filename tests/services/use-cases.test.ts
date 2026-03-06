import { describe, expect, it } from "bun:test";
import type { ISnpRepository } from "../../src/repositories/snp.repository.js";
import { GetSnpDetailsUseCase } from "../../src/services/get-snp-details.use-case.js";
import { InterpretGenotypeUseCase } from "../../src/services/interpret-genotype.use-case.js";
import { SearchByTraitUseCase } from "../../src/services/search-by-trait.use-case.js";
import type { MatchMode } from "../../src/types/common.js";
import type { DatasetMetadata, SnpRecord, TraitSummary } from "../../src/types/snp.js";

// ---------------------------------------------------------------------------
// In-memory mock repository
// ---------------------------------------------------------------------------

const SNP_A: SnpRecord = {
  rsid: "rs00001",
  genes: ["GENE1"],
  traits: ["trait_a", "trait_shared"],
  description: "SNP A description",
  chromosome: "1",
  position: 1000,
  reference_allele: "A",
  effects_by_genotype: {
    AA: { summary: "Homozygous A", detail: "Detail.", risk_level: "protective" },
    AG: { summary: "Heterozygous", detail: "Detail.", risk_level: "informational" },
    GG: { summary: "Homozygous G", detail: "Detail.", risk_level: "increased_risk" },
  },
  sources: [{ name: "DB", url: "https://example.com/1", study_type: "database" }],
  last_updated: "2025-01-01",
};

const SNP_B: SnpRecord = {
  rsid: "rs00002",
  genes: ["GENE2"],
  traits: ["trait_b", "trait_shared"],
  description: "SNP B description",
  chromosome: "2",
  position: 2000,
  reference_allele: "C",
  effects_by_genotype: {
    CC: { summary: "Homozygous C", detail: "Detail.", risk_level: "informational" },
    CT: { summary: "Heterozygous", detail: "Detail.", risk_level: "increased_risk" },
  },
  sources: [{ name: "DB", url: "https://example.com/2", study_type: "database" }],
  last_updated: "2025-06-01",
};

const ALL_SNPS = [SNP_A, SNP_B];

function makeMockRepo(snps: SnpRecord[] = ALL_SNPS): ISnpRepository {
  const byRsid = new Map(snps.map((s) => [s.rsid.toLowerCase(), s]));

  return {
    initialize: async () => {},
    getAllSnps: async () => [...snps],
    findByRsid: async (rsid) => byRsid.get(rsid.toLowerCase()) ?? null,
    findByTraits: async (traits, matchMode: MatchMode) => {
      const normalized = traits.map((t) => t.toLowerCase());
      return snps.filter((snp) => {
        const snpTraits = snp.traits.map((t) => t.toLowerCase());
        if (matchMode === "all") {
          return normalized.every((t) => snpTraits.includes(t));
        }
        return normalized.some((t) => snpTraits.includes(t));
      });
    },
    listTraits: async (search?: string): Promise<TraitSummary[]> => {
      const slugs = new Set(snps.flatMap((s) => s.traits));
      const all = [...slugs].map((slug) => ({
        slug,
        display_name: slug,
        snp_count: snps.filter((s) => s.traits.includes(slug)).length,
      }));
      if (search) {
        return all.filter((t) => t.slug.includes(search.toLowerCase()));
      }
      return all;
    },
    getMetadata: async (): Promise<DatasetMetadata> => ({
      version: "0.1.0",
      total_snps: snps.length,
      total_traits: new Set(snps.flatMap((s) => s.traits)).size,
      last_updated: "2025-06-01",
    }),
  };
}

// ---------------------------------------------------------------------------
// GetSnpDetailsUseCase
// ---------------------------------------------------------------------------

describe("GetSnpDetailsUseCase", () => {
  it("returns the SNP when the rsID is found", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.rsid).toBe("rs00001");
    }
  });

  it("returns an error object when the rsID is not found", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    expect("error" in result).toBe(true);
  });

  it("error message mentions the missing rsID", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    if ("error" in result) {
      expect(result.error).toContain("rs99999");
    }
  });

  it("error message includes the total SNP count from the repository", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    if ("error" in result) {
      expect(result.error).toContain("2"); // 2 SNPs in mock
    }
  });

  it("rsID lookup is case-insensitive", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("RS00001");
    expect("error" in result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// InterpretGenotypeUseCase
// ---------------------------------------------------------------------------

describe("InterpretGenotypeUseCase", () => {
  it("returns a GenotypeInterpretation for a known rsID + genotype", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "AG");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.rsid).toBe("rs00001");
      expect(result.normalized_genotype).toBe("AG");
    }
  });

  it("normalises the input genotype before lookup (GA → AG)", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "GA");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.normalized_genotype).toBe("AG");
      // Raw input preserved on the interpretation object
      expect(result.genotype).toBe("GA");
    }
  });

  it("normalises lowercase input (ag → AG)", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "ag");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.normalized_genotype).toBe("AG");
    }
  });

  it("returns an error when rsID is not found", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999", "AG");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("rs99999");
    }
  });

  it("returns an error when the genotype is not in effects_by_genotype", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "TT");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("TT");
    }
  });

  it("error for unknown genotype includes available genotypes", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "TT");
    if ("error" in result) {
      expect(result.error).toMatch(/AA|AG|GG/);
    }
  });

  it("includes genes and traits on the interpretation result", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "AA");
    if (!("error" in result)) {
      expect(result.genes).toContain("GENE1");
      expect(result.traits).toContain("trait_a");
    }
  });
});

// ---------------------------------------------------------------------------
// SearchByTraitUseCase
// ---------------------------------------------------------------------------

describe("SearchByTraitUseCase", () => {
  it("returns SNP summaries matching the trait in 'any' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(snps).toHaveLength(1);
    expect(snps[0]?.rsid).toBe("rs00001");
  });

  it("returns SNPs matching any trait in 'any' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_b"], "any", 10, 0);
    expect(snps).toHaveLength(2);
  });

  it("returns only SNPs matching all traits in 'all' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_shared"], "all", 10, 0);
    expect(snps).toHaveLength(1);
    expect(snps[0]?.rsid).toBe("rs00001");
  });

  it("returns no results when no SNP satisfies all traits in 'all' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_b"], "all", 10, 0);
    expect(snps).toHaveLength(0);
  });

  it("pagination: limit restricts the number of results returned", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["trait_shared"], "any", 1, 0);
    expect(snps).toHaveLength(1);
    expect(pagination.total).toBe(2);
    expect(pagination.has_more).toBe(true);
  });

  it("pagination: offset skips earlier results", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["trait_shared"], "any", 1, 1);
    expect(snps).toHaveLength(1);
    expect(pagination.offset).toBe(1);
    expect(pagination.has_more).toBe(false);
  });

  it("pagination: next_offset is set when has_more is true", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { pagination } = await useCase.execute(["trait_shared"], "any", 1, 0);
    expect(pagination.next_offset).toBe(1);
  });

  it("pagination: next_offset is undefined when has_more is false", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { pagination } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(pagination.has_more).toBe(false);
    expect(pagination.next_offset).toBeUndefined();
  });

  it("summary includes the correct genotype_count", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    // SNP_A has 3 genotypes: AA, AG, GG
    expect(snps[0]?.genotype_count).toBe(3);
  });

  it("summary includes the correct source_count", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(snps[0]?.source_count).toBe(1);
  });

  it("returns empty results with correct pagination for unknown trait", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["no_such_trait"], "any", 10, 0);
    expect(snps).toHaveLength(0);
    expect(pagination.total).toBe(0);
    expect(pagination.has_more).toBe(false);
  });
});
