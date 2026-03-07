import type { MatchMode } from "../types/common.js";
import type { DatasetStats, SnpRecord, TraitSummary } from "../types/snp.js";

export interface ISnpRepository {
  initialize(): Promise<void>;
  findByTraits(traits: string[], matchMode: MatchMode): Promise<SnpRecord[]>;
  findByRsid(rsid: string): Promise<SnpRecord | null>;
  listTraits(search?: string): Promise<TraitSummary[]>;
  getStats(): Promise<DatasetStats>;
  getAllSnps(): Promise<SnpRecord[]>;
}
