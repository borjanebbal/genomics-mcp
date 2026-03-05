export type ResponseFormat = "markdown" | "json";

export type MatchMode = "any" | "all";

export type RiskLevel = "informational" | "protective" | "increased_risk" | "high_risk";

export type StudyType =
  | "meta_analysis"
  | "cohort_study"
  | "case_control"
  | "gwas"
  | "database"
  | "review";

export interface PaginationMetadata {
  total: number;
  count: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
}
