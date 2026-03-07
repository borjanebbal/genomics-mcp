import type { z } from "zod";
import type {
  GenotypeEffectSchema,
  PopulationFrequencySchema,
  SnpRecordSchema,
  SourceSchema,
} from "../schemas/snp.schemas.js";
import type { TraitCategory } from "./trait-categories.js";
export type GenotypeEffect = z.infer<typeof GenotypeEffectSchema>;

export type Source = z.infer<typeof SourceSchema>;

export type PopulationFrequency = z.infer<typeof PopulationFrequencySchema>;

export type SnpRecord = z.infer<typeof SnpRecordSchema>;

export interface SnpSummary {
  rsid: string;
  genes: string[];
  traits: string[];
  description: string;
  source_count: number;
  genotype_count: number;
}

export interface TraitSummary {
  slug: string;
  display_name: string;
  snp_count: number;
  category?: TraitCategory;
}

/** Repository-level statistics — no application concerns like version. */
export interface DatasetStats {
  total_snps: number;
  total_traits: number;
  /**
   * ISO date string of the most recently updated SNP in the dataset.
   * `null` when no SNPs have been loaded (empty dataset).
   */
  last_updated: string | null;
}

/** Service-level metadata — enriches DatasetStats with the application version. */
export interface DatasetMetadata extends DatasetStats {
  version: string;
}

export interface GenotypeInterpretation {
  rsid: string;
  genotype: string;
  normalized_genotype: string;
  effect: GenotypeEffect;
  genes: string[];
  traits: string[];
}
