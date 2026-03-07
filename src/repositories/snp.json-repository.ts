import { readFile } from "node:fs/promises";
import { SnpArraySchema } from "../schemas/snp.schemas.js";
import type { MatchMode } from "../types/common.js";
import type { DatasetStats, SnpRecord, TraitSummary } from "../types/snp.js";
import { TRAIT_CATEGORIES, TRAIT_DISPLAY_NAMES } from "../types/trait-categories.js";
import { createLogger } from "../utils/logger.js";
import type { ISnpRepository } from "./snp.repository.js";

const logger = createLogger("JsonSnpRepository");

/**
 * Returns the authoritative display name for a trait slug.
 * Checks `TRAIT_DISPLAY_NAMES` first; falls back to auto-generated Title Case.
 * Exported so that test helpers can reuse the same logic without duplication.
 */
export function slugToDisplayName(slug: string): string {
  if (slug in TRAIT_DISPLAY_NAMES) {
    return TRAIT_DISPLAY_NAMES[slug] as string;
  }
  return slug
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export class JsonSnpRepository implements ISnpRepository {
  private snps: SnpRecord[] = [];
  private traitIndex: Map<string, Set<number>> = new Map();
  private rsidIndex: Map<string, number> = new Map();
  private initialized = false;

  constructor(private readonly dataFilePath: string) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const fileContent = await readFile(this.dataFilePath, "utf-8");
      const rawData = JSON.parse(fileContent);
      const validatedData = SnpArraySchema.parse(rawData);
      this.snps = validatedData;
      this.buildIndexes();
      this.initialized = true;
      logger.info(`Loaded ${this.snps.length} SNPs from ${this.dataFilePath}`);
    } catch (error) {
      logger.error("Failed to initialize:", error);
      throw new Error(
        `Failed to load SNP data from ${this.dataFilePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private buildIndexes(): void {
    this.traitIndex.clear();
    this.rsidIndex.clear();

    for (let i = 0; i < this.snps.length; i++) {
      const snp = this.snps[i];
      const normalizedRsid = snp.rsid.toLowerCase();

      if (this.rsidIndex.has(normalizedRsid)) {
        throw new Error(
          `Duplicate rsID "${snp.rsid}" found at index ${i} — each rsID must be unique in the dataset`
        );
      }
      this.rsidIndex.set(normalizedRsid, i);

      for (const trait of snp.traits) {
        const normalizedTrait = trait.toLowerCase();
        if (!this.traitIndex.has(normalizedTrait)) {
          this.traitIndex.set(normalizedTrait, new Set());
        }
        this.traitIndex.get(normalizedTrait)!.add(i);
      }
    }
  }

  async findByTraits(traits: string[], matchMode: MatchMode): Promise<SnpRecord[]> {
    this.ensureInitialized();

    if (traits.length === 0) {
      return [];
    }

    const normalizedTraits = traits.map((t) => t.toLowerCase());
    const matchingSets: Set<number>[] = [];

    for (const trait of normalizedTraits) {
      const indices = this.traitIndex.get(trait);
      if (indices) {
        matchingSets.push(indices);
      } else if (matchMode === "all") {
        // In "all" mode, every trait must have at least one SNP.
        // A missing trait means no SNP can satisfy the intersection.
        return [];
      }
    }

    if (matchingSets.length === 0) {
      return [];
    }

    let resultIndices: Set<number>;

    if (matchMode === "all") {
      // Copy the first set to avoid mutating the internal trait index
      resultIndices = new Set(matchingSets[0]);
      for (let i = 1; i < matchingSets.length; i++) {
        resultIndices = new Set([...resultIndices].filter((idx) => matchingSets[i].has(idx)));
      }
    } else {
      resultIndices = new Set<number>();
      for (const set of matchingSets) {
        for (const idx of set) {
          resultIndices.add(idx);
        }
      }
    }

    return [...resultIndices].map((idx) => this.snps[idx]);
  }

  async findByRsid(rsid: string): Promise<SnpRecord | null> {
    this.ensureInitialized();

    const index = this.rsidIndex.get(rsid.toLowerCase());
    if (index === undefined) {
      return null;
    }

    return this.snps[index];
  }

  async listTraits(search?: string): Promise<TraitSummary[]> {
    this.ensureInitialized();

    let traits: TraitSummary[] = [...this.traitIndex.entries()].map(([slug, indices]) => ({
      slug,
      display_name: slugToDisplayName(slug),
      snp_count: indices.size,
      category: TRAIT_CATEGORIES[slug],
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      traits = traits.filter(
        (t) => t.slug.includes(searchLower) || t.display_name.toLowerCase().includes(searchLower)
      );
    }

    traits.sort((a, b) => a.slug.localeCompare(b.slug));

    return traits;
  }

  async getStats(): Promise<DatasetStats> {
    this.ensureInitialized();

    if (this.snps.length === 0) {
      return {
        total_snps: 0,
        total_traits: this.traitIndex.size,
        last_updated: null,
      };
    }

    const lastUpdated = this.snps.reduce((latest, snp) => {
      return snp.last_updated > latest ? snp.last_updated : latest;
    }, this.snps[0]!.last_updated);

    return {
      total_snps: this.snps.length,
      total_traits: this.traitIndex.size,
      last_updated: lastUpdated,
    };
  }

  async getAllSnps(): Promise<SnpRecord[]> {
    this.ensureInitialized();
    return [...this.snps];
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Repository not initialized. Call initialize() first.");
    }
  }
}
