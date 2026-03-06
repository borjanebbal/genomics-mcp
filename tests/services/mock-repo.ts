import type { ISnpRepository } from "../../src/repositories/snp.repository.js";
import type { MatchMode } from "../../src/types/common.js";
import type { DatasetMetadata, SnpRecord, TraitSummary } from "../../src/types/snp.js";

export const SNP_A: SnpRecord = {
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

export const SNP_B: SnpRecord = {
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

export const ALL_SNPS = [SNP_A, SNP_B];

export function makeMockRepo(snps: SnpRecord[] = ALL_SNPS): ISnpRepository {
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
