import type { ISnpRepository } from "../repositories/snp.repository.js";
import type { MatchMode, PaginationMetadata } from "../types/common.js";
import type { SnpRecord, SnpSummary } from "../types/snp.js";

export class SearchByTraitUseCase {
  constructor(private readonly repository: ISnpRepository) {}

  async execute(
    traits: string[],
    matchMode: MatchMode,
    limit: number,
    offset: number
  ): Promise<{ snps: SnpSummary[]; pagination: PaginationMetadata }> {
    const allMatches = await this.repository.findByTraits(traits, matchMode);

    const total = allMatches.length;
    const paginated = allMatches.slice(offset, offset + limit);
    const summaries = paginated.map((snp) => this.toSnpSummary(snp));

    const pagination: PaginationMetadata = {
      total,
      count: summaries.length,
      offset,
      has_more: offset + summaries.length < total,
      next_offset: offset + summaries.length < total ? offset + summaries.length : undefined,
    };

    return { snps: summaries, pagination };
  }

  private toSnpSummary(snp: SnpRecord): SnpSummary {
    return {
      rsid: snp.rsid,
      genes: snp.genes,
      traits: snp.traits,
      description: snp.description,
      source_count: snp.sources.length,
      genotype_count: Object.keys(snp.effects_by_genotype).length,
    };
  }
}
