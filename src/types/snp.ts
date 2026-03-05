import type { z } from "zod";
import type {
  GenotypeEffectSchema,
  PopulationFrequencySchema,
  SnpRecordSchema,
  SourceSchema,
} from "../schemas/snp.schemas.js";
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
  category?: string;
}

export interface DatasetMetadata {
  version: string;
  total_snps: number;
  total_traits: number;
  last_updated: string;
}

export interface GenotypeInterpretation {
  rsid: string;
  genotype: string;
  normalized_genotype: string;
  effect: GenotypeEffect;
  genes: string[];
  traits: string[];
  available_genotypes?: string[];
}
