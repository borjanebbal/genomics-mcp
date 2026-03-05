import type { DatasetMetadata, SnpRecord, TraitSummary } from "../types/snp.js";

export interface ISnpRepository {
  initialize(): Promise<void>;
  findByTraits(traits: string[], matchMode: "any" | "all"): Promise<SnpRecord[]>;
  findByRsid(rsid: string): Promise<SnpRecord | null>;
  listTraits(search?: string): Promise<TraitSummary[]>;
  getMetadata(): Promise<DatasetMetadata>;
  getAllSnps(): Promise<SnpRecord[]>;
}
