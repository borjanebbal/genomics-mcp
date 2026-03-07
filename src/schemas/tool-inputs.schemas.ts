import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  GENOTYPE_PATTERN,
  MAX_LIMIT,
  MAX_TRAITS_PER_QUERY,
  RSID_PATTERN,
} from "../constants.js";

export const ResponseFormatSchema = z.enum(["markdown", "json"]);

export const MatchModeSchema = z.enum(["any", "all"]);

export const SearchByTraitInputSchema = z.object({
  traits: z
    .array(z.string().min(1).max(100).describe("Trait slug (e.g., 'alzheimer_risk')"))
    .min(1, "At least one trait is required")
    .max(MAX_TRAITS_PER_QUERY, `Maximum ${MAX_TRAITS_PER_QUERY} traits per query`)
    .describe(
      "List of trait slugs to search for (e.g., ['alzheimer_risk', 'memory']). Use underscores, not spaces."
    ),
  match_mode: MatchModeSchema.default("any").describe(
    "'any' returns SNPs matching ANY trait (union); 'all' returns SNPs matching ALL traits (intersection)"
  ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT)
    .describe(`Maximum results to return (1-${MAX_LIMIT})`),
  offset: z
    .number()
    .int()
    .min(0)
    .default(DEFAULT_OFFSET)
    .describe("Number of results to skip for pagination"),
  response_format: ResponseFormatSchema.default("markdown").describe(
    "Output format: 'markdown' for human-readable or 'json' for machine-readable"
  ),
});

export const GetSnpDetailsInputSchema = z.object({
  rsid: z
    .string()
    .regex(RSID_PATTERN, "Must be a valid rsID format (e.g., 'rs429358', 'rs7412')")
    .describe("The rsID of the SNP to look up (e.g., 'rs429358')"),
  response_format: ResponseFormatSchema.default("markdown").describe(
    "Output format: 'markdown' for human-readable or 'json' for machine-readable"
  ),
});

export const InterpretGenotypeInputSchema = z.object({
  rsid: z
    .string()
    .regex(RSID_PATTERN, "Must be a valid rsID format (e.g., 'rs429358', 'rs7412')")
    .describe("The rsID of the SNP to interpret"),
  genotype: z
    .string()
    .regex(
      GENOTYPE_PATTERN,
      "Must be exactly 2 nucleotide letters: A, C, G, or T (e.g., 'AG', 'TT', 'CC')"
    )
    .describe(
      "The user's genotype for this SNP - two alleles like 'AG', 'TT', 'CC'. Order doesn't matter (AG = GA)."
    ),
  response_format: ResponseFormatSchema.default("markdown").describe(
    "Output format: 'markdown' for human-readable or 'json' for machine-readable"
  ),
});

export const ListTraitsInputSchema = z.object({
  search: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional search filter for trait names (case-insensitive partial match)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .describe(`Maximum traits to return (1-${MAX_LIMIT}). Omit to return all matching traits`),
  offset: z
    .number()
    .int()
    .min(0)
    .default(DEFAULT_OFFSET)
    .describe("Number of traits to skip for pagination"),
  response_format: ResponseFormatSchema.default("markdown").describe(
    "Output format: 'markdown' for human-readable or 'json' for machine-readable"
  ),
});

export const GetMetadataInputSchema = z.object({
  response_format: ResponseFormatSchema.default("markdown").describe(
    "Output format: 'markdown' for human-readable or 'json' for machine-readable"
  ),
});

export type SearchByTraitInput = z.infer<typeof SearchByTraitInputSchema>;
export type GetSnpDetailsInput = z.infer<typeof GetSnpDetailsInputSchema>;
export type InterpretGenotypeInput = z.infer<typeof InterpretGenotypeInputSchema>;
export type ListTraitsInput = z.infer<typeof ListTraitsInputSchema>;
export type GetMetadataInput = z.infer<typeof GetMetadataInputSchema>;
