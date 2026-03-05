import type { z } from "zod";
import type { RiskLevelSchema, StudyTypeSchema } from "../schemas/snp.schemas.js";
import type { MatchModeSchema, ResponseFormatSchema } from "../schemas/tool-inputs.schemas.js";

export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

export type MatchMode = z.infer<typeof MatchModeSchema>;

export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export type StudyType = z.infer<typeof StudyTypeSchema>;

export interface PaginationMetadata {
  total: number;
  count: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
}
