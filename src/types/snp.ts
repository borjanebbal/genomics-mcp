import type { RiskLevel, StudyType } from "./common.js";

export interface GenotypeEffect {
  summary: string;
  detail: string;
  risk_level: RiskLevel;
}

export interface Source {
  name: string;
  url: string;
  study_type: StudyType;
}

export interface PopulationFrequency {
  global_maf: number;
  populations?: {
    [population: string]: number;
  };
}

export interface SnpRecord {
  rsid: string;
  genes: string[];
  traits: string[];
  description: string;
  chromosome: string;
  position: number;
  reference_allele: string;
  risk_allele?: string;
  effects_by_genotype: {
    [genotype: string]: GenotypeEffect;
  };
  sources: Source[];
  population_frequency?: PopulationFrequency;
  last_updated: string;
}

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
