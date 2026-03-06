import { z } from "zod";
import { normalizeGenotype } from "../utils/genotype.js";

export const RiskLevelSchema = z.enum([
  "informational",
  "protective",
  "increased_risk",
  "high_risk",
]);

export const StudyTypeSchema = z.enum([
  "meta_analysis",
  "cohort_study",
  "case_control",
  "gwas",
  "database",
  "review",
]);

export const GenotypeEffectSchema = z.object({
  summary: z.string().min(1).max(500),
  detail: z.string().min(1).max(2000),
  risk_level: RiskLevelSchema,
});

export const SourceSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  study_type: StudyTypeSchema,
});

export const PopulationFrequencySchema = z.object({
  global_maf: z.number().min(0).max(1),
  populations: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

export const SnpRecordSchema = z.object({
  rsid: z.string().regex(/^rs\d+$/, "Invalid rsID format"),
  genes: z.array(z.string().min(1).max(50)).min(1).max(20),
  traits: z.array(z.string().min(1).max(100)).min(1).max(50),
  description: z.string().min(1).max(1000),
  chromosome: z.string().min(1).max(10),
  position: z.number().int().min(1),
  reference_allele: z
    .string()
    .regex(/^[ACGT]+$/i)
    .min(1)
    .max(100),
  risk_allele: z
    .string()
    .regex(/^[ACGT]+$/i)
    .min(1)
    .max(100)
    .optional(),
  effects_by_genotype: z
    .record(z.string().regex(/^[ACGT]{2}$/i), GenotypeEffectSchema)
    .refine((effects) => Object.keys(effects).length > 0, {
      message: "At least one genotype effect is required",
    })
    .transform((effects) => {
      // Canonicalise all keys to sorted uppercase (e.g. "GA" → "AG") so that
      // normalizeGenotype() lookups always match regardless of how the seed data
      // was authored.
      const canonical: Record<string, z.infer<typeof GenotypeEffectSchema>> = {};
      for (const [key, value] of Object.entries(effects)) {
        canonical[normalizeGenotype(key)] = value;
      }
      return canonical;
    }),
  sources: z.array(SourceSchema).min(1).max(50),
  population_frequency: PopulationFrequencySchema.optional(),
  last_updated: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const SnpArraySchema = z.array(SnpRecordSchema);
