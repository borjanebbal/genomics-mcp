import type { MatchMode } from "../types/common.js";
import type { DatasetStats, SnpRecord, TraitSummary } from "../types/snp.js";

export interface ISnpRepository {
  initialize(): Promise<void>;
  findByTraits(traits: string[], matchMode: MatchMode): Promise<SnpRecord[]>;
  findByRsid(rsid: string): Promise<SnpRecord | null>;
  listTraits(search?: string): Promise<TraitSummary[]>;
  getStats(): Promise<DatasetStats>;
  /**
   * Extension point: returns every SNP in the dataset as an ordered snapshot.
   * Not used by any current tool or service; reserved for future bulk-export
   * or admin tooling. Implementations must return a copy — callers must not
   * mutate the result.
   */
  getAllSnps(): Promise<SnpRecord[]>;
}
